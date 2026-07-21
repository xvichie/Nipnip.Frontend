'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type { ConnectMyMarketRequest, MyMarketStatusResponse } from '@/lib/types'

export function useMyMarketStatus() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['storefront-admin', 'mymarket', 'status'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<MyMarketStatusResponse>('/api/stores/me/mymarket/status', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useConnectMyMarket() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: ConnectMyMarketRequest) => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/mymarket/connect', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'mymarket'] }),
  })
}

export function useDisconnectMyMarket() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/mymarket', token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'mymarket'] }),
  })
}
