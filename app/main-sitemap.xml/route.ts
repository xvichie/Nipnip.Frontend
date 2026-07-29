import { NextResponse } from 'next/server'

const SITE_URL = 'https://www.nipnip.ge'

function urlEntry(path: string, priority: string): string {
  return `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <priority>${priority}</priority>\n  </url>`
}

export async function GET() {
  const entries = [
    urlEntry('/', '1.0'),
    urlEntry('/merchants', '0.9'),
    urlEntry('/why-us', '0.8'),
    urlEntry('/how-it-works', '0.7'),
    urlEntry('/about', '0.6'),
    urlEntry('/faq', '0.6'),
    urlEntry('/contact', '0.5'),
    urlEntry('/privacy', '0.3'),
    urlEntry('/terms', '0.3'),
    urlEntry('/data-deletion', '0.3'),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`

  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
}
