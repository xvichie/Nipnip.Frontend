'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  FacebookConnectUrlResponse,
  FacebookPendingPageResponse,
  FacebookPostDetailResponse,
  FacebookPostSummaryResponse,
  FacebookProductPreviewResponse,
  FacebookPublishResponse,
  FacebookStatusResponse,
  SelectFacebookPageRequest,
} from '@/lib/types'

export function useFacebookStatus() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  return useQuery({
    queryKey: ['storefront-admin', 'facebook', 'status'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<FacebookStatusResponse>('/api/stores/me/facebook/status', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useFacebookConnectUrl() {
  const { getToken } = useAuth()
  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      return apiFetch<FacebookConnectUrlResponse>('/api/stores/me/facebook/connect-url', token)
    },
  })
}

export function useFacebookPendingPages(pendingToken: string | null) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['storefront-admin', 'facebook', 'pending', pendingToken],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<FacebookPendingPageResponse[]>(
        `/api/stores/me/facebook/pending?token=${encodeURIComponent(pendingToken!)}`,
        token
      )
    },
    enabled: !!pendingToken,
  })
}

export function useSelectFacebookPage() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: SelectFacebookPageRequest) => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/facebook/select-page', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'facebook', 'status'] }),
  })
}

export function useDisconnectFacebook() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/facebook', token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'facebook', 'status'] }),
  })
}

export function useFacebookPosts(enabled: boolean) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['storefront-admin', 'facebook', 'posts'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<FacebookPostSummaryResponse[]>('/api/stores/me/facebook/posts', token)
    },
    enabled,
  })
}

export function useFacebookPostDetail() {
  const { getToken } = useAuth()
  return useMutation({
    mutationFn: async (postId: string) => {
      const token = await getToken()
      return apiFetch<FacebookPostDetailResponse>(`/api/stores/me/facebook/posts/${postId}`, token)
    },
  })
}

export function useFacebookProductPreview(productId: string, enabled: boolean) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['storefront-admin', 'facebook', 'preview', productId],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<FacebookProductPreviewResponse>(`/api/stores/me/facebook/publish/${productId}/preview`, token)
    },
    enabled,
  })
}

export function useFacebookPublish() {
  const { getToken } = useAuth()
  return useMutation({
    mutationFn: async ({ productId, message }: { productId: string; message?: string }) => {
      const token = await getToken()
      return apiFetch<FacebookPublishResponse>(`/api/stores/me/facebook/publish/${productId}`, token, {
        method: 'POST',
        body: JSON.stringify({ message }),
      })
    },
  })
}
