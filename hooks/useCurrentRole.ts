'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'
import { apiFetch, ApiError } from '@/lib/api'

export type Role = 'new' | 'creator' | 'merchant' | 'admin'

export function useCurrentRole(): Role | null {
  const { isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()

  const { data: role } = useQuery({
    queryKey: ['current-role'],
    queryFn: async (): Promise<Role> => {
      const token = await getToken()

      try {
        await apiFetch('/api/creators/me/dashboard', token)
        return 'creator'
      } catch (e) {
        if (!(e instanceof ApiError && e.status === 404)) throw e
      }

      try {
        await apiFetch('/api/merchants/me/dashboard', token)
        return 'merchant'
      } catch (e) {
        if (!(e instanceof ApiError && e.status === 404)) throw e
      }

      return 'new'
    },
    enabled: isLoaded && !!isSignedIn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  if (!isLoaded || !isSignedIn) return null
  return role ?? null
}
