'use client'

import { useState } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'

// `act` is only present on the session's JWT claims while the current session was started
// via an actor token (see hooks/useImpersonate.ts) — not part of Clerk's typed claim shape,
// since it's conditional, so it's read defensively rather than assumed present.
interface ActorClaim {
  sub?: string
}

export function ImpersonationBanner() {
  const { isLoaded, sessionClaims } = useAuth()
  const { signOut } = useClerk()
  const [exiting, setExiting] = useState(false)

  if (!isLoaded) return null
  const actor = (sessionClaims as { act?: ActorClaim } | null | undefined)?.act
  if (!actor) return null

  async function handleExit() {
    setExiting(true)
    await signOut()
    // Full reload into the sign-in flow — there is no "resume the admin session" shortcut by
    // design: an impersonated session must never be able to hand itself back admin access
    // without the admin re-authenticating for real.
    window.location.href = '/sign-in'
  }

  return (
    <div className="sticky top-0 z-30 flex items-center justify-center gap-3 px-4 py-2 text-xs sm:text-sm font-medium bg-amber-500/15 border-b border-amber-500/25 text-amber-200">
      <span>⚠ You are signed in as this account via admin impersonation.</span>
      <button
        type="button"
        onClick={handleExit}
        disabled={exiting}
        className="btn btn-xs bg-amber-500/20 border-amber-500/30 text-amber-100 hover:bg-amber-500/30 disabled:opacity-40"
      >
        {exiting ? <span className="loading loading-spinner loading-xs" /> : 'Exit impersonation'}
      </button>
    </div>
  )
}
