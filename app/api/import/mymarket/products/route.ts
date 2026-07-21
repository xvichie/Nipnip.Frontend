import { NextRequest, NextResponse } from 'next/server'
import type { MyMarketProductSummary } from '@/lib/types'

// Mirrors the exact request MyMarket's own shop page fires when browsing its "products"
// tab (sniffed from mymarket.ge/shops/{id}/?Tab=products): CatID "0" means "all
// categories", ShopIDs is a single shop id as a string, Limit matches their own page size.
const SCRAPER_URL = process.env.MYMARKET_SCRAPER_URL
const SCRAPER_SECRET = process.env.MYMARKET_SCRAPER_SECRET
const PAGE_SIZE = 28

interface MyMarketPhoto {
  thumbs?: string
}

interface MyMarketListProduct {
  product_id: number
  title?: string | null
  price?: string | null
  photos?: MyMarketPhoto[] | null
}

interface MyMarketListResponse {
  statusCode?: number
  data?: {
    Prs?: MyMarketListProduct[]
    pagination?: { currentPage: number; totalPages: number }
  }
}

async function fetchProductsPage(shopId: string, page: number): Promise<MyMarketListResponse | null> {
  if (SCRAPER_URL) {
    const res = await fetch(`${SCRAPER_URL.replace(/\/$/, '')}/mymarket/shop/${shopId}/products?page=${page}`, {
      headers: SCRAPER_SECRET ? { 'x-scraper-secret': SCRAPER_SECRET } : {},
    })
    if (!res.ok) return null
    return res.json()
  }

  const res = await fetch('https://api.mymarket.ge/api/ka/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ CatID: '0', Page: page, Limit: PAGE_SIZE, ShopIDs: shopId }),
  })
  if (!res.ok) return null
  return res.json()
}

export async function GET(req: NextRequest) {
  const shopId = req.nextUrl.searchParams.get('shopId')?.trim()
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10) || 1)

  if (!shopId || !/^\d+$/.test(shopId)) {
    return NextResponse.json({ error: 'Missing or invalid shop ID.' }, { status: 400 })
  }

  let apiResponse: MyMarketListResponse | null
  try {
    apiResponse = await fetchProductsPage(shopId, page)
  } catch (err) {
    console.error('MyMarket products list fetch failed:', err)
    apiResponse = null
  }

  if (!apiResponse || apiResponse.statusCode !== 200 || !apiResponse.data) {
    return NextResponse.json(
      { error: 'MyMarket blocked this request. Wait a moment and try again.' },
      { status: 502 }
    )
  }

  const products: MyMarketProductSummary[] = (apiResponse.data.Prs ?? []).map(p => ({
    id: String(p.product_id),
    title: p.title?.trim() || 'Untitled',
    price: p.price ? parseFloat(p.price) : null,
    thumbnailUrl: p.photos?.[0]?.thumbs ?? null,
  }))

  return NextResponse.json({
    products,
    currentPage: apiResponse.data.pagination?.currentPage ?? page,
    totalPages: apiResponse.data.pagination?.totalPages ?? 1,
  })
}
