import { NextRequest, NextResponse } from 'next/server'
import { tryFetchDirectMedia } from '@/lib/server/cloudinaryRemoteUpload'

// Extra.ge (a Georgian multi-merchant marketplace) exposes its own frontend's public API
// directly — no auth header, no bot protection, just a product URL's three path segments
// (slug/productSecondaryId/offerSecondaryId) plugged into the catalog API.
const CATALOG_API_BASE = 'https://catalog-api.extra.ge/api/product'
const PRODUCT_URL_PATTERN = /\/product\/([^/]+)\/(\d+)\/(\d+)/

interface ExtraSpecAttribute {
  attributeName?: string | null
  value?: string | null
}

interface ExtraOffer {
  originalPrice?: number | null
  discountPrice?: number | null
}

interface ExtraProduct {
  title?: string | null
  description?: string | null
  imageUrls?: string[] | null
  mainImageUrl?: string | null
  specificationAttributes?: ExtraSpecAttribute[] | null
  offer?: ExtraOffer | null
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

interface ProductRef {
  slug: string
  productSecondaryId: string
  offerSecondaryId: string
}

function extractProductRef(url: string): ProductRef | null {
  const match = url.trim().match(PRODUCT_URL_PATTERN)
  if (!match) return null
  return { slug: match[1], productSecondaryId: match[2], offerSecondaryId: match[3] }
}

function buildAttributeLines(attributes: ExtraSpecAttribute[]): string[] {
  return attributes
    .map(attr => {
      const name = attr.attributeName?.trim()
      const value = attr.value?.trim()
      if (!name || !value) return null
      return `${name}: ${value}`
    })
    .filter((line): line is string => line !== null)
}

function buildDescription(product: ExtraProduct): string | null {
  const parts: string[] = []
  if (product.description?.trim()) parts.push(product.description.trim())

  const attributeLines = buildAttributeLines(product.specificationAttributes ?? [])
  if (attributeLines.length > 0) {
    parts.push(`ატრიბუტები:\n${attributeLines.map(line => `• ${line}`).join('\n')}`)
  }

  return parts.length > 0 ? parts.join('\n\n') : null
}

export async function POST(req: NextRequest) {
  let body: { productUrl?: string; slug?: string; productSecondaryId?: string; offerSecondaryId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const ref: ProductRef | null =
    body.slug && body.productSecondaryId && body.offerSecondaryId
      ? { slug: body.slug, productSecondaryId: body.productSecondaryId, offerSecondaryId: body.offerSecondaryId }
      : body.productUrl?.trim()
        ? extractProductRef(body.productUrl.trim())
        : null

  if (!ref) {
    return NextResponse.json({ error: "Couldn't find a product in that link." }, { status: 400 })
  }

  let product: ExtraProduct
  try {
    const requestId = crypto.randomUUID()
    const res = await fetch(
      `${CATALOG_API_BASE}/${ref.slug}/${ref.productSecondaryId}/${ref.offerSecondaryId}?requestId=${requestId}`,
      { headers: { Accept: 'application/json' } }
    )
    if (!res.ok) {
      return NextResponse.json({ error: 'Extra.ge returned no product for that link.' }, { status: 502 })
    }
    product = await res.json()
  } catch (err) {
    console.error('Extra.ge import fetch failed:', err)
    return NextResponse.json({ error: 'Failed to fetch that product from Extra.ge.' }, { status: 502 })
  }

  const sourceImageUrls = product.imageUrls?.length ? product.imageUrls : product.mainImageUrl ? [product.mainImageUrl] : []

  // Sequential, not Promise.all — mirrors the other import routes to avoid several
  // concurrent remote-fetch requests hitting the source CDN's rate limits at once.
  const imageUrls: string[] = []
  for (const url of sourceImageUrls) {
    const resolved = await tryFetchDirectMedia(url, 'image')
    if (resolved) imageUrls.push(resolved)
  }

  const price = product.offer?.discountPrice ?? product.offer?.originalPrice ?? null

  const result: ImportResult = {
    name: product.title?.trim() || null,
    description: buildDescription(product),
    price: typeof price === 'number' ? price : null,
    optionGroups: [],
    categoryId: null,
    imageUrls,
    videoUrl: null,
  }
  return NextResponse.json(result)
}
