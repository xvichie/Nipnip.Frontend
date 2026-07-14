import { NextResponse } from 'next/server'
import { apiFetch } from '@/lib/api'
import { getStoreUrl } from '@/lib/store/seo'
import type { CategoryResponse, ProductSummaryResponse, StorePageResponse, StoreResponse } from '@/lib/types/storefront'

function urlEntry(loc: string, priority: string): string {
  return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  let store: StoreResponse
  try {
    store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
  if (!store.isActive) return new NextResponse('Not found', { status: 404 })

  const [categories, products, pages] = await Promise.all([
    apiFetch<CategoryResponse[]>(`/api/stores/${slug}/categories`, null),
    apiFetch<ProductSummaryResponse[]>(`/api/stores/${slug}/products`, null),
    apiFetch<StorePageResponse[]>(`/api/stores/${slug}/pages`, null),
  ])

  const entries = [
    urlEntry(getStoreUrl(slug), '1.0'),
    urlEntry(getStoreUrl(slug, '/products'), '0.9'),
    urlEntry(getStoreUrl(slug, '/contact'), '0.5'),
    ...categories.map(c => urlEntry(getStoreUrl(slug, `/products/category/${c.slug}`), '0.7')),
    ...products.map(p => urlEntry(getStoreUrl(slug, `/products/${p.slug}`), '0.8')),
    ...pages.map(p => urlEntry(getStoreUrl(slug, `/pages/${p.slug}`), '0.5')),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`

  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
}
