'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  AiAgentSettingsResponse,
  ConversationDetailResponse,
  ConversationSummaryResponse,
  UpdateAiAgentSettingsRequest,
} from '@/lib/types'

export function useAiAgentSettings() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  return useQuery({
    queryKey: ['storefront-admin', 'ai-agent', 'settings'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<AiAgentSettingsResponse>('/api/stores/me/ai-agent/settings', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useUpdateAiAgentSettings() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateAiAgentSettingsRequest) => {
      const token = await getToken()
      return apiFetch<AiAgentSettingsResponse>('/api/stores/me/ai-agent/settings', token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'ai-agent', 'settings'] }),
  })
}

export function useConversations() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  return useQuery({
    queryKey: ['storefront-admin', 'ai-agent', 'conversations'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<ConversationSummaryResponse[]>('/api/stores/me/ai-agent/conversations', token)
    },
    enabled: isLoaded && !!isSignedIn,
    refetchInterval: 15000,
  })
}

export function useConversationDetail(conversationId: string | null) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['storefront-admin', 'ai-agent', 'conversations', conversationId],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<ConversationDetailResponse>(`/api/stores/me/ai-agent/conversations/${conversationId}`, token)
    },
    enabled: !!conversationId,
    refetchInterval: 10000,
  })
}
