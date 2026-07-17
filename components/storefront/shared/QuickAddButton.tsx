'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import type { ProductDetailResponse } from '@/lib/types/storefront'

type Status = 'idle' | 'pending' | 'added'

export function QuickAddButton({
  slug,
  productSlug,
  className,
  style,
}: {
  slug: string
  productSlug: string
  className: string
  style?: React.CSSProperties
}) {
  const router = useRouter()
  const { addItem, preview } = useStorefrontCart()
  const [status, setStatus] = useState<Status>('idle')

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (status === 'pending' || preview) return

    setStatus('pending')
    try {
      const detail = await apiFetch<ProductDetailResponse>(`/api/stores/${slug}/products/${productSlug}`, null)
      const purchasableOptions = detail.options.filter(o => o.values.length > 0)
      const soleVariant = detail.variants[0]
      const soldOut = soleVariant && soleVariant.stock !== null && soleVariant.stock <= 0

      if (purchasableOptions.length > 0 || soldOut) {
        // Needs a size/variant pick, or the only override is sold out — let them choose on the product page.
        router.push(`/products/${productSlug}`)
        setStatus('idle')
      } else {
        // No options: sells at base price with unlimited stock unless overridden above.
        await addItem(detail.id, [], 1)
        setStatus('added')
        setTimeout(() => setStatus('idle'), 1500)
      }
    } catch {
      router.push(`/products/${productSlug}`)
      setStatus('idle')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === 'pending'}
      aria-label="სწრაფად კალათაში დამატება"
      title="კალათაში დამატება"
      className={className}
      style={style}
    >
      {status === 'pending' ? (
        <>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="animate-spin shrink-0">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" opacity="0.25" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          დამატება...
        </>
      ) : status === 'added' ? (
        <>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
            <path d="M3 8.5l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          დამატებულია
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
            <path d="M1 1h2.2l1.8 8h7.6L14 4H4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6.5" cy="13.5" r="1" fill="currentColor" />
            <circle cx="11" cy="13.5" r="1" fill="currentColor" />
          </svg>
          კალათაში დამატება
        </>
      )}
    </button>
  )
}
