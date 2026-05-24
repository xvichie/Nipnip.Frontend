import { type NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ creatorSlug: string; merchantSlug: string }> },
) {
  const { creatorSlug, merchantSlug } = await params

  // Forward IP and UA so the backend can log the click accurately
  const ip = request.headers.get('x-forwarded-for')
    ?? request.headers.get('x-real-ip')
    ?? ''
  const ua = request.headers.get('user-agent') ?? ''

  const res = await fetch(`${API_URL}/r/${creatorSlug}/${merchantSlug}`, {
    redirect: 'manual',
    headers: {
      'x-forwarded-for': ip,
      'user-agent': ua,
    },
  })

  const location = res.headers.get('location')
  if (location) {
    return Response.redirect(location, 302)
  }

  // Slug pair not found — fall back to merchants page
  return Response.redirect(new URL('/merchants', request.url), 302)
}
