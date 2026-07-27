import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/admin(.*)'])

const ROOT_DOMAIN = 'nipnip.ge'
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// Every themed storefront component links internally with root-relative paths
// (e.g. href="/products/x", href="/cart") — correct on a real subdomain/custom domain
// since the whole host belongs to that one store, but wrong under /preview/{slug} on
// the shared main domain: clicking one drops the /preview/{slug} prefix and the browser
// requests a fresh top-level nipnip.ge path instead. This cookie remembers which store
// is being previewed so those follow-up clicks can still be routed correctly.
const PREVIEW_COOKIE = 'nn_preview_slug'
const PREVIEW_COOKIE_MAX_AGE = 60 * 30 // 30 min sliding window, refreshed on every storefront navigation

const PREVIEW_STOREFRONT_PATTERNS: RegExp[] = [
  /^\/$/,
  /^\/bundles$/,
  /^\/cart$/,
  /^\/checkout$/,
  /^\/checkout\/confirmation$/,
  /^\/contact$/,
  /^\/pages\/[^/]+$/,
  /^\/products$/,
  /^\/products\/category\/[^/]+$/,
  /^\/products\/collection\/[^/]+$/,
  /^\/products\/[^/]+$/,
]

function isStorefrontPath(pathname: string): boolean {
  return PREVIEW_STOREFRONT_PATTERNS.some(pattern => pattern.test(pathname))
}

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
  // Admin-only "show a prospect what their store could look like" link — see the /admin
  // Prospects panel. Rewrites to the same storefront route tree real stores use; the actual
  // admin-only enforcement (checking the store is a prospect and the signed-in user is an
  // admin) happens in app/store/[slug]/layout.tsx, since that's what's authoritative for both
  // this path and a prospect's real slug/subdomain being hit directly.
  if (req.nextUrl.pathname === '/preview' || req.nextUrl.pathname.startsWith('/preview/')) {
    await auth.protect()
    const url = req.nextUrl.clone()
    url.pathname = req.nextUrl.pathname.replace(/^\/preview/, '/store') || '/store'
    const response = NextResponse.rewrite(url)
    const previewSlug = req.nextUrl.pathname.replace(/^\/preview\/?/, '').split('/')[0]
    if (previewSlug) {
      response.cookies.set(PREVIEW_COOKIE, previewSlug, { path: '/', maxAge: PREVIEW_COOKIE_MAX_AGE, sameSite: 'lax' })
    }
    return response
  }

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

  // Continuation of a /preview/{slug} session: this request landed on the bare main
  // domain (no /preview prefix, no matching subdomain) because a themed component's
  // internal link doesn't carry that prefix. A rewrite here would fix the served
  // content but leave the address bar showing the bare path (e.g. nipnip.ge/cart)
  // instead of /preview/{slug}/cart, so redirect back into the canonical /preview
  // URL instead — the block above then handles auth + the real rewrite + refreshing
  // the cookie once the browser re-requests it.
  const previewSlug = req.cookies.get(PREVIEW_COOKIE)?.value
  if (previewSlug && isStorefrontPath(req.nextUrl.pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = `/preview/${previewSlug}${req.nextUrl.pathname === '/' ? '' : req.nextUrl.pathname}`
    return NextResponse.redirect(url)
  }

  if (isProtectedRoute(req)) await auth.protect()

  if (previewSlug) {
    // Left the preview without hitting a whitelisted storefront path (e.g. navigated
    // straight to /dashboard or /merchants) — drop the stale cookie so it can't keep
    // hijacking "/" and other storefront-shaped paths on a later, unrelated visit.
    const response = NextResponse.next()
    response.cookies.delete(PREVIEW_COOKIE)
    return response
  }
}, { clockSkewInMs: 120_000 })

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
