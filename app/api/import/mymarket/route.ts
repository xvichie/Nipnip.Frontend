import { NextRequest, NextResponse } from 'next/server'
import { tryFetchDirectMedia } from '@/lib/server/cloudinaryRemoteUpload'

// MyMarket.ge exposes a public, unauthenticated JSON endpoint for any product page — no
// login wall needed. We just parse the product ID out of the pasted listing URL and fetch
// that endpoint.
//
// Caveat: api.mymarket.ge sits behind a Cloudflare managed challenge that blocks a plain
// server-side fetch almost every time (tested: ~1 success in 7 attempts). A real headless
// browser (see services/mymarket-scraper in the backend repo — Puppeteer + stealth plugin,
// deployed as its own Railway service) reliably gets through instead. When
// MYMARKET_SCRAPER_URL is configured, requests are routed through that service; otherwise
// this falls back to the direct fetch (works occasionally, fails clearly the rest of the time).
const PRODUCT_ID_PATTERN = /\/pr\/(\d+)/

const SCRAPER_URL = process.env.MYMARKET_SCRAPER_URL
const SCRAPER_SECRET = process.env.MYMARKET_SCRAPER_SECRET

interface MyMarketPhoto {
  large?: string
  thumbs?: string
  forEdit?: string
}

interface MyMarketAttribute {
  AttrTitle?: string | null
  AttrValue?: string | null
  AttrValTitle?: string | null
  ValTitles?: string | null
  DimTitle?: string | null
}

interface MyMarketProduct {
  title?: string | null
  descr?: string | null
  price?: string | null
  photos?: MyMarketPhoto[] | null
  attributes?: MyMarketAttribute[] | null
}

interface MyMarketApiResponse {
  statusCode?: number
  data?: { Product?: MyMarketProduct }
}

interface ImportResult {
  name: string | null
  description: string | null
  price: number | null
  optionGroups: never[]
  categoryId: null
  imageUrls: string[]
  videoUrl: null
}

function extractProductId(raw: string): string | null {
  const trimmed = raw.trim()
  const fromUrl = trimmed.match(PRODUCT_ID_PATTERN)
  if (fromUrl) return fromUrl[1]
  return /^\d+$/.test(trimmed) ? trimmed : null
}

// descr comes back as loose HTML (<p>, <strong>, <em>, <u>, <ul><li>, entities like &nbsp;).
// Flatten it to clean plain text so it drops straight into the product description textarea.
function stripHtml(html: string): string {
  return html
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/(p|li|div|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function buildAttributeLines(attributes: MyMarketAttribute[]): string[] {
  return attributes
    .map(attr => {
      const title = attr.AttrTitle?.trim()
      if (!title) return null
      const value =
        attr.AttrValTitle?.trim() ||
        attr.ValTitles?.trim() ||
        (attr.AttrValue?.trim() ? `${attr.AttrValue.trim()}${attr.DimTitle?.trim() ?? ''}` : null)
      if (!value) return null
      return `${title}: ${value}`
    })
    .filter((line): line is string => line !== null)
}

function buildDescription(descr: string | null | undefined, attributes: MyMarketAttribute[] | null | undefined): string | null {
  const parts: string[] = []
  if (descr?.trim()) {
    const stripped = stripHtml(descr)
    if (stripped) parts.push(stripped)
  }

  const attributeLines = buildAttributeLines(attributes ?? [])
  if (attributeLines.length > 0) {
    parts.push(`ატრიბუტები:\n${attributeLines.map(line => `• ${line}`).join('\n')}`)
  }

  return parts.length > 0 ? parts.join('\n\n') : null
}

async function fetchProductJson(productId: string): Promise<MyMarketApiResponse | null> {
  if (SCRAPER_URL) {
    const res = await fetch(`${SCRAPER_URL.replace(/\/$/, '')}/mymarket/product/${productId}`, {
      headers: SCRAPER_SECRET ? { 'x-scraper-secret': SCRAPER_SECRET } : {},
    })
    if (!res.ok) return null
    return res.json()
  }

  const res = await fetch(`https://api.mymarket.ge/api/ka/products/${productId}/`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null
  return res.json()
}

export async function POST(req: NextRequest) {
  let body: { productUrl?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const productUrl = body.productUrl?.trim()
  if (!productUrl) {
    return NextResponse.json({ error: 'Paste a MyMarket product link first.' }, { status: 400 })
  }

  const productId = extractProductId(productUrl)
  if (!productId) {
    return NextResponse.json({ error: "Couldn't find a product ID in that link." }, { status: 400 })
  }

  let apiResponse: MyMarketApiResponse | null
  try {
    apiResponse = await fetchProductJson(productId)
  } catch (err) {
    console.error('MyMarket import fetch failed:', err)
    apiResponse = null
  }

  if (!apiResponse) {
    return NextResponse.json(
      { error: 'MyMarket blocked this request. Wait a moment and try again, or add the product manually.' },
      { status: 502 }
    )
  }

  const product = apiResponse.data?.Product
  if (apiResponse.statusCode !== 200 || !product) {
    return NextResponse.json({ error: 'MyMarket returned no product for that link.' }, { status: 502 })
  }

  const priceValue = product.price ? parseFloat(product.price) : NaN
  const photoUrls = (product.photos ?? []).map(p => p.large).filter((url): url is string => !!url)

  // Sequential, not Promise.all — mirrors the Facebook import route to avoid several
  // concurrent remote-fetch requests hitting the source CDN's rate limits at once.
  const imageUrls: string[] = []
  for (const url of photoUrls) {
    const resolved = await tryFetchDirectMedia(url, 'image')
    if (resolved) imageUrls.push(resolved)
  }

  const result: ImportResult = {
    name: product.title?.trim() || null,
    description: buildDescription(product.descr, product.attributes),
    price: !isNaN(priceValue) ? priceValue : null,
    optionGroups: [],
    categoryId: null,
    imageUrls,
    videoUrl: null,
  }
  return NextResponse.json(result)
}
