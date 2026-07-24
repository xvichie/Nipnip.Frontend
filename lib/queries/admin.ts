'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  AdminConversionEntry,
  AdminCreateMerchantRequest,
  AdminCreateStoreRequest,
  AdminMerchantOwnerResponse,
  AdminPayoutSummaryResponse,
  AdminStatsResponse,
  CategoryResponse,
  CreateCategoryRequest,
  CreateProductImageRequest,
  CreateProductRequest,
  CreateProspectRequest,
  CreatorResponse,
  ImportFacebookRequest,
  ImportFacebookResponse,
  MerchantResponse,
  PaginatedResult,
  ProductDetailResponse,
  ProductImageResponse,
  ProductSummaryResponse,
  PromoteProspectRequest,
  ProspectResponse,
  StoreResponse,
  UpdateCategoryRequest,
  UpdateMerchantRequest,
  UpdateProductRequest,
  UpdateStoreRequest,
} from '@/lib/types'

export function useAdminStats() {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<AdminStatsResponse>('/api/admin/stats', token)
    },
  })
}

export function useAdminMerchants(page = 1, pageSize = 50) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'merchants', page, pageSize],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      return apiFetch<PaginatedResult<MerchantResponse>>(`/api/admin/merchants?${params}`, token)
    },
    placeholderData: prev => prev,
  })
}

export function useAdminMerchant(id: string) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'merchant', id],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<MerchantResponse>(`/api/admin/merchants/${id}`, token)
    },
    enabled: !!id,
  })
}

export function useAdminMerchantOwner(id: string) {
  return useQuery({
    queryKey: ['admin', 'merchant', id, 'owner'],
    queryFn: async () => {
      // Hits our own Next.js route (not the .NET backend) — it needs the Clerk secret key to
      // look up the owner's profile, so plain same-origin fetch, not apiFetch.
      const res = await fetch(`/api/admin/merchants/${id}/owner`)
      if (!res.ok) throw new Error('Failed to load owner')
      return res.json() as Promise<AdminMerchantOwnerResponse>
    },
    enabled: !!id,
  })
}

export function useAdminCreateMerchant() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: AdminCreateMerchantRequest) => {
      const token = await getToken()
      return apiFetch<MerchantResponse>('/api/admin/merchants', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useAdminUpdateMerchant(id: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateMerchantRequest) => {
      const token = await getToken()
      return apiFetch<MerchantResponse>(`/api/admin/merchants/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: updated => {
      queryClient.setQueryData(['admin', 'merchant', id], updated)
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] })
    },
  })
}

export function useAdminDeactivateMerchant() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<MerchantResponse>(`/api/admin/merchants/${id}`, token, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useAdminDeleteMerchantPermanently() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<void>(`/api/admin/merchants/${id}/permanent`, token, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useAdminToggleMerchantHighlight() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<MerchantResponse>(`/api/admin/merchants/${id}/highlight`, token, { method: 'PUT' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] })
      queryClient.invalidateQueries({ queryKey: ['merchants', 'highlighted'] })
    },
  })
}

export function useAdminToggleMerchantTest() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<MerchantResponse>(`/api/admin/merchants/${id}/test-flag`, token, { method: 'PUT' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] })
      queryClient.invalidateQueries({ queryKey: ['merchants'] })
    },
  })
}

export function useAdminMerchantStore(id: string) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'merchant', id, 'store'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<StoreResponse | null>(`/api/admin/merchants/${id}/store`, token)
    },
    enabled: !!id,
  })
}

export function useAdminCreateStore(id: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: AdminCreateStoreRequest) => {
      const token = await getToken()
      return apiFetch<StoreResponse>(`/api/admin/merchants/${id}/store`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: store => {
      queryClient.setQueryData(['admin', 'merchant', id, 'store'], store)
    },
  })
}

export function useAdminSetStoreThemeOverride(id: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { themeOverride: string | null }) => {
      const token = await getToken()
      return apiFetch<StoreResponse>(`/api/admin/merchants/${id}/store/theme-override`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: store => {
      queryClient.setQueryData(['admin', 'merchant', id, 'store'], store)
    },
  })
}

export function useAdminToggleCreatorHighlight() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<CreatorResponse>(`/api/admin/creators/${id}/highlight`, token, { method: 'PUT' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'creators'] })
      queryClient.invalidateQueries({ queryKey: ['creators', 'highlighted'] })
    },
  })
}

export function useAdminToggleCreatorTest() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<CreatorResponse>(`/api/admin/creators/${id}/test-flag`, token, { method: 'PUT' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'creators'] })
      queryClient.invalidateQueries({ queryKey: ['creators'] })
    },
  })
}

export function useAdminCreators(page = 1, pageSize = 50) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'creators', page, pageSize],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      return apiFetch<PaginatedResult<CreatorResponse>>(`/api/admin/creators?${params}`, token)
    },
    placeholderData: prev => prev,
  })
}

export function useAdminPayoutSummary({ from, to }: { from?: string; to?: string } = {}) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'payout-summary', from, to],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams()
      if (from) params.set('from', new Date(from).toISOString())
      if (to) params.set('to', new Date(`${to}T23:59:59`).toISOString())
      return apiFetch<AdminPayoutSummaryResponse>(`/api/admin/payout-summary?${params}`, token)
    },
  })
}

export function useAdminConversions({
  from,
  to,
  page = 1,
  pageSize = 50,
}: {
  from?: string
  to?: string
  page?: number
  pageSize?: number
} = {}) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'conversions', from, to, page, pageSize],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (from) params.set('from', new Date(from).toISOString())
      if (to) params.set('to', new Date(`${to}T23:59:59`).toISOString())
      return apiFetch<PaginatedResult<AdminConversionEntry>>(`/api/admin/conversions?${params}`, token)
    },
    placeholderData: prev => prev,
  })
}

// --- Prospects (admin-built sales-demo stores) ---

export function useAdminProspects(page = 1, pageSize = 50) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'prospects', page, pageSize],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      return apiFetch<PaginatedResult<MerchantResponse>>(`/api/admin/prospects?${params}`, token)
    },
    placeholderData: prev => prev,
  })
}

export function useAdminCreateProspect() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateProspectRequest) => {
      const token = await getToken()
      return apiFetch<ProspectResponse>('/api/admin/prospects', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'prospects'] }),
  })
}

export function useAdminPromoteProspect(id: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: PromoteProspectRequest) => {
      const token = await getToken()
      return apiFetch<MerchantResponse>(`/api/admin/merchants/${id}/promote`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'prospects'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchant', id] })
    },
  })
}

export function useAdminDeleteProspect() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<void>(`/api/admin/prospects/${id}`, token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'prospects'] }),
  })
}

export function useAdminImportFacebook() {
  const { getToken } = useAuth()
  return useMutation({
    mutationFn: async (body: ImportFacebookRequest) => {
      const token = await getToken()
      return apiFetch<ImportFacebookResponse>('/api/admin/prospects/import-facebook', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
  })
}

export function useAdminUpdateMerchantStore(merchantId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateStoreRequest) => {
      const token = await getToken()
      return apiFetch<StoreResponse>(`/api/admin/merchants/${merchantId}/store`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: store => {
      queryClient.setQueryData(['admin', 'merchant', merchantId, 'store'], store)
    },
  })
}

// --- Prospect products/categories (admin manages these on the prospect's behalf) ---

export function useAdminMerchantProducts(merchantId: string, page = 1, pageSize = 50) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'merchant', merchantId, 'products', page, pageSize],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      return apiFetch<PaginatedResult<ProductSummaryResponse>>(`/api/admin/merchants/${merchantId}/products?${params}`, token)
    },
    enabled: !!merchantId,
    placeholderData: prev => prev,
  })
}

export function useAdminCreateMerchantProduct(merchantId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateProductRequest) => {
      const token = await getToken()
      return apiFetch<ProductDetailResponse>(`/api/admin/merchants/${merchantId}/products`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'merchant', merchantId, 'products'] }),
  })
}

export function useAdminUpdateMerchantProduct(merchantId: string, productId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateProductRequest) => {
      const token = await getToken()
      return apiFetch<ProductDetailResponse>(`/api/admin/merchants/${merchantId}/products/${productId}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'merchant', merchantId, 'products'] }),
  })
}

