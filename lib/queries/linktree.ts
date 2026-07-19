'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  AddLinkTreeItemRequest,
  CreateLinkTreeRequest,
  LinkTreeDetailResponse,
  LinkTreeItemResponse,
  LinkTreeSummaryResponse,
  PublicLinkTreeResponse,
  ReorderLinkTreeItemsRequest,
  UpdateLinkTreeItemRequest,
  UpdateLinkTreeRequest,
} from '@/lib/types'

export function usePublicLinkTreeBySlug(slug: string) {
  return useQuery({
    queryKey: ['linktree', 'public', 'slug', slug],
    queryFn: () => apiFetch<PublicLinkTreeResponse>(`/api/linktrees/${slug}`, null),
    enabled: !!slug,
  })
}

export function usePublicLinkTreeByCreatorSlug(creatorSlug: string) {
  return useQuery({
    queryKey: ['linktree', 'public', 'creator', creatorSlug],
    queryFn: () => apiFetch<PublicLinkTreeResponse>(`/api/linktrees/by-creator/${creatorSlug}`, null),
    enabled: !!creatorSlug,
  })
}

export function useMyLinkTrees() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['linktree', 'me'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<LinkTreeSummaryResponse[]>('/api/linktrees/me', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useLinkTreeDetail(id: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['linktree', 'me', id],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<LinkTreeDetailResponse>(`/api/linktrees/me/${id}`, token)
    },
    enabled: !!id,
  })
}

export function useCreateLinkTree() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateLinkTreeRequest) => {
      const token = await getToken()
      return apiFetch<LinkTreeSummaryResponse>('/api/linktrees', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me'] })
    },
  })
}

export function useUpdateLinkTree() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateLinkTreeRequest }) => {
      const token = await getToken()
      return apiFetch<LinkTreeSummaryResponse>(`/api/linktrees/me/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me'] })
    },
  })
}

export function useDeleteLinkTree() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<void>(`/api/linktrees/me/${id}`, token, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me'] })
    },
  })
}

export function useSetDefaultLinkTree() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<void>(`/api/linktrees/me/${id}/set-default`, token, { method: 'PUT' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me'] })
    },
  })
}

export function useAddLinkTreeItem() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ treeId, body }: { treeId: string; body: AddLinkTreeItemRequest }) => {
      const token = await getToken()
      return apiFetch<LinkTreeItemResponse>(`/api/linktrees/me/${treeId}/items`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: (_, { treeId }) => {
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me', treeId] })
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me'] })
    },
  })
}

export function useUpdateLinkTreeItem(treeId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateLinkTreeItemRequest }) => {
      const token = await getToken()
      return apiFetch<LinkTreeItemResponse>(`/api/linktrees/me/items/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me', treeId] })
    },
  })
}

export function useDeleteLinkTreeItem(treeId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<void>(`/api/linktrees/me/items/${id}`, token, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me', treeId] })
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me'] })
    },
  })
}

export function useReorderLinkTree(treeId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: ReorderLinkTreeItemsRequest) => {
      const token = await getToken()
      return apiFetch<void>(`/api/linktrees/me/${treeId}/reorder`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree', 'me', treeId] })
    },
  })
}
