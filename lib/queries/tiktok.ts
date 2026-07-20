'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  TikTokConnectUrlResponse,
  TikTokProductPreviewResponse,
  TikTokPublishImagesRequest,
  TikTokPublishRequest,
  TikTokPublishResponse,
  TikTokStatusResponse,
} from '@/lib/types'

export function useTikTokStatus() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  return useQuery({
    queryKey: ['storefront-admin', 'tiktok', 'status'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<TikTokStatusResponse>('/api/stores/me/tiktok/status', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useTikTokConnectUrl() {
  const { getToken } = useAuth()
  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      return apiFetch<TikTokConnectUrlResponse>('/api/stores/me/tiktok/connect-url', token)
    },
  })
}

export function useDisconnectTikTok() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/tiktok', token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'tiktok', 'status'] }),
  })
}

export function useTikTokProductPreview(productId: string, enabled: boolean) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['storefront-admin', 'tiktok', 'preview', productId],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<TikTokProductPreviewResponse>(`/api/stores/me/tiktok/publish/${productId}/preview`, token)
    },
    enabled,
  })
}

export function useTikTokPublish() {
  const { getToken } = useAuth()
  return useMutation({
    mutationFn: async ({ productId, ...body }: { productId: string } & TikTokPublishRequest) => {
      const token = await getToken()
      return apiFetch<TikTokPublishResponse>(`/api/stores/me/tiktok/publish/${productId}`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
  })
}

// Ad-hoc publish for images that aren't attached to a Product (e.g. Social Post Creator output).
export function useTikTokPublishImages() {
  const { getToken } = useAuth()
  return useMutation({
    mutationFn: async (body: TikTokPublishImagesRequest) => {
      const token = await getToken()
      return apiFetch<TikTokPublishResponse>('/api/stores/me/tiktok/publish-images', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
  })
}
