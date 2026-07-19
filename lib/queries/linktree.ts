'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  AddLinkTreeItemRequest,
  LinkTreeItemResponse,
  LinkTreeResponse,
  ReorderLinkTreeItemsRequest,
  UpdateLinkTreeItemRequest,
} from '@/lib/types'

export function useLinkTreeBySlug(slug: string) {
  return useQuery({
    queryKey: ['linktree', slug],
    queryFn: () => apiFetch<LinkTreeResponse>(`/api/creators/${slug}/linktree`, null),
    enabled: !!slug,
  })
}

export function useMyLinkTree() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['linktree', 'me'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<LinkTreeResponse>('/api/creators/me/linktree', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useAddLinkTreeItem() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: AddLinkTreeItemRequest) => {
      const token = await getToken()
      return apiFetch<LinkTreeItemResponse>('/api/creators/me/linktree/items', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me'] })
    },
  })
}

export function useUpdateLinkTreeItem() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateLinkTreeItemRequest }) => {
      const token = await getToken()
      return apiFetch<LinkTreeItemResponse>(`/api/creators/me/linktree/items/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me'] })
    },
  })
}

export function useDeleteLinkTreeItem() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<void>(`/api/creators/me/linktree/items/${id}`, token, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me'] })
    },
  })
}

export function useReorderLinkTree() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: ReorderLinkTreeItemsRequest) => {
      const token = await getToken()
      return apiFetch<void>('/api/creators/me/linktree/reorder', token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me'] })
    },
  })
}
