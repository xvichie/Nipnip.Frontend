'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type { CreatorDashboardResponse, CreatorResponse, PaginatedResult, UpdateCreatorRequest } from '@/lib/types'

export function useCreators(page = 1, pageSize = 12) {
  return useQuery({
    queryKey: ['creators', page, pageSize],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      return apiFetch<PaginatedResult<CreatorResponse>>(`/api/creators?${params}`, null)
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: prev => prev,
  })
}

export function useHighlightedCreators() {
  return useQuery({
    queryKey: ['creators', 'highlighted'],
    queryFn: () => apiFetch<CreatorResponse[]>('/api/creators/highlighted', null),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreatorMe() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['creator', 'me'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<CreatorResponse>('/api/creators/me', token)
    },
    enabled: isLoaded && !!isSignedIn,
    staleTime: 10 * 60 * 1000,
  })
}

export function useUpdateCreator(id: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: UpdateCreatorRequest) => {
      const token = await getToken()
      return apiFetch<CreatorResponse>(`/api/creators/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: updated => {
      queryClient.setQueryData(['creator', 'me'], updated)
    },
  })
}

export function useCreatorDashboard(from?: string, to?: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['creator', 'dashboard', from, to],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const qs = params.toString()
      return apiFetch<CreatorDashboardResponse>(
        `/api/creators/me/dashboard${qs ? `?${qs}` : ''}`,
        token
      )
    },
  })
}
