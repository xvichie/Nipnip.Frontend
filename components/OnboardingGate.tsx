'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useCurrentRole } from '@/hooks/useCurrentRole'
import { useMyWebsiteInquiry } from '@/lib/queries/website-inquiries'
import { STOREFRONT_ROOT_DOMAIN } from '@/lib/store/seo'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',').map(e => e.trim()).filter(Boolean)

// Paths this gate must never touch: /onboarding itself (it IS the form — gating it would loop),
// Clerk's own auth UI, /admin (which has its own independent AdminGuard keyed off email, not
// the creator/merchant "role" this gate checks), and /preview (the admin-only prospect preview —
// already gated elsewhere, but excluded here too so it never even flashes the spinner first).
const EXEMPT_PREFIXES = ['/onboarding', '/sign-in', '/sign-up', '/admin', '/preview']

function isExempt(pathname: string): boolean {
  return EXEMPT_PREFIXES.some(p => pathname === p || pathname.startsWith(`${p}/`))
}

// Only ever true on NipNip's own marketing/dashboard/admin site — false for every merchant
// storefront, whether reached via a *.nipnip.ge subdomain or a verified custom domain. Both are
// rewritten by middleware.ts to the same /store/[slug] route tree, but that rewrite is invisible
// to the browser: usePathname() still reports plain paths like "/" or "/products" on a
// storefront, indistinguishable by path alone from the marketing site's own "/" or similar. The
// only real signal is the hostname, so this fails safe in the one direction that matters — an
// unrecognized host (any subdomain, any custom domain, or something unanticipated) is always
// treated as "not the main app" and never gated. A real customer got stuck on this exact spinner
// while just trying to shop a merchant's storefront; getting this wrong the other way (gating a
// storefront) is the actual incident, not a hypothetical.
function isMainAppHost(hostname: string): boolean {
  const host = hostname.split(':')[0]
  return host === STOREFRONT_ROOT_DOMAIN || host === `www.${STOREFRONT_ROOT_DOMAIN}` || host === 'localhost' || host === '127.0.0.1'
}

function subscribeNoop() {
  return () => {}
}
function getHostnameSnapshot() {
  return window.location.hostname
}
function getHostnameServerSnapshot() {
  // Empty (never a real hostname) so SSR/first-hydration always resolves isMainAppHost to
  // false — i.e. never blocking — until the real client-side hostname is known.
  return ''
}

// Hard ceiling on how long this gate will block the page while it figures out whether the user
// needs to onboard. Without this, a backend hiccup (role/inquiry check erroring or just never
// resolving) turns into a total site lockout — an endless spinner with no way through. Past this
// timeout the page renders regardless; worst case a "new" user briefly sees a page before the
// next render/navigation re-evaluates and catches them again.
const MAX_BLOCK_MS = 4000

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const role = useCurrentRole()
  const hostname = useSyncExternalStore(subscribeNoop, getHostnameSnapshot, getHostnameServerSnapshot)

  const isAdmin =
    !!user?.primaryEmailAddress?.emailAddress &&
    ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress)

  // Never blocks anonymous visitors, the pre-Clerk-hydration paint, or anything outside the main
  // app's own host — only a *known* signed-in, non-admin user on the main site's non-exempt path
  // is ever a candidate for gating.
  const gateActive = isLoaded && isSignedIn && !isAdmin && isMainAppHost(hostname) && !isExempt(pathname)

  const roleLoading = gateActive && role === null
  const shouldCheckInquiry = gateActive && role === 'new'
  const { data: myInquiry, isLoading: inquiryLoading } = useMyWebsiteInquiry(shouldCheckInquiry)

  const mustSubmit = shouldCheckInquiry && !inquiryLoading && !myInquiry
  const wantsToBlock = gateActive && (roleLoading || (shouldCheckInquiry && inquiryLoading) || mustSubmit)

  // Derived, not synced: comparing against the current path (rather than resetting a plain
  // boolean back to false in the effect body) means a fresh block on a *different* path always
  // gets its own full timeout, with no separate "reset" state write needed.
  const [timedOutPath, setTimedOutPath] = useState<string | null>(null)
  const timedOut = timedOutPath === pathname

  useEffect(() => {
    if (!wantsToBlock) return
    const id = setTimeout(() => setTimedOutPath(pathname), MAX_BLOCK_MS)
    return () => clearTimeout(id)
  }, [wantsToBlock, pathname])

  const blocking = wantsToBlock && !timedOut

  useEffect(() => {
    if (mustSubmit) router.replace('/onboarding')
  }, [mustSubmit, router])

  if (blocking) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-white/20" />
      </div>
    )
  }

  return <>{children}</>
}
