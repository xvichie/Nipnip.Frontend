'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',').map(e => e.trim()).filter(Boolean)

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  const isAdmin =
    isLoaded &&
    isSignedIn &&
    ADMIN_EMAILS.length > 0 &&
    !!user.primaryEmailAddress?.emailAddress &&
    ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn || !isAdmin) router.replace('/')
  }, [isLoaded, isSignedIn, isAdmin, router])

  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-white/20" />
      </div>
    )
  }

  return <>{children}</>
}
