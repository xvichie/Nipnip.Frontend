'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type { ConnectMyMarketRequest, MyMarketProductsListResponse, MyMarketStatusResponse } from '@/lib/types'

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

// Hits our own Next.js route (app/api/import/mymarket/products), not the .NET backend —
// no Clerk token needed, it's just a public MyMarket listing proxy.
export function useMyMarketProducts(shopId: string | null, page: number) {
  return useQuery({
    queryKey: ['mymarket-products', shopId, page],
    queryFn: async () => {
      const res = await fetch(`/api/import/mymarket/products?shopId=${shopId}&page=${page}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load products.')
      return data as MyMarketProductsListResponse
    },
    enabled: !!shopId,
    // Keep the current page's grid on screen while the next page loads instead of a
    // full skeleton wipe — each page number is otherwise a brand-new query key.
    placeholderData: keepPreviousData,
  })
}
