'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  AvailableBalanceResponse,
  MarkPayoutSentRequest,
  PaginatedResult,
  PayoutResponse,
  RequestPayoutRequest,
} from '@/lib/types'

export function useAvailableBalance() {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['creator', 'payout-balance'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<AvailableBalanceResponse>('/api/payouts/balance', token)
    },
  })
}

export function useMyPayouts(page = 1, pageSize = 20) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['creator', 'payouts', page, pageSize],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      return apiFetch<PaginatedResult<PayoutResponse>>(`/api/payouts/me?${params}`, token)
    },
    placeholderData: prev => prev,
  })
}

export function useRequestPayout() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: RequestPayoutRequest) => {
      const token = await getToken()
      return apiFetch<PayoutResponse>('/api/payouts', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'payouts'] })
      queryClient.invalidateQueries({ queryKey: ['creator', 'payout-balance'] })
    },
  })
}

export function useAdminPayouts(status?: string, page = 1, pageSize = 50) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'payouts', status, page, pageSize],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (status) params.set('status', status)
      return apiFetch<PaginatedResult<PayoutResponse>>(`/api/admin/payouts?${params}`, token)
    },
    placeholderData: prev => prev,
  })
}

export function useMarkPayoutSent() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: MarkPayoutSentRequest & { id: string }) => {
      const token = await getToken()
      return apiFetch<PayoutResponse>(`/api/admin/payouts/${id}/mark-sent`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] })
    },
  })
}

export function useRejectPayout() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const token = await getToken()
      const params = notes ? `?notes=${encodeURIComponent(notes)}` : ''
      return apiFetch<PayoutResponse>(`/api/admin/payouts/${id}/reject${params}`, token, {
        method: 'PUT',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] })
    },
  })
}
