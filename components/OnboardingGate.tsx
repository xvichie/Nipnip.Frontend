'use client'

import { useEffect } from 'react'
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

// Enforces the "must submit the onboarding lead form before anything else is usable" rule
// (see app/onboarding/page.tsx) across the entire app — not just as a courtesy redirect on
// first landing, but on every route, every time, for as long as the signed-in user has neither
// a real Creator/Merchant account nor an already-submitted inquiry. Renders nothing (blocks the
// page underneath) while that's being determined, so the gated page never flashes on screen
// before the redirect lands.
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
  const { data: myInquiry, isSuccess: inquiryChecked, isFetching: inquiryFetching } = useMyWebsiteInquiry(shouldCheckInquiry)

  // Only ever conclude "hasn't submitted yet" once the check has actually completed
  // successfully — never while still fetching, and never on an error (a transient backend
  // hiccup must not falsely lock a real account out of the whole app; it keeps showing the
  // spinner and retries, rather than either wrongly redirecting or wrongly letting them through).
  const mustSubmit = shouldCheckInquiry && inquiryChecked && !inquiryFetching && !myInquiry
  const stillCheckingInquiry = shouldCheckInquiry && (!inquiryChecked || inquiryFetching)
  const blocking = gateActive && (roleLoading || stillCheckingInquiry || mustSubmit)

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
