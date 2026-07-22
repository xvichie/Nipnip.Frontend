'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type { ConnectCityPayRequest, CityPayStatusResponse } from '@/lib/types'

export function useCityPayStatus() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['storefront-admin', 'citypay', 'status'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<CityPayStatusResponse>('/api/stores/me/citypay/status', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useConnectCityPay() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: ConnectCityPayRequest) => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/citypay/connect', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'citypay'] }),
  })
}

export function useDisconnectCityPay() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/citypay', token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'citypay'] }),
  })
}
