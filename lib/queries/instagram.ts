'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  InstagramMediaDetailResponse,
  InstagramMediaSummaryResponse,
  InstagramProductPreviewResponse,
  InstagramPublishResponse,
  InstagramStatusResponse,
} from '@/lib/types'

export function useInstagramStatus() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  return useQuery({
    queryKey: ['storefront-admin', 'instagram', 'status'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<InstagramStatusResponse>('/api/stores/me/instagram/status', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useInstagramMedia(enabled: boolean) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['storefront-admin', 'instagram', 'media'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<InstagramMediaSummaryResponse[]>('/api/stores/me/instagram/media', token)
    },
    enabled,
  })
}

export function useInstagramMediaDetail() {
  const { getToken } = useAuth()
  return useMutation({
    mutationFn: async (mediaId: string) => {
      const token = await getToken()
      return apiFetch<InstagramMediaDetailResponse>(`/api/stores/me/instagram/media/${mediaId}`, token)
    },
  })
}

export function useInstagramProductPreview(productId: string, enabled: boolean) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['storefront-admin', 'instagram', 'preview', productId],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<InstagramProductPreviewResponse>(`/api/stores/me/instagram/publish/${productId}/preview`, token)
    },
    enabled,
  })
}

export function useInstagramPublish() {
  const { getToken } = useAuth()
  return useMutation({
    mutationFn: async ({ productId, message }: { productId: string; message?: string }) => {
      const token = await getToken()
      return apiFetch<InstagramPublishResponse>(`/api/stores/me/instagram/publish/${productId}`, token, {
        method: 'POST',
        body: JSON.stringify({ message }),
      })
    },
  })
}
