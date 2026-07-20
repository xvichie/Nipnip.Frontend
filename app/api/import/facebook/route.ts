import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Used by ImportProductModal for both Facebook and Instagram — the AI extraction and
// Cloudinary re-upload here are platform-agnostic (just caption text + image/video URLs).

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

const ALLOWED_HOSTS = new Set([
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'web.facebook.com',
  'fb.watch',
])

// Facebook serves rich Open Graph meta tags to its own crawler UA even for
// content that would otherwise sit behind a login wall for a normal browser.
// Best-effort only, and only as a fallback — post pages (especially group/profile
// posts) are frequently blocked outright. A directly pasted photo URL is far more
// reliable since Facebook's CDN itself isn't login-gated the way the post page is.
const CRAWLER_USER_AGENT = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'

const anthropic = new Anthropic()

interface Category {
  id: string
  name: string
}

interface ExtractedOptionGroup {
  name: string
  values: string[]
}

interface ExtractedProduct {
  name: string | null
  description: string | null
  price: number | null
  optionGroups: ExtractedOptionGroup[]
  categoryName: string | null
}

interface ImportResult {
  name: string | null
  description: string | null
  price: number | null
  optionGroups: ExtractedOptionGroup[]
  categoryId: string | null
  imageUrls: string[]
  videoUrl: string | null
}

function buildExtractionSchema(categoryNames: string[]) {
  const categoryNameSchema =
    categoryNames.length > 0
      ? { anyOf: [{ type: 'string', enum: categoryNames }, { type: 'null' }] }
      : { type: 'null' }

  return {
    type: 'object',
    properties: {
      name: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      price: { type: ['number', 'null'] },
      optionGroups: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            values: { type: 'array', items: { type: 'string' } },
          },
          required: ['name', 'values'],
          additionalProperties: false,
        },
      },
      categoryName: categoryNameSchema,
    },
    required: ['name', 'description', 'price', 'optionGroups', 'categoryName'],
    additionalProperties: false,
  }
}

function buildSystemPrompt(categoryNames: string[]): string {
  const categorySection =
    categoryNames.length > 0
      ? `\n- categoryName: Pick the single best-matching category from this exact list, copied verbatim: ${categoryNames
          .map(n => `"${n}"`)
          .join(', ')}. Null if none of them clearly fit the product.`
      : ''

  return `You extract structured product-listing data from a raw social media post caption (often Georgian, often with emoji clutter). The post is from a small online store selling a product, possibly with multiple sizes, colors, or other variations.

Return:
- name: A short, clean product name/title (brand + item, e.g. "Converse Chuck Lo"). Strip emoji, hashtags, and marketing filler. Keep the original language of the post.
- description: A short, clean 1-3 sentence description in the original language, with emoji and redundant symbols stripped, but keep useful info (delivery, material, etc.) if present. Null if nothing beyond the name.
- price: A single number if a price is clearly stated. Assume GEL/lari when no currency is explicit. Null if no price is mentioned.
- optionGroups: One entry per distinct kind of variation the post mentions (e.g. Size, Color) — do not invent a group that isn't mentioned. Each entry has a short "name" (e.g. "Size", "Color", "Ზომა", "ფერი" — keep it in the original language) and "values": the list of options for that group, each a short string, in the order listed (e.g. sizes "36,37,38,39,40,41" or colors "შავი, თეთრი, წითელი"). Empty array if no variations are mentioned.${categorySection}

Output nothing except the structured fields.`
}

function isAllowedFacebookUrl(raw: string): URL | null {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return null
  return url
}

function isFetchableUrl(raw: string): URL | null {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  return url
}

