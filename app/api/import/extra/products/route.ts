import { NextRequest, NextResponse } from 'next/server'
import type { ExtraProductSummary } from '@/lib/types'

// Mirrors the exact two-step request Extra.ge's own seller page fires when paging through
// a seller's listings (sniffed from extra.ge/seller/{slug}/{id} — clicking a page number):
// first resolve a page of offer IDs, then hydrate those IDs into full listing summaries.
const MERCURY_BASE = 'https://mercury.extra.ge'
const PAGE_SIZE = 45

interface SearchIdsResponse {
  ids?: number[]
  totalCount?: number
}

interface ExtraOfferSummary {
  secondaryId: number
  productSecondaryId: number
  productSlug: string
  productTitle?: string | null
  productMainImageUrl?: string | null
  originalPrice?: number | null
  discountPrice?: number | null
}

interface GimmeResponse {
  data?: ExtraOfferSummary[]
}

export async function GET(req: NextRequest) {
  const sellerId = req.nextUrl.searchParams.get('sellerId')?.trim()
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10) || 1)

  if (!sellerId || !/^\d+$/.test(sellerId)) {
    return NextResponse.json({ error: 'Missing or invalid seller ID.' }, { status: 400 })
  }

  try {
    const idsRes = await fetch(`${MERCURY_BASE}/search/ids?requestId=${crypto.randomUUID()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        priceFrom: null,
        priceTo: null,
        categoryId: null,
        attributes: {},
        sortBy: 0,
        pageNumber: page,
        pageSize: PAGE_SIZE,
        sellerIds: [sellerId],
        isSellerPageRequest: true,
      }),
    })
    if (!idsRes.ok) {
      return NextResponse.json({ error: 'Failed to load products from Extra.ge.' }, { status: 502 })
    }
    const idsData: SearchIdsResponse = await idsRes.json()
    const ids = idsData.ids ?? []

    if (ids.length === 0) {
      return NextResponse.json({ products: [], currentPage: page, totalPages: 1 })
    }

    const gimmeRes = await fetch(`${MERCURY_BASE}/offers/gimme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ids }),
    })
    if (!gimmeRes.ok) {
      return NextResponse.json({ error: 'Failed to load products from Extra.ge.' }, { status: 502 })
    }
    const gimmeData: GimmeResponse = await gimmeRes.json()

    const products: ExtraProductSummary[] = (gimmeData.data ?? []).map(offer => {
      const price = offer.discountPrice ?? offer.originalPrice
      return {
        offerSecondaryId: offer.secondaryId,
        productSecondaryId: offer.productSecondaryId,
        slug: offer.productSlug,
        title: offer.productTitle?.trim() || 'Untitled',
        price: typeof price === 'number' ? price : null,
        thumbnailUrl: offer.productMainImageUrl ?? null,
      }
    })

    const totalCount = idsData.totalCount ?? products.length

    return NextResponse.json({
      products,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    })
  } catch (err) {
    console.error('Extra.ge products list fetch failed:', err)
    return NextResponse.json({ error: 'Failed to load products from Extra.ge.' }, { status: 502 })
  }
}
