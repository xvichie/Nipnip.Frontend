'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser, useClerk } from '@clerk/nextjs'
import { useSignIn } from '@clerk/nextjs/legacy'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useLanguage } from '@/lib/i18n'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',').map(e => e.trim()).filter(Boolean)

const ROLES: { role: 'merchant' | 'creator'; label: string; redirect: string }[] = [
  { role: 'merchant', label: 'Demo Merchant', redirect: '/dashboard/merchant/affiliate' },
  { role: 'creator', label: 'Demo Creator', redirect: '/dashboard/creator' },
]

export default function DemoLoginPage() {
  const { isLoaded: userLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn()
  const router = useRouter()
  const { t } = useLanguage()
  const [loadingRole, setLoadingRole] = useState<string | null>(null)
  const [error, setError] = useState('')

  const isAdmin =
    userLoaded &&
    isSignedIn &&
    !!user.primaryEmailAddress?.emailAddress &&
    ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress)

  async function handleLogin(role: 'merchant' | 'creator', redirect: string) {
    if (!signInLoaded || !signIn) return
    setLoadingRole(role)
    setError('')

    try {
      // Mint the token while still authenticated as admin — the API route requires it.
      const tokenRes = await fetch('/api/admin/demo-sign-in-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const tokenData = await tokenRes.json() as { token?: string; error?: string }
      if (!tokenRes.ok || !tokenData.token) throw new Error(tokenData.error ?? 'Failed to get sign-in token')

      // Clerk refuses to start a new sign-in while a session is already active.
      await signOut()

      const result = await signIn.create({ strategy: 'ticket', ticket: tokenData.token })
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId })
        router.push(redirect)
      } else {
        throw new Error('Sign-in did not complete')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoadingRole(null)
    }
  }

  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-white/20" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-3">
          <p className="text-white/40 text-sm">{t.admin.notAuthorized}</p>
          <Link href="/" className="text-amber-400 text-sm hover:underline">{t.admin.goHome}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#08080d] text-white selection:bg-amber-500/20">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col gap-6 max-w-lg">
          <div>
            <h1 className="text-2xl font-black tracking-tight">{t.admin.demoLogin}</h1>
            <p className="text-white/40 text-sm mt-1">
              One-click sign-in as the hardcoded demo accounts — no password, no email code.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col gap-3">
            {ROLES.map(({ role, label, redirect }) => (
              <button
                key={role}
                onClick={() => handleLogin(role, redirect)}
                disabled={loadingRole !== null}
                className="btn w-full justify-start gap-2 bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08] disabled:opacity-40"
              >
                {loadingRole === role ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <span>Continue as {label}</span>
                )}
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
