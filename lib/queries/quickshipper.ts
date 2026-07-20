'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  ConnectQuickShipperRequest,
  CreateQuickShipperOrderRequest,
  OrderDetailResponse,
  PickupLocationResponse,
  QuickShipperCustomFieldResponse,
  QuickShipperFeesResponse,
  QuickShipperStatusResponse,
  SavePickupLocationRequest,
} from '@/lib/types'

export function useQuickShipperStatus() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['storefront-admin', 'quickshipper', 'status'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<QuickShipperStatusResponse>('/api/stores/me/quickshipper/status', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useConnectQuickShipper() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: ConnectQuickShipperRequest) => {
      const token = await getToken()
      return apiFetch<QuickShipperStatusResponse>('/api/stores/me/quickshipper/connect', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'quickshipper'] }),
  })
}

export function useDisconnectQuickShipper() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/quickshipper', token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'quickshipper'] }),
  })
}

export function useQuickShipperPickupLocation() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['storefront-admin', 'quickshipper', 'pickup-location'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<PickupLocationResponse>('/api/stores/me/quickshipper/pickup-location', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useSavePickupLocation() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: SavePickupLocationRequest) => {
      const token = await getToken()
      return apiFetch<PickupLocationResponse>('/api/stores/me/quickshipper/pickup-location', token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'quickshipper'] }),
  })
}

export function useQuickShipperCustomFields(enabled: boolean) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['storefront-admin', 'quickshipper', 'custom-fields'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<QuickShipperCustomFieldResponse[]>('/api/stores/me/quickshipper/custom-fields', token)
    },
    enabled,
  })
}

export function useQuickShipperFees(orderId: string, enabled: boolean) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['storefront-admin', 'quickshipper', 'fees', orderId],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<QuickShipperFeesResponse>(`/api/stores/me/quickshipper/orders/${orderId}/fees`, token)
    },
    enabled,
  })
}

export function useCreateQuickShipperOrder() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, body }: { orderId: string; body: CreateQuickShipperOrderRequest }) => {
      const token = await getToken()
      return apiFetch<OrderDetailResponse>(`/api/stores/me/quickshipper/orders/${orderId}`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'orders'] }),
  })
}

export function useRefreshQuickShipperOrder() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      const token = await getToken()
      return apiFetch<OrderDetailResponse>(`/api/stores/me/quickshipper/orders/${orderId}/refresh`, token, {
        method: 'POST',
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'orders'] }),
  })
}
