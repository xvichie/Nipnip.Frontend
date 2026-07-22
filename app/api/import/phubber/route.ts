import { NextRequest, NextResponse } from 'next/server'
import { tryFetchDirectMedia } from '@/lib/server/cloudinaryRemoteUpload'

// Phubber.ge (a Georgian Depop-style resale app) exposes its own frontend's public API
// directly — no Cloudflare challenge like MyMarket, just a shared app-wide Basic auth
// header + Referer that its own SPA sends on every request (not a per-user secret).
const PHUBBER_API_BASE = 'https://phubber.ge'
const PHUBBER_AUTH_HEADER = 'Basic c2l0ZV9waHViYmVyOnBodWJiZXJfMjAxOA=='
const PRODUCT_ID_PATTERN = /\/product\/([a-f0-9]{24})/i

function phubberHeaders(): HeadersInit {
  return {
    Authorization: PHUBBER_AUTH_HEADER,
    Referer: 'https://beta.phubber.ge/',
    Accept: 'application/json, text/plain, */*',
  }
}

interface PhubberImage {
  filename: string
  is_main?: boolean
}

interface PhubberNamedValue {
  value?: string | null
}

interface PhubberColor {
  color?: string | null
}

interface PhubberProduct {
  id: string
  name?: string | null
  description?: string | null
  price?: number | null
  images?: PhubberImage[] | null
  brand?: PhubberNamedValue | null
  size?: PhubberNamedValue | null
  condition?: PhubberNamedValue | null
  color?: PhubberColor | null
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
  if (fromUrl) return fromUrl[1].toLowerCase()
  return /^[a-f0-9]{24}$/i.test(trimmed) ? trimmed.toLowerCase() : null
}

function buildAttributeLines(product: PhubberProduct): string[] {
  const lines: string[] = []
  if (product.brand?.value) lines.push(`ბრენდი: ${product.brand.value}`)
  if (product.size?.value) lines.push(`ზომა: ${product.size.value}`)
  if (product.condition?.value) lines.push(`მდგომარეობა: ${product.condition.value}`)
  if (product.color?.color) lines.push(`ფერი: ${product.color.color}`)
  return lines
}

function buildDescription(product: PhubberProduct): string | null {
  const parts: string[] = []
  if (product.description?.trim()) parts.push(product.description.trim())

  const attributeLines = buildAttributeLines(product)
  if (attributeLines.length > 0) {
    parts.push(`ატრიბუტები:\n${attributeLines.map(line => `• ${line}`).join('\n')}`)
  }

  return parts.length > 0 ? parts.join('\n\n') : null
}

export async function POST(req: NextRequest) {
  let body: { productUrl?: string; productId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const productId = body.productId?.trim() || (body.productUrl?.trim() ? extractProductId(body.productUrl.trim()) : null)
  if (!productId) {
    return NextResponse.json({ error: "Couldn't find a product ID in that link." }, { status: 400 })
  }

  let product: PhubberProduct
  try {
    const res = await fetch(`${PHUBBER_API_BASE}/rest_feed/${productId}/geo`, { headers: phubberHeaders() })
    if (!res.ok) {
      return NextResponse.json({ error: 'Phubber returned no product for that link.' }, { status: 502 })
    }
    product = await res.json()
  } catch (err) {
    console.error('Phubber import fetch failed:', err)
    return NextResponse.json({ error: 'Failed to fetch that product from Phubber.' }, { status: 502 })
  }

  const photoFilenames = (product.images ?? []).map(img => img.filename).filter(Boolean)

  // Sequential, not Promise.all — mirrors the Facebook/MyMarket import routes to avoid
  // several concurrent remote-fetch requests hitting the source CDN's rate limits at once.
  const imageUrls: string[] = []
  for (const filename of photoFilenames) {
    const resolved = await tryFetchDirectMedia(`${PHUBBER_API_BASE}/assets/imgs/products/${filename}`, 'image')
    if (resolved) imageUrls.push(resolved)
  }

  const result: ImportResult = {
    name: product.name?.trim() || null,
    description: buildDescription(product),
    price: typeof product.price === 'number' ? product.price : null,
    optionGroups: [],
    categoryId: null,
    imageUrls,
    videoUrl: null,
  }
  return NextResponse.json(result)
}
