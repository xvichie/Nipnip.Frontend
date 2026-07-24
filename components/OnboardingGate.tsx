'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useCurrentRole } from '@/hooks/useCurrentRole'
import { useMyWebsiteInquiry } from '@/lib/queries/website-inquiries'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',').map(e => e.trim()).filter(Boolean)

// Paths this gate must never touch: /onboarding itself (it IS the form — gating it would loop),
// Clerk's own auth UI, and /admin (which has its own independent AdminGuard keyed off email, not
// the creator/merchant "role" this gate checks — an admin with no Creator/Merchant row of their
// own would otherwise register as role "new" and get locked out of their own admin panel).
const EXEMPT_PREFIXES = ['/onboarding', '/sign-in', '/sign-up', '/admin']

function isExempt(pathname: string): boolean {
  return EXEMPT_PREFIXES.some(p => pathname === p || pathname.startsWith(`${p}/`))
}

// Hard ceiling on how long this gate will block the page while it figures out whether the user
// needs to onboard. Without this, a backend hiccup (role/inquiry check erroring or just never
// resolving) turns into a total site lockout — an endless spinner with no way through, since
// nothing else ever tells the gate to give up. A real user hit exactly that. Past this timeout
// the page renders regardless; worst case a "new" user briefly sees a page before the next
// render/navigation re-evaluates and catches them again.
const MAX_BLOCK_MS = 4000

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const role = useCurrentRole()

  const isAdmin =
    !!user?.primaryEmailAddress?.emailAddress &&
    ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress)

  // Never blocks anonymous visitors or the pre-Clerk-hydration paint — only a *known* signed-in,
  // non-admin user on a non-exempt path is ever a candidate for gating.
  const gateActive = isLoaded && isSignedIn && !isAdmin && !isExempt(pathname)

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
