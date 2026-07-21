import { NextResponse } from 'next/server'
import { apiFetch } from '@/lib/api'
import { getStoreOrigin } from '@/lib/store/seo'

const SITE_URL = 'https://www.nipnip.ge'

interface StoreSitemapEntry {
  slug: string
  customDomain: string | null
}

function sitemapEntry(loc: string): string {
  return `  <sitemap>\n    <loc>${loc}</loc>\n  </sitemap>`
}

// A sitemap index rather than a single flat sitemap — each merchant's storefront lives on its
// own subdomain with its own sitemap.xml (products, categories, pages), so this just fans out
// to all of them plus the main site's own pages. New stores show up here automatically the
// next time this is fetched, with no manual submission needed per merchant.
export async function GET() {
  const stores = await apiFetch<StoreSitemapEntry[]>('/api/stores/sitemap', null)

  const entries = [
    sitemapEntry(`${SITE_URL}/main-sitemap.xml`),
    ...stores.map(s => sitemapEntry(`${getStoreOrigin(s.slug, s.customDomain)}/sitemap.xml`)),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</sitemapindex>`

  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
}
