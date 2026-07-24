'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { getCartSessionId, setCartSessionId } from '@/lib/store/cart-session'
import type { PaginatedResult } from '@/lib/types/shared'
import type {
  AddCartItemRequest,
  CartResponse,
  CategoryResponse,
  CheckoutRequest,
  CollectionResponse,
  ContactMessageResponse,
  CreateContactMessageRequest,
  OptionFilterInput,
  OrderResponse,
  ProductDetailResponse,
  ProductFacetResponse,
  ProductPriceRangeResponse,
  ProductSummaryResponse,
  StorePageResponse,
  StoreResponse,
  UpdateCartItemRequest,
  ValidateDiscountCodeRequest,
  ValidateDiscountCodeResponse,
} from '@/lib/types/storefront'

export function useStore(slug: string) {
  return useQuery({
    queryKey: ['storefront', slug, 'store'],
    queryFn: () => apiFetch<StoreResponse>(`/api/stores/${slug}`, null),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategories(slug: string) {
  return useQuery({
    queryKey: ['storefront', slug, 'categories'],
    queryFn: () => apiFetch<CategoryResponse[]>(`/api/stores/${slug}/categories`, null),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCollections(slug: string) {
  return useQuery({
    queryKey: ['storefront', slug, 'collections'],
    queryFn: () => apiFetch<CollectionResponse[]>(`/api/stores/${slug}/collections`, null),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePages(slug: string) {
  return useQuery({
    queryKey: ['storefront', slug, 'pages'],
    queryFn: () => apiFetch<StorePageResponse[]>(`/api/stores/${slug}/pages`, null),
    staleTime: 5 * 60 * 1000,
  })
}

export interface ProductListParams {
  categorySlug?: string
  collectionSlug?: string
  page?: number
  pageSize?: number
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortDir?: string
  /** Selected option-value filters — values within a group are OR'd, separate groups are AND'd. */
  optionFilters?: OptionFilterInput[]
}

export function useProducts(slug: string, params: ProductListParams = {}) {
  const { categorySlug, collectionSlug, page = 1, pageSize = 20, search, minPrice, maxPrice, sortBy, sortDir, optionFilters } = params
  const activeFilters = (optionFilters ?? []).filter(f => f.values.length > 0)

  return useQuery({
    queryKey: ['storefront', slug, 'products', categorySlug, collectionSlug, page, pageSize, search, minPrice, maxPrice, sortBy, sortDir, activeFilters],
    queryFn: () => {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (categorySlug) qs.set('categorySlug', categorySlug)
      if (collectionSlug) qs.set('collectionSlug', collectionSlug)
      if (search) qs.set('search', search)
      if (minPrice != null) qs.set('minPrice', String(minPrice))
      if (maxPrice != null) qs.set('maxPrice', String(maxPrice))
      if (sortBy) qs.set('sortBy', sortBy)
      if (sortDir) qs.set('sortDir', sortDir)
      if (activeFilters.length > 0) qs.set('optionFilters', JSON.stringify(activeFilters))
      return apiFetch<PaginatedResult<ProductSummaryResponse>>(`/api/stores/${slug}/products?${qs}`, null)
    },
    placeholderData: prev => prev,
  })
}

export function useProductPriceRange(slug: string, categorySlug?: string) {
  return useQuery({
    queryKey: ['storefront', slug, 'products', 'price-range', categorySlug],
    queryFn: () => {
      const qs = categorySlug ? `?categorySlug=${categorySlug}` : ''
      return apiFetch<ProductPriceRangeResponse>(`/api/stores/${slug}/products/price-range${qs}`, null)
    },
    staleTime: 60 * 1000,
  })
}

export function useProductFacets(slug: string, categorySlug?: string) {
  return useQuery({
    queryKey: ['storefront', slug, 'products', 'facets', categorySlug],
    queryFn: () => {
      const qs = categorySlug ? `?categorySlug=${categorySlug}` : ''
      return apiFetch<ProductFacetResponse[]>(`/api/stores/${slug}/products/facets${qs}`, null)
    },
    staleTime: 60 * 1000,
  })
}

export function useProduct(slug: string, productSlug: string) {
  return useQuery({
    queryKey: ['storefront', slug, 'product', productSlug],
    queryFn: () => apiFetch<ProductDetailResponse>(`/api/stores/${slug}/products/${productSlug}`, null),
    enabled: !!productSlug,
  })
}

function cartHeaders(slug: string): HeadersInit {
  const sessionId = getCartSessionId(slug)
  return sessionId ? { 'X-Cart-Session': sessionId } : {}
}

function onCartResponse(slug: string, cart: CartResponse) {
  setCartSessionId(slug, cart.sessionId)
  return cart
}

export function useCart(slug: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['storefront', slug, 'cart'],
    queryFn: async () => {
      const cart = await apiFetch<CartResponse>(`/api/stores/${slug}/cart`, null, {
        headers: cartHeaders(slug),
      })
      return onCartResponse(slug, cart)
    },
    enabled: options.enabled ?? true,
  })
}

export function useAddCartItem(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: AddCartItemRequest) => {
      const cart = await apiFetch<CartResponse>(`/api/stores/${slug}/cart/items`, null, {
        method: 'POST',
        headers: cartHeaders(slug),
        body: JSON.stringify(body),
      })
      return onCartResponse(slug, cart)
    },
    onSuccess: cart => {
      queryClient.setQueryData(['storefront', slug, 'cart'], cart)
    },
  })
}

export function useUpdateCartItem(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ itemId, body }: { itemId: string; body: UpdateCartItemRequest }) => {
      const cart = await apiFetch<CartResponse>(`/api/stores/${slug}/cart/items/${itemId}`, null, {
        method: 'PUT',
        headers: cartHeaders(slug),
        body: JSON.stringify(body),
      })
      return onCartResponse(slug, cart)
    },
    onSuccess: cart => {
      queryClient.setQueryData(['storefront', slug, 'cart'], cart)
    },
  })
}

export function useRemoveCartItem(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: string) => {
      const cart = await apiFetch<CartResponse>(`/api/stores/${slug}/cart/items/${itemId}`, null, {
        method: 'DELETE',
        headers: cartHeaders(slug),
      })
      return onCartResponse(slug, cart)
    },
    onSuccess: cart => {
      queryClient.setQueryData(['storefront', slug, 'cart'], cart)
    },
  })
}

export function useSubmitContactMessage(slug: string) {
  return useMutation({
    mutationFn: (body: CreateContactMessageRequest) =>
      apiFetch<ContactMessageResponse>(`/api/stores/${slug}/contact-messages`, null, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  })
}

export function useValidateDiscountCode(slug: string) {
  return useMutation({
    mutationFn: (body: ValidateDiscountCodeRequest) =>
      apiFetch<ValidateDiscountCodeResponse>(`/api/stores/${slug}/discount-codes/validate`, null, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  })
}

export function useCheckout(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CheckoutRequest) =>
      apiFetch<OrderResponse>(`/api/stores/${slug}/checkout`, null, {
        method: 'POST',
        headers: cartHeaders(slug),
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront', slug, 'cart'] })
    },
  })
}
