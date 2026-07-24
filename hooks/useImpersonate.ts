'use client'

import { useState } from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { useSignIn } from '@clerk/nextjs/legacy'
import { apiFetch } from '@/lib/api'
import type { ImpersonationInfoResponse } from '@/lib/types'

export type ImpersonateRole = 'merchant' | 'creator'

const ROLE_REDIRECT: Record<ImpersonateRole, string> = {
  merchant: '/dashboard/merchant/store',
  creator: '/dashboard/creator',
}

// Hard navigation, not router.push — a client-side transition can leave useAuth()/getToken() on the
// destination page still resolved against the old (admin) session, causing 401s on the first
// authenticated API calls there. A full reload forces Clerk to re-init from the fresh session cookie.
function hardNavigate(url: string) {
  window.location.href = url
}

// Admin-only "sign in as" flow: looks up the target's Clerk user ID via the .NET admin API,
// mints a Clerk actor token (see app/api/admin/impersonate), then swaps the current browser
// session into theirs — from that point on every dashboard page just works exactly as it
// would for the real merchant/creator, since it's a genuine session as their account.
export function useImpersonate() {
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function impersonate(role: ImpersonateRole, id: string, name: string) {
    if (!signInLoaded || !signIn) return
    if (!confirm(`Sign in as "${name}"? You'll be signed out of your admin session and into their account.`)) return

    setLoadingId(id)
    setError(null)
    try {
      const adminToken = await getToken()
      const info = await apiFetch<ImpersonationInfoResponse>(
        `/api/admin/${role}s/${id}/impersonation-info`,
        adminToken
      )

      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkUserId: info.clerkUserId }),
      })
      const data = await res.json() as { token?: string; error?: string }
      if (!res.ok || !data.token) throw new Error(data.error ?? 'Failed to start impersonation')

      // Clerk refuses to start a new sign-in while a session is already active.
      await signOut()

      const result = await signIn.create({ strategy: 'ticket', ticket: data.token })
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId })
        hardNavigate(ROLE_REDIRECT[role])
      } else {
        throw new Error('Sign-in did not complete')
      }
    } catch (err) {
      // Clerk-js throws errors shaped like `{ errors: [{ message, longMessage }] }` for
      // sign-in/actor-token failures — the useful detail lives there, not in `.message` (which is
      // often just the generic HTTP reason phrase, e.g. "Unprocessable Entity"). The most common
      // cause: the merchant/creator's stored ClerkUserId no longer matches a real Clerk account
      // (deleted directly in the Clerk dashboard) — Clerk reports that as
      // "The resource associated with the supplied user_id was not found."
      const clerkErrors = (err as { errors?: { message?: string; longMessage?: string }[] })?.errors
      const detail = clerkErrors?.map(e => e.longMessage ?? e.message).filter(Boolean).join(' ')
      console.error('[useImpersonate] failed:', err)
      setError(detail || (err instanceof Error ? err.message : 'Something went wrong'))
      setLoadingId(null)
    }
  }

  return { impersonate, loadingId, error }
}
