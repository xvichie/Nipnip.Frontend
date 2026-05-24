'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type { AdminConversionEntry, ConversionResponse, CreatorEarningEntry, ManualConversionRequest, MerchantConversionEntry, MonthlyCreatorSummary, MonthlyMerchantSummary, PaginatedResult } from '@/lib/types'

export function useMyEarnings(page = 1, pageSize = 20, month?: number, year?: number) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['creator', 'earnings', page, pageSize, month, year],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (month != null) params.set('month', String(month))
      if (year != null) params.set('year', String(year))
      return apiFetch<PaginatedResult<CreatorEarningEntry>>(`/api/conversions/me?${params}`, token)
    },
    staleTime: 60 * 1000,
    // no placeholderData — filter changes must show loading state immediately
  })
}

export function useMyEarningsMonthly() {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['creator', 'earnings', 'monthly'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<MonthlyCreatorSummary[]>('/api/conversions/me/monthly', token)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useMerchantConversions(page = 1, pageSize = 20, month?: number, year?: number) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['merchant', 'conversions', page, pageSize, month, year],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (month != null) params.set('month', String(month))
      if (year != null) params.set('year', String(year))
      return apiFetch<PaginatedResult<MerchantConversionEntry>>(`/api/conversions/merchant?${params}`, token)
    },
    staleTime: 60 * 1000,
  })
}

export function useMerchantConversionsMonthly() {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['merchant', 'conversions', 'monthly'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<MonthlyMerchantSummary[]>('/api/conversions/merchant/monthly', token)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useConversionById(id: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['conversion', id],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<AdminConversionEntry>(`/api/conversions/${id}`, token)
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useReportManualSale() {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (body: ManualConversionRequest) => {
      const token = await getToken()
      return apiFetch<ConversionResponse>('/api/conversions/manual', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
  })
}