function getMetaContent(html: string, property: string): string | null {
  const tagRegex = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]*>`, 'i')
  const tagMatch = html.match(tagRegex)
  if (!tagMatch) return null
  const contentMatch = tagMatch[0].match(/content=["']([^"']*)["']/i)
  return contentMatch ? contentMatch[1] : null
}

// Delegates the actual fetch to Cloudinary (it supports a remote URL as the
// `file` param), so our server never downloads third-party media bytes itself.
async function reuploadToCloudinary(mediaUrl: string, resourceType: 'image' | 'video'): Promise<string | null> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) return mediaUrl // not configured — pass the URL through as-is

  const form = new FormData()
  form.append('file', mediaUrl)
  form.append('upload_preset', UPLOAD_PRESET)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) {
      console.error(`Cloudinary remote-fetch upload failed (${res.status}) for ${mediaUrl}:`, await res.text())
      return null
    }
    const data = (await res.json()) as { secure_url?: string }
    return data.secure_url ?? null
  } catch (err) {
    console.error(`Cloudinary remote-fetch upload threw for ${mediaUrl}:`, err)
    return null
  }
}

// A URL already hosted on this Cloudinary account (e.g. the merchant uploaded a file
// directly in the modal) is already final — re-uploading it would just be a wasteful
// round-trip through Cloudinary fetching from itself, and would reorder results
// relative to the input since resolution happens out of order otherwise.
function isOwnCloudinaryUrl(rawUrl: string): boolean {
  if (!CLOUD_NAME) return false
  try {
    return new URL(rawUrl).hostname === 'res.cloudinary.com' && rawUrl.includes(`/${CLOUD_NAME}/`)
  } catch {
    return false
  }
}

// Preferred path: the merchant pasted the media's own URL (e.g. right-click →
// "Copy image address" on the photo in the post). CDN URLs are usually fetchable
// without the login wall that blocks the post page itself. Facebook video URLs
// rarely work this way (signed, expiring, segmented streams) — direct upload is
// the reliable path for video; this is a bonus for whoever does have a real link.
async function tryFetchDirectMedia(rawUrl: string, resourceType: 'image' | 'video'): Promise<string | null> {
  if (isOwnCloudinaryUrl(rawUrl)) return rawUrl
  const url = isFetchableUrl(rawUrl)
  if (!url) return null
  return reuploadToCloudinary(url.toString(), resourceType)
}

// Fallback path: scrape the post page's og:image / og:video tags in one request.
// Unreliable — many posts (especially group/profile posts) won't return usable
// HTML to this fetch at all, and video URLs Facebook exposes here often expire.
async function tryFetchMediaFromPost(rawUrl: string): Promise<{ imageUrl: string | null; videoUrl: string | null }> {
  const none = { imageUrl: null, videoUrl: null }
  const url = isAllowedFacebookUrl(rawUrl)
  if (!url) return none

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': CRAWLER_USER_AGENT, Accept: 'text/html' },
      signal: controller.signal,
      redirect: 'follow',
    })
    if (!res.ok) return none
    const html = await res.text()

    const rawImageUrl = getMetaContent(html, 'og:image:secure_url') ?? getMetaContent(html, 'og:image')
    const rawVideoUrl = getMetaContent(html, 'og:video:secure_url') ?? getMetaContent(html, 'og:video')

    const [imageUrl, videoUrl] = await Promise.all([
      rawImageUrl ? reuploadToCloudinary(rawImageUrl, 'image') : Promise.resolve(null),
      rawVideoUrl ? reuploadToCloudinary(rawVideoUrl, 'video') : Promise.resolve(null),
    ])

    return { imageUrl, videoUrl }
  } catch {
    return none
  } finally {
    clearTimeout(timeout)
  }
}

async function extractProductInfo(captionText: string, categoryNames: string[]): Promise<ExtractedProduct> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    output_config: {
      format: { type: 'json_schema', schema: buildExtractionSchema(categoryNames) },
    },
    system: buildSystemPrompt(categoryNames),
    messages: [{ role: 'user', content: captionText }],
  })

  const textBlock = message.content.find(block => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Model returned no text content')
  }
  return JSON.parse(textBlock.text) as ExtractedProduct
}

export async function POST(req: NextRequest) {
  let body: { captionText?: string; facebookUrl?: string; imageUrls?: string[]; videoUrl?: string; categories?: Category[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const captionText = body.captionText?.trim()
  if (!captionText) {
    return NextResponse.json({ error: 'Paste the post text first.' }, { status: 400 })
  }

  const categories = body.categories ?? []

  let extracted: ExtractedProduct
  try {
    extracted = await extractProductInfo(captionText, categories.map(c => c.name))
  } catch (err) {
    console.error('Facebook/Instagram import extraction failed:', err)
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: 'AI parsing failed. Try again in a moment.' }, { status: 502 })
    }
    return NextResponse.json({ error: 'Could not parse that post text.' }, { status: 502 })
  }

  const categoryId =
    categories.find(c => c.name.trim().toLowerCase() === extracted.categoryName?.trim().toLowerCase())?.id ?? null

  const pastedImageUrls = (body.imageUrls ?? []).map(u => u.trim()).filter(Boolean)
  const pastedVideoUrl = body.videoUrl?.trim()
  const facebookUrl = body.facebookUrl?.trim()

  // Sequential, not Promise.all — firing several concurrent remote-fetch requests at
  // Facebook's CDN through Cloudinary tends to get some of them rate-limited/blocked.
  const resolvedImageUrls: string[] = []
  for (const url of pastedImageUrls) {
    const resolved = await tryFetchDirectMedia(url, 'image')
    if (resolved) resolvedImageUrls.push(resolved)
  }
  let imageUrls = resolvedImageUrls
  let videoUrl = pastedVideoUrl ? await tryFetchDirectMedia(pastedVideoUrl, 'video') : null

  if ((imageUrls.length === 0 || !videoUrl) && facebookUrl) {
    const scraped = await tryFetchMediaFromPost(facebookUrl)
    if (imageUrls.length === 0 && scraped.imageUrl) imageUrls = [scraped.imageUrl]
    if (!videoUrl) videoUrl = scraped.videoUrl
  }

  const result: ImportResult = {
    name: extracted.name,
    description: extracted.description,
    price: extracted.price,
    optionGroups: extracted.optionGroups,
    categoryId,
    imageUrls,
    videoUrl,
  }
  return NextResponse.json(result)
}
