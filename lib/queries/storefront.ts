'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { getCartSessionId, setCartSessionId } from '@/lib/store/cart-session'
import type {
  AddCartItemRequest,
  CartResponse,
  CategoryResponse,
  CheckoutRequest,
  ContactMessageResponse,
  CreateContactMessageRequest,
  OrderResponse,
  ProductDetailResponse,
  ProductSummaryResponse,
  StoreResponse,
  UpdateCartItemRequest,
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

export function useProducts(slug: string, categoryId?: string) {
  return useQuery({
    queryKey: ['storefront', slug, 'products', categoryId],
    queryFn: () => {
      const qs = categoryId ? `?categoryId=${categoryId}` : ''
      return apiFetch<ProductSummaryResponse[]>(`/api/stores/${slug}/products${qs}`, null)
    },
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
