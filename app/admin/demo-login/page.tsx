'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSignIn } from '@clerk/nextjs/legacy'

const ROLES: { role: 'merchant' | 'creator'; label: string; redirect: string }[] = [
  { role: 'merchant', label: 'Demo Merchant', redirect: '/dashboard/merchant/affiliate' },
  { role: 'creator', label: 'Demo Creator', redirect: '/dashboard/creator' },
]

export default function AdminDemoLoginPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const [loadingRole, setLoadingRole] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleLogin(role: 'merchant' | 'creator', redirect: string) {
    if (!isLoaded || !signIn) return
    setLoadingRole(role)
    setError('')

    try {
      const tokenRes = await fetch('/api/admin/demo-sign-in-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const tokenData = await tokenRes.json() as { token?: string; error?: string }
      if (!tokenRes.ok || !tokenData.token) throw new Error(tokenData.error ?? 'Failed to get sign-in token')

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

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Demo Login</h1>
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
  )
}
