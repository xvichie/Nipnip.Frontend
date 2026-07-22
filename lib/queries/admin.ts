'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  AdminConversionEntry,
  AdminCreateMerchantRequest,
  AdminCreateStoreRequest,
  AdminPayoutSummaryResponse,
  AdminStatsResponse,
  CreatorResponse,
  MerchantResponse,
  PaginatedResult,
  StoreResponse,
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

export function useAdminToggleMerchantTest() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<MerchantResponse>(`/api/admin/merchants/${id}/test-flag`, token, { method: 'PUT' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] })
      queryClient.invalidateQueries({ queryKey: ['merchants'] })
    },
  })
}

export function useAdminMerchantStore(id: string) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'merchant', id, 'store'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<StoreResponse | null>(`/api/admin/merchants/${id}/store`, token)
    },
    enabled: !!id,
  })
}

export function useAdminCreateStore(id: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: AdminCreateStoreRequest) => {
      const token = await getToken()
      return apiFetch<StoreResponse>(`/api/admin/merchants/${id}/store`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: store => {
      queryClient.setQueryData(['admin', 'merchant', id, 'store'], store)
    },
  })
}

export function useAdminSetStoreThemeOverride(id: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { themeOverride: string | null }) => {
      const token = await getToken()
      return apiFetch<StoreResponse>(`/api/admin/merchants/${id}/store/theme-override`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: store => {
      queryClient.setQueryData(['admin', 'merchant', id, 'store'], store)
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

export function useAdminToggleCreatorTest() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<CreatorResponse>(`/api/admin/creators/${id}/test-flag`, token, { method: 'PUT' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'creators'] })
      queryClient.invalidateQueries({ queryKey: ['creators'] })
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
