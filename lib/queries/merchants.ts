'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  AddApprovedCreatorRequest,
  AiImageUsageResponse,
  MerchantAccessRequestResponse,
  MerchantDashboardResponse,
  MerchantResponse,
  MerchantSnippetResponse,
  PaginatedResult,
  UpdateMerchantRequest,
} from '@/lib/types'

export function useMerchantMe() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['merchant', 'me'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<MerchantResponse>('/api/merchants/me', token)
    },
    enabled: isLoaded && !!isSignedIn,
    staleTime: 10 * 60 * 1000,
  })
}

export function useUpdateMerchant(id: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: UpdateMerchantRequest) => {
      const token = await getToken()
      return apiFetch<MerchantResponse>(`/api/merchants/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: updated => {
      queryClient.setQueryData(['merchant', 'me'], updated)
    },
  })
}

export function useMerchants(page = 1, pageSize = 12) {
  return useQuery({
    queryKey: ['merchants', page, pageSize],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      return apiFetch<PaginatedResult<MerchantResponse>>(`/api/merchants?${params}`, null)
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: prev => prev,
  })
}

export function useHighlightedMerchants() {
  return useQuery({
    queryKey: ['merchants', 'highlighted'],
    queryFn: () => apiFetch<MerchantResponse[]>('/api/merchants/highlighted', null),
    staleTime: 5 * 60 * 1000,
  })
}

export function useMerchantSnippet() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['merchant', 'snippet'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<MerchantSnippetResponse>('/api/merchants/me/snippet', token)
    },
    enabled: isLoaded && !!isSignedIn,
    staleTime: 30 * 60 * 1000,
  })
}

export function useMerchantDashboard(from?: string, to?: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['merchant', 'dashboard', from, to],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const qs = params.toString()
      return apiFetch<MerchantDashboardResponse>(
        `/api/merchants/me/dashboard${qs ? `?${qs}` : ''}`,
        token
      )
    },
  })
}

export function useAccessRequests() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['merchant', 'access-requests'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<MerchantAccessRequestResponse[]>('/api/merchants/me/access-requests', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useAddApprovedCreator() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: AddApprovedCreatorRequest) => {
      const token = await getToken()
      return apiFetch<MerchantAccessRequestResponse>('/api/merchants/me/access-requests', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'access-requests'] })
    },
  })
}

export function useApproveAccessRequest() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId: string) => {
      const token = await getToken()
      return apiFetch<MerchantAccessRequestResponse>(`/api/merchants/me/access-requests/${requestId}/approve`, token, { method: 'PUT' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'access-requests'] })
    },
  })
}

export function useRejectAccessRequest() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId: string) => {
      const token = await getToken()
      return apiFetch<MerchantAccessRequestResponse>(`/api/merchants/me/access-requests/${requestId}/reject`, token, { method: 'PUT' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'access-requests'] })
    },
  })
}

export function useAiImageUsage() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['merchant', 'ai-image-usage'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<AiImageUsageResponse>('/api/merchants/me/ai-image-usage', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}