export function useAdminDeleteMerchantProduct(merchantId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (productId: string) => {
      const token = await getToken()
      await apiFetch<void>(`/api/admin/merchants/${merchantId}/products/${productId}`, token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'merchant', merchantId, 'products'] }),
  })
}

// productId is passed per-call (not bound via the hook, like the merchantId is) because this
// is most often used right after creating a product in the same interaction — a hook-level
// productId would close over a stale value from before that product existed.
export function useAdminCreateMerchantProductImage(merchantId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ productId, body }: { productId: string; body: CreateProductImageRequest }) => {
      const token = await getToken()
      return apiFetch<ProductImageResponse>(`/api/admin/merchants/${merchantId}/products/${productId}/images`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'merchant', merchantId, 'products'] }),
  })
}

export function useAdminDeleteMerchantProductImage(merchantId: string, productId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (imageId: string) => {
      const token = await getToken()
      await apiFetch<void>(`/api/admin/merchants/${merchantId}/products/${productId}/images/${imageId}`, token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'merchant', merchantId, 'products'] }),
  })
}

export function useAdminMerchantCategories(merchantId: string) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['admin', 'merchant', merchantId, 'categories'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<CategoryResponse[]>(`/api/admin/merchants/${merchantId}/categories`, token)
    },
    enabled: !!merchantId,
  })
}

export function useAdminCreateMerchantCategory(merchantId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateCategoryRequest) => {
      const token = await getToken()
      return apiFetch<CategoryResponse>(`/api/admin/merchants/${merchantId}/categories`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'merchant', merchantId, 'categories'] }),
  })
}

export function useAdminUpdateMerchantCategory(merchantId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateCategoryRequest }) => {
      const token = await getToken()
      return apiFetch<CategoryResponse>(`/api/admin/merchants/${merchantId}/categories/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'merchant', merchantId, 'categories'] }),
  })
}

export function useAdminDeleteMerchantCategory(merchantId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      await apiFetch<void>(`/api/admin/merchants/${merchantId}/categories/${id}`, token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'merchant', merchantId, 'categories'] }),
  })
}
