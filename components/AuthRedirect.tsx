'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useCurrentRole } from '@/hooks/useCurrentRole'

export function AuthRedirect() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()
  const role = useCurrentRole()

  useEffect(() => {
    if (!isLoaded || !isSignedIn || role === null) return

    if (role === 'new') {
      router.replace('/onboarding')
    } else if (role === 'creator') {
      router.replace('/dashboard/creator')
    } else if (role === 'merchant') {
      router.replace('/dashboard/merchant/affiliate')
    }
  }, [isLoaded, isSignedIn, role, router])

  return null
}
