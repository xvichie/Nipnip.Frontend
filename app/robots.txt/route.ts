import { NextResponse } from 'next/server'

const SITE_URL = 'https://www.nipnip.ge'

export async function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /dashboard',
    'Disallow: /admin',
    'Disallow: /onboarding',
    'Disallow: /sign-in',
    'Disallow: /sign-up',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')

  return new NextResponse(body, { headers: { 'Content-Type': 'text/plain' } })
}
