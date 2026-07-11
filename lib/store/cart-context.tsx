'use client'

import { createContext, useContext, useEffect, useReducer } from 'react'
import type { Product } from './products'

export type CartItem = {
  product: Product
  color: string
  size: string
  quantity: number
}

type CartState = { items: CartItem[] }

type CartAction =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; productId: string; color: string; size: string }
  | { type: 'UPDATE_QTY'; productId: string; color: string; size: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] }

function key(productId: string, color: string, size: string) {
  return `${productId}::${color}::${size}`
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items }

    case 'ADD': {
      const k = key(action.item.product.id, action.item.color, action.item.size)
      const existing = state.items.findIndex(
        i => key(i.product.id, i.color, i.size) === k
      )
      if (existing >= 0) {
        const items = [...state.items]
        items[existing] = {
          ...items[existing],
          quantity: items[existing].quantity + action.item.quantity,
        }
        return { items }
      }
      return { items: [...state.items, action.item] }
    }

    case 'REMOVE':
      return {
        items: state.items.filter(
          i => key(i.product.id, i.color, i.size) !== key(action.productId, action.color, action.size)
        ),
      }

    case 'UPDATE_QTY': {
      if (action.quantity <= 0) {
        return {
          items: state.items.filter(
            i => key(i.product.id, i.color, i.size) !== key(action.productId, action.color, action.size)
          ),
        }
      }
      return {
        items: state.items.map(i =>
          key(i.product.id, i.color, i.size) === key(action.productId, action.color, action.size)
            ? { ...i, quantity: action.quantity }
            : i
        ),
      }
    }

    case 'CLEAR':
      return { items: [] }
  }
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (item: CartItem) => void
  removeItem: (productId: string, color: string, size: string) => void
  updateQty: (productId: string, color: string, size: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const LS_KEY = 'nipnip_shoes_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) dispatch({ type: 'HYDRATE', items: JSON.parse(raw) })
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state.items))
    } catch {}
  }, [state.items])

  const count = state.items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = state.items.reduce((s, i) => s + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        count,
        subtotal,
        addItem: item => dispatch({ type: 'ADD', item }),
        removeItem: (productId, color, size) =>
          dispatch({ type: 'REMOVE', productId, color, size }),
        updateQty: (productId, color, size, quantity) =>
          dispatch({ type: 'UPDATE_QTY', productId, color, size, quantity }),
        clear: () => dispatch({ type: 'CLEAR' }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
