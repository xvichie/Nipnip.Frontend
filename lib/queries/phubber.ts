'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type { ConnectPhubberRequest, PhubberProductsListResponse, PhubberStatusResponse } from '@/lib/types'

export function usePhubberStatus() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['storefront-admin', 'phubber', 'status'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<PhubberStatusResponse>('/api/stores/me/phubber/status', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useConnectPhubber() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: ConnectPhubberRequest) => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/phubber/connect', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'phubber'] }),
  })
}

export function useDisconnectPhubber() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/phubber', token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'phubber'] }),
  })
}

// Hits our own Next.js route (app/api/import/phubber/products), not the .NET backend —
// no Clerk token needed, it's just a public Phubber listing proxy.
export function usePhubberProducts(sellerId: string | null, page: number) {
  return useQuery({
    queryKey: ['phubber-products', sellerId, page],
    queryFn: async () => {
      const res = await fetch(`/api/import/phubber/products?sellerId=${sellerId}&page=${page}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load products.')
      return data as PhubberProductsListResponse
    },
    enabled: !!sellerId,
    placeholderData: keepPreviousData,
  })
}
