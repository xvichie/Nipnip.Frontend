'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type { ConnectExtraRequest, ExtraProductsListResponse, ExtraStatusResponse } from '@/lib/types'

export function useExtraStatus() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['storefront-admin', 'extra', 'status'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<ExtraStatusResponse>('/api/stores/me/extra/status', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useConnectExtra() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: ConnectExtraRequest) => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/extra/connect', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'extra'] }),
  })
}

export function useDisconnectExtra() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/extra', token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'extra'] }),
  })
}

// Hits our own Next.js route (app/api/import/extra/products), not the .NET backend — no
// Clerk token needed, it's just a public Extra.ge listing proxy.
export function useExtraProducts(sellerId: string | null, page: number) {
  return useQuery({
    queryKey: ['extra-products', sellerId, page],
    queryFn: async () => {
      const res = await fetch(`/api/import/extra/products?sellerId=${sellerId}&page=${page}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load products.')
      return data as ExtraProductsListResponse
    },
    enabled: !!sellerId,
    placeholderData: keepPreviousData,
  })
}
