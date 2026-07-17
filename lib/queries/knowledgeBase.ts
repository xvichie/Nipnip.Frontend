'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  CreateKnowledgeBaseSectionRequest,
  KnowledgeBaseSectionResponse,
  UpdateKnowledgeBaseSectionRequest,
} from '@/lib/types'

const KEY = ['storefront-admin', 'ai-agent', 'knowledge-base']

export function useKnowledgeBaseSections() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<KnowledgeBaseSectionResponse[]>('/api/stores/me/ai-agent/knowledge-base', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useCreateKnowledgeBaseSection() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateKnowledgeBaseSectionRequest) => {
      const token = await getToken()
      return apiFetch<KnowledgeBaseSectionResponse>('/api/stores/me/ai-agent/knowledge-base', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateKnowledgeBaseSection() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateKnowledgeBaseSectionRequest & { id: string }) => {
      const token = await getToken()
      return apiFetch<KnowledgeBaseSectionResponse>(`/api/stores/me/ai-agent/knowledge-base/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteKnowledgeBaseSection() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      await apiFetch<void>(`/api/stores/me/ai-agent/knowledge-base/${id}`, token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}
