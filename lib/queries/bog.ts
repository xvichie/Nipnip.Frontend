'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type { ConnectBogRequest, BogStatusResponse } from '@/lib/types'

export function useBogStatus() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['storefront-admin', 'bog', 'status'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<BogStatusResponse>('/api/stores/me/bog/status', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useConnectBog() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: ConnectBogRequest) => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/bog/connect', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'bog'] }),
  })
}

export function useDisconnectBog() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/bog', token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'bog'] }),
  })
}
