'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { apiFetch } from '@/lib/api'
import type {
  CategoryResponse,
  ContactMessageResponse,
  CreateCategoryRequest,
  CreateOrderNoteRequest,
  CreateProductImageRequest,
  CreateProductOptionRequest,
  CreateProductOptionValueRequest,
  CreateProductRequest,
  CreateProductVariantRequest,
  MonthlyOrderSummary,
  NewOrderCountResponse,
  OrderDetailResponse,
  OrderStatus,
  PaginatedResult,
  ProductDetailResponse,
  ProductImageResponse,
  ProductOptionResponse,
  ProductOptionValueResponse,
  ProductSummaryResponse,
  ProductVariantResponse,
  ReorderProductImagesRequest,
  SetStoreDomainRequest,
  StoreDomainResponse,
  StorePageResponse,
  StoreResponse,
  CreateStorePageRequest,
  UnreadContactMessageCountResponse,
  UpdatePaymentConfirmedRequest,
  UpdateCategoryRequest,
  UpdateProductRequest,
  UpdateProductVariantRequest,
  UpdateStorePageRequest,
  UpdateStoreRequest,
} from '@/lib/types'

// --- Store ---

export function useMyStore() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  return useQuery({
    queryKey: ['storefront-admin', 'store'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<StoreResponse>('/api/stores/me', token)
    },
    enabled: isLoaded && !!isSignedIn,
    retry: false,
  })
}

export function useUpdateMyStore() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateStoreRequest) => {
      const token = await getToken()
      return apiFetch<StoreResponse>('/api/stores/me', token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: store => {
      queryClient.setQueryData(['storefront-admin', 'store'], store)
    },
  })
}

export function useMyStoreDomain() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  return useQuery({
    queryKey: ['storefront-admin', 'store', 'domain'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<StoreDomainResponse>('/api/stores/me/domain', token)
    },
    enabled: isLoaded && !!isSignedIn,
    staleTime: 30 * 1000,
  })
}

export function useSetStoreDomain() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: SetStoreDomainRequest) => {
      const token = await getToken()
      return apiFetch<StoreDomainResponse>('/api/stores/me/domain', token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: domain => {
      queryClient.setQueryData(['storefront-admin', 'store', 'domain'], domain)
    },
  })
}

export function useRemoveStoreDomain() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      await apiFetch<void>('/api/stores/me/domain', token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'store', 'domain'] }),
  })
}

// --- Categories ---

export function useMyCategories() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  return useQuery({
    queryKey: ['storefront-admin', 'categories'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<CategoryResponse[]>('/api/stores/me/categories', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useCreateCategory() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateCategoryRequest) => {
      const token = await getToken()
      return apiFetch<CategoryResponse>('/api/stores/me/categories', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'categories'] }),
  })
}

export function useUpdateCategory() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateCategoryRequest }) => {
      const token = await getToken()
      return apiFetch<CategoryResponse>(`/api/stores/me/categories/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'categories'] }),
  })
}

export function useDeleteCategory() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      await apiFetch<void>(`/api/stores/me/categories/${id}`, token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'categories'] }),
  })
}

// --- Store Pages ---

export function useMyPages() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  return useQuery({
    queryKey: ['storefront-admin', 'pages'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<StorePageResponse[]>('/api/stores/me/pages', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useCreatePage() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateStorePageRequest) => {
      const token = await getToken()
      return apiFetch<StorePageResponse>('/api/stores/me/pages', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'pages'] }),
  })
}

export function useUpdatePage() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateStorePageRequest }) => {
      const token = await getToken()
      return apiFetch<StorePageResponse>(`/api/stores/me/pages/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'pages'] }),
  })
}

export function useDeletePage() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      await apiFetch<void>(`/api/stores/me/pages/${id}`, token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'pages'] }),
  })
}

// --- Contact messages ---

export function useMyContactMessages(params: { page?: number; pageSize?: number } = {}) {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  const { page = 1, pageSize = 20 } = params

  return useQuery({
    queryKey: ['storefront-admin', 'contact-messages', page, pageSize],
    queryFn: async () => {
      const token = await getToken()
      const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      return apiFetch<PaginatedResult<ContactMessageResponse>>(`/api/stores/me/contact-messages?${query}`, token)
    },
    enabled: isLoaded && !!isSignedIn,
    placeholderData: prev => prev,
  })
}

export function useMyUnreadContactMessageCount() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['storefront-admin', 'contact-messages', 'unread-count'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<UnreadContactMessageCountResponse>('/api/stores/me/contact-messages/unread-count', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

export function useMarkContactMessageRead() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<ContactMessageResponse>(`/api/stores/me/contact-messages/${id}/read`, token, { method: 'POST' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'contact-messages'] }),
  })
}

// --- Orders ---

export function useMyOrders(params: { page?: number; pageSize?: number; status?: OrderStatus; month?: number; year?: number } = {}) {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  const { page = 1, pageSize = 20, status, month, year } = params

  return useQuery({
    queryKey: ['storefront-admin', 'orders', page, pageSize, status, month, year],
    queryFn: async () => {
      const token = await getToken()
      const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (status) query.set('status', status)
      if (month != null) query.set('month', String(month))
      if (year != null) query.set('year', String(year))
      return apiFetch<PaginatedResult<OrderDetailResponse>>(`/api/stores/me/orders?${query}`, token)
    },
    enabled: isLoaded && !!isSignedIn,
    placeholderData: prev => prev,
  })
}

export function useMyOrdersMonthly(status?: OrderStatus) {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['storefront-admin', 'orders', 'monthly', status],
    queryFn: async () => {
      const token = await getToken()
      const query = new URLSearchParams()
      if (status) query.set('status', status)
      return apiFetch<MonthlyOrderSummary[]>(`/api/stores/me/orders/monthly?${query}`, token)
    },
    enabled: isLoaded && !!isSignedIn,
    staleTime: 60 * 1000,
  })
}

