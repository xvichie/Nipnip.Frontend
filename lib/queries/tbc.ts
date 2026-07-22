'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type { ConnectTbcRequest, TbcStatusResponse } from '@/lib/types'

export function useTbcStatus() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['storefront-admin', 'tbc', 'status'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<TbcStatusResponse>('/api/stores/me/tbc/status', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useConnectTbc() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: ConnectTbcRequest) => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/tbc/connect', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'tbc'] }),
  })
}

export function useDisconnectTbc() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/tbc', token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'tbc'] }),
  })
}
