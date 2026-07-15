import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/admin(.*)'])

const ROOT_DOMAIN = 'nipnip.ge'
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

async function resolveCustomDomainSlug(hostname: string): Promise<string | null> {
  if (!API_URL) return null
  try {
    const res = await fetch(`${API_URL}/api/stores/by-domain/${hostname}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const data = await res.json() as { slug: string }
    return data.slug || null
  } catch {
    return null
  }
}

async function resolveStoreSlug(req: NextRequest): Promise<string | null> {
  const hostname = (req.headers.get('host') ?? '').split(':')[0]

  if (process.env.NODE_ENV !== 'production') {
    const override = req.nextUrl.searchParams.get('store')
    if (override) return override
  }

  if (hostname.endsWith('.localhost')) {
    const sub = hostname.slice(0, -'.localhost'.length)
    return sub && sub !== 'www' ? sub : null
  }

  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}` || hostname === 'localhost') return null

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = hostname.slice(0, -(ROOT_DOMAIN.length + 1))
    return sub && sub !== 'www' ? sub : null
  }

  return resolveCustomDomainSlug(hostname)
}

export default clerkMiddleware(async (auth, req) => {
  const slug = await resolveStoreSlug(req)

  if (slug) {
    const url = req.nextUrl.clone()
    url.pathname = `/store/${slug}${req.nextUrl.pathname === '/' ? '' : req.nextUrl.pathname}`
    const response = NextResponse.rewrite(url)

    // A creator link redirects here with ?ref={creatorSlug}_{merchantSlug} attached — remember it
    // for the rest of the shopping session so checkout can attribute the sale. Not HttpOnly: the
    // checkout request is client-side JS reading this cookie, same as the external JS-snippet flow.
    const ref = req.nextUrl.searchParams.get('ref')
    if (ref) {
      response.cookies.set(`nn_ref_${slug}`, ref, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      })
    }

    return response
  }

  if (isProtectedRoute(req)) await auth.protect()
}, { clockSkewInMs: 120_000 })

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