export function useUpdateOrderStatus() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const token = await getToken()
      return apiFetch<OrderDetailResponse>(`/api/stores/me/orders/${id}/status`, token, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'orders'] }),
  })
}

export function useUpdatePaymentConfirmed() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, confirmed }: { id: string; confirmed: boolean }) => {
      const token = await getToken()
      return apiFetch<OrderDetailResponse>(`/api/stores/me/orders/${id}/payment-confirmed`, token, {
        method: 'PUT',
        body: JSON.stringify({ confirmed } satisfies UpdatePaymentConfirmedRequest),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'orders'] }),
  })
}

export function useAddOrderNote() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const token = await getToken()
      return apiFetch<OrderDetailResponse>(`/api/stores/me/orders/${id}/notes`, token, {
        method: 'POST',
        body: JSON.stringify({ content } satisfies CreateOrderNoteRequest),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'orders'] }),
  })
}

export function useMyNewOrderCount() {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()

  return useQuery({
    queryKey: ['storefront-admin', 'orders', 'new-count'],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<NewOrderCountResponse>('/api/stores/me/orders/new-count', token)
    },
    enabled: isLoaded && !!isSignedIn,
  })
}

// --- Products ---

export interface MyProductsParams {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: string
  isActive?: boolean
  sortBy?: 'name' | 'price' | 'createdAt'
  sortDir?: 'asc' | 'desc'
}

export function useMyProducts(params: MyProductsParams = {}) {
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn } = useUser()
  const { page = 1, pageSize = 20, search, categoryId, isActive, sortBy, sortDir } = params

  return useQuery({
    queryKey: ['storefront-admin', 'products', page, pageSize, search, categoryId, isActive, sortBy, sortDir],
    queryFn: async () => {
      const token = await getToken()
      const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) query.set('search', search)
      if (categoryId) query.set('categoryId', categoryId)
      if (isActive !== undefined) query.set('isActive', String(isActive))
      if (sortBy) query.set('sortBy', sortBy)
      if (sortDir) query.set('sortDir', sortDir)
      return apiFetch<PaginatedResult<ProductSummaryResponse>>(`/api/stores/me/products?${query}`, token)
    },
    enabled: isLoaded && !!isSignedIn,
    placeholderData: prev => prev,
  })
}

export function useMyProduct(id: string) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['storefront-admin', 'product', id],
    queryFn: async () => {
      const token = await getToken()
      return apiFetch<ProductDetailResponse>(`/api/stores/me/products/${id}`, token)
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateProductRequest) => {
      const token = await getToken()
      return apiFetch<ProductDetailResponse>('/api/stores/me/products', token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'products'] }),
  })
}

export function useUpdateProduct(id: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateProductRequest) => {
      const token = await getToken()
      return apiFetch<ProductDetailResponse>(`/api/stores/me/products/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: updated => {
      queryClient.setQueryData(['storefront-admin', 'product', id], updated)
      queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'products'] })
    },
  })
}

export function useDeleteProduct() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      await apiFetch<void>(`/api/stores/me/products/${id}`, token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'products'] }),
  })
}

export function useDuplicateProduct() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return apiFetch<ProductDetailResponse>(`/api/stores/me/products/${id}/duplicate`, token, { method: 'POST' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'products'] }),
  })
}

// --- Product images ---

export function useCreateProductImage(productId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateProductImageRequest) => {
      const token = await getToken()
      return apiFetch<ProductImageResponse>(`/api/products/${productId}/images`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'product', productId] }),
  })
}

export function useDeleteProductImage(productId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (imageId: string) => {
      const token = await getToken()
      await apiFetch<void>(`/api/products/${productId}/images/${imageId}`, token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'product', productId] }),
  })
}

export function useReorderProductImages(productId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: ReorderProductImagesRequest) => {
      const token = await getToken()
      await apiFetch<void>(`/api/products/${productId}/images/reorder`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'product', productId] }),
  })
}

// --- Product options + values ---

export function useCreateProductOption(productId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateProductOptionRequest) => {
      const token = await getToken()
      return apiFetch<ProductOptionResponse>(`/api/products/${productId}/options`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'product', productId] }),
  })
}

export function useDeleteProductOption(productId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (optionId: string) => {
      const token = await getToken()
      await apiFetch<void>(`/api/products/${productId}/options/${optionId}`, token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'product', productId] }),
  })
}

export function useCreateProductOptionValue(productId: string, optionId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateProductOptionValueRequest) => {
      const token = await getToken()
      return apiFetch<ProductOptionValueResponse>(`/api/products/${productId}/options/${optionId}/values`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'product', productId] }),
  })
}

export function useDeleteProductOptionValue(productId: string, optionId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (valueId: string) => {
      const token = await getToken()
      await apiFetch<void>(`/api/products/${productId}/options/${optionId}/values/${valueId}`, token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'product', productId] }),
  })
}

// --- Product variants ---

export function useCreateProductVariant(productId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateProductVariantRequest) => {
      const token = await getToken()
      return apiFetch<ProductVariantResponse>(`/api/products/${productId}/variants`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'product', productId] }),
  })
}

export function useUpdateProductVariant(productId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ variantId, body }: { variantId: string; body: UpdateProductVariantRequest }) => {
      const token = await getToken()
      return apiFetch<ProductVariantResponse>(`/api/products/${productId}/variants/${variantId}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'product', productId] }),
  })
}

export function useDeleteProductVariant(productId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variantId: string) => {
      const token = await getToken()
      await apiFetch<void>(`/api/products/${productId}/variants/${variantId}`, token, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storefront-admin', 'product', productId] }),
  })
}
