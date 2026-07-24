'use client'

import { useEffect, useState, type RefObject } from 'react'

// Shown only on small screens, once the real add-to-cart button (passed in via `triggerRef`)
// has scrolled out of view — driven by IntersectionObserver rather than a scroll-position
// calculation, so there's no layout thrash.
export function StickyAddToCartBar({
  triggerRef,
  productName,
  priceLabel,
  disabled,
  addedLabel,
  label,
  onAdd,
  accentColor,
}: {
  triggerRef: RefObject<HTMLElement | null>
  productName: string
  priceLabel: string
  disabled: boolean
  addedLabel: string | null
  label: string
  onAdd: () => void
  accentColor: string
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting))
    observer.observe(trigger)
    return () => observer.disconnect()
  }, [triggerRef])

  if (!visible) return null

  return (
    <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-black/10 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-[#111] truncate">{productName}</p>
        <p className="text-sm font-bold text-[#111]">{priceLabel}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onAdd}
        className="shrink-0 px-5 py-2.5 rounded-full text-white text-xs font-semibold uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: accentColor }}
      >
        {addedLabel ?? label}
      </button>
    </div>
  )
}
