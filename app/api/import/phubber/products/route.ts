import { NextRequest, NextResponse } from 'next/server'
import type { PhubberProductSummary } from '@/lib/types'

const PHUBBER_API_BASE = 'https://phubber.ge'
const PHUBBER_AUTH_HEADER = 'Basic c2l0ZV9waHViYmVyOnBodWJiZXJfMjAxOA=='
const PAGE_SIZE = 24

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

interface PhubberListProduct {
  id: string
  name?: string | null
  price?: number | null
  images?: PhubberImage[] | null
}

interface PhubberFeedsResponse {
  count?: number
  results?: PhubberListProduct[]
}

export async function GET(req: NextRequest) {
  const sellerId = req.nextUrl.searchParams.get('sellerId')?.trim()
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10) || 1)

  if (!sellerId || !/^[a-f0-9]{24}$/i.test(sellerId)) {
    return NextResponse.json({ error: 'Missing or invalid seller ID.' }, { status: 400 })
  }

  let apiResponse: PhubberFeedsResponse
  try {
    const params = new URLSearchParams({
      pageIndex: String(page - 1),
      pageSize: String(PAGE_SIZE),
      lang: 'geo',
      order: 'id',
      user: sellerId,
    })
    const res = await fetch(`${PHUBBER_API_BASE}/rest_feeds?${params.toString()}`, { headers: phubberHeaders() })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to load products from Phubber.' }, { status: 502 })
    }
    apiResponse = await res.json()
  } catch (err) {
    console.error('Phubber products list fetch failed:', err)
    return NextResponse.json({ error: 'Failed to load products from Phubber.' }, { status: 502 })
  }

  const products: PhubberProductSummary[] = (apiResponse.results ?? []).map(p => {
    const mainImage = p.images?.find(img => img.is_main) ?? p.images?.[0]
    return {
      id: p.id,
      title: p.name?.trim() || 'Untitled',
      price: typeof p.price === 'number' ? p.price : null,
      thumbnailUrl: mainImage ? `${PHUBBER_API_BASE}/assets/imgs/products/thumbnails/${mainImage.filename}` : null,
    }
  })

  const totalCount = apiResponse.count ?? products.length

  return NextResponse.json({
    products,
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
  })
}
