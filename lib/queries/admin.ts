'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  AdminConversionEntry,
  AdminCreateMerchantRequest,
  AdminPayoutSummaryResponse,
  AdminStatsResponse,
  CreatorResponse,
  MerchantResponse,
  PaginatedResult,
  UpdateMerchantRequest,
} from '@/lib/types'

export function useAdminStats() {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<AdminStatsResponse>('/api/admin/stats', token)
    },
  })
}

export function useAdminMerchants(page = 1, pageSize = 50) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'merchants', page, pageSize],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      return apiFetch<PaginatedResult<MerchantResponse>>(`/api/admin/merchants?${params}`, token)
    },
    placeholderData: prev => prev,
  })
}

export function useAdminMerchant(id: string) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'merchant', id],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<MerchantResponse>(`/api/admin/merchants/${id}`, token)
    },
    enabled: !!id,
  })
}

export function useAdminCreateMerchant() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: AdminCreateMerchantRequest) => {
      const token = await getToken()
      return apiFetch<MerchantResponse>('/api/admin/merchants', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useAdminUpdateMerchant(id: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateMerchantRequest) => {
      const token = await getToken()
      return apiFetch<MerchantResponse>(`/api/admin/merchants/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: updated => {
      queryClient.setQueryData(['admin', 'merchant', id], updated)
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] })
    },
  })
}

export function useAdminDeactivateMerchant() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<MerchantResponse>(`/api/admin/merchants/${id}`, token, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useAdminToggleMerchantHighlight() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<MerchantResponse>(`/api/admin/merchants/${id}/highlight`, token, { method: 'PUT' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] })
      queryClient.invalidateQueries({ queryKey: ['merchants', 'highlighted'] })
    },
  })
}

export function useAdminToggleCreatorHighlight() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<CreatorResponse>(`/api/admin/creators/${id}/highlight`, token, { method: 'PUT' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'creators'] })
      queryClient.invalidateQueries({ queryKey: ['creators', 'highlighted'] })
    },
  })
}

export function useAdminCreators(page = 1, pageSize = 50) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'creators', page, pageSize],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      return apiFetch<PaginatedResult<CreatorResponse>>(`/api/admin/creators?${params}`, token)
    },
    placeholderData: prev => prev,
  })
}

export function useAdminPayoutSummary({ from, to }: { from?: string; to?: string } = {}) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'payout-summary', from, to],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams()
      if (from) params.set('from', new Date(from).toISOString())
      if (to) params.set('to', new Date(`${to}T23:59:59`).toISOString())
      return apiFetch<AdminPayoutSummaryResponse>(`/api/admin/payout-summary?${params}`, token)
    },
  })
}

export function useAdminConversions({
  from,
  to,
  page = 1,
  pageSize = 50,
}: {
  from?: string
  to?: string
  page?: number
  pageSize?: number
} = {}) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'conversions', from, to, page, pageSize],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (from) params.set('from', new Date(from).toISOString())
      if (to) params.set('to', new Date(`${to}T23:59:59`).toISOString())
      return apiFetch<PaginatedResult<AdminConversionEntry>>(`/api/admin/conversions?${params}`, token)
    },
    placeholderData: prev => prev,
  })
}
