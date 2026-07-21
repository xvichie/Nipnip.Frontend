import { NextResponse } from 'next/server'
import { apiFetch, ApiError } from '@/lib/api'
import { getStoreOrigin } from '@/lib/store/seo'
import type { StoreResponse } from '@/lib/types/storefront'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  let store: StoreResponse
  try {
    store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)
    if (!store.isActive) {
      return new NextResponse('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain' } })
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return new NextResponse('User-agent: *\nDisallow: /\n', { status: 404, headers: { 'Content-Type': 'text/plain' } })
    }
    throw err
  }

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /cart',
    'Disallow: /checkout',
    '',
    `Sitemap: ${getStoreOrigin(slug, store.customDomain)}/sitemap.xml`,
    '',
  ].join('\n')

  return new NextResponse(body, { headers: { 'Content-Type': 'text/plain' } })
}
