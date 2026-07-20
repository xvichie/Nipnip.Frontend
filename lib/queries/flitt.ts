'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type { ConnectFlittRequest, FlittStatusResponse, OrderResponse } from '@/lib/types'

export function useFlittStatus() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['storefront-admin', 'flitt', 'status'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<FlittStatusResponse>('/api/stores/me/flitt/status', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useConnectFlitt() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: ConnectFlittRequest) => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/flitt/connect', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'flitt'] }),
  })
}

export function useDisconnectFlitt() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/flitt', token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'flitt'] }),
  })
}

// Public — no Clerk token, mirrors useCheckout. Used by the checkout confirmation page a
// customer's browser lands on after Flitt's hosted checkout redirects back.
export function usePublicOrderStatus(slug: string, orderId: string | null) {
  return useQuery({
    queryKey: ['storefront', slug, 'order-status', orderId],
    queryFn: () => apiFetch<OrderResponse>(`/api/stores/${slug}/checkout/orders/${orderId}`, null),
    enabled: !!orderId,
    // The Flitt callback can arrive slightly after the browser redirect — poll briefly
    // while still pending so the confirmation page catches up without a manual refresh.
    refetchInterval: query => (query.state.data?.status === 'Pending' ? 3000 : false),
  })
}
