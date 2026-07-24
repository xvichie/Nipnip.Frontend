'use client'

import { createContext, useContext } from 'react'
import {
  useAddBundleToCart,
  useAddCartItem,
  useCart,
  useRemoveCartBundleItem,
  useRemoveCartItem,
  useUpdateCartBundleItem,
  useUpdateCartItem,
} from '@/lib/queries/storefront'
import { useStorefrontToast } from '@/lib/store/storefront-toast-context'
import type { CartResponse } from '@/lib/types/storefront'

type StorefrontCartContextValue = {
  cart: CartResponse | undefined
  isLoading: boolean
  count: number
  preview: boolean
  addItem: (productId: string, optionValueIds: string[], quantity: number) => Promise<void>
  updateItem: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  addBundle: (bundleId: string, quantity: number) => Promise<void>
  updateBundleItem: (itemId: string, quantity: number) => void
  removeBundleItem: (itemId: string) => void
}

const StorefrontCartContext = createContext<StorefrontCartContextValue | null>(null)

export function StorefrontCartProvider({
  slug,
  preview = false,
  children,
}: {
  slug: string
  preview?: boolean
  children: React.ReactNode
}) {
  const { data: cart, isLoading } = useCart(slug, { enabled: !preview })
  const addMutation = useAddCartItem(slug)
  const updateMutation = useUpdateCartItem(slug)
  const removeMutation = useRemoveCartItem(slug)
  const addBundleMutation = useAddBundleToCart(slug)
  const updateBundleMutation = useUpdateCartBundleItem(slug)
  const removeBundleMutation = useRemoveCartBundleItem(slug)
  const { showToast } = useStorefrontToast()

  const count = (cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0)
    + (cart?.bundleItems.reduce((sum, item) => sum + item.quantity, 0) ?? 0)

  return (
    <StorefrontCartContext.Provider
      value={{
        cart,
        isLoading: preview ? false : isLoading,
        count,
        preview,
        addItem: async (productId, optionValueIds, quantity) => {
          if (preview) return
          await addMutation.mutateAsync({ productId, optionValueIds, quantity })
          showToast('პროდუქტი დაემატა კალათაში')
        },
        updateItem: (itemId, quantity) => { if (!preview) updateMutation.mutate({ itemId, body: { quantity } }) },
        removeItem: itemId => { if (!preview) removeMutation.mutate(itemId) },
        addBundle: async (bundleId, quantity) => {
          if (preview) return
          await addBundleMutation.mutateAsync({ bundleId, quantity })
          showToast('ბანდლი დაემატა კალათაში')
        },
        updateBundleItem: (itemId, quantity) => { if (!preview) updateBundleMutation.mutate({ itemId, body: { quantity } }) },
        removeBundleItem: itemId => { if (!preview) removeBundleMutation.mutate(itemId) },
      }}
    >
      {children}
    </StorefrontCartContext.Provider>
  )
}

export function useStorefrontCart() {
  const ctx = useContext(StorefrontCartContext)
  if (!ctx) throw new Error('useStorefrontCart must be used inside StorefrontCartProvider')
  return ctx
}
