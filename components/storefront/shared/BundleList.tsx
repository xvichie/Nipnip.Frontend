'use client'

import { useState } from 'react'
import { useBundles } from '@/lib/queries/storefront'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import { getThemeDefinition, RADIUS_CLASS, SURFACE_CLASSES } from '@/lib/storefront-themes'
import type { ThemeConfig, ThemeId } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

export function BundleList({
  slug,
  themeId,
  tokens,
}: {
  slug: string
  themeId: ThemeId
  tokens: Required<ThemeConfig>
}) {
  const { data: bundles, isLoading } = useBundles(slug)
  const { addBundle } = useStorefrontCart()
  const surface = SURFACE_CLASSES[themeId]
  const radius = RADIUS_CLASS[getThemeDefinition(themeId).radius]
  const [addingId, setAddingId] = useState<string | null>(null)

  async function handleAdd(bundleId: string) {
    setAddingId(bundleId)
    try {
      await addBundle(bundleId, 1)
    } finally {
      setAddingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className={`${surface.page} ${surface.muted} min-h-screen flex items-center justify-center text-sm`}>
        იტვირთება...
      </div>
    )
  }

  if (!bundles || bundles.length === 0) {
    return (
      <div className={`${surface.page} min-h-screen flex flex-col items-center justify-center text-center px-4 py-24`}>
        <h1 className={`font-black text-2xl mb-3 ${surface.text}`}>ბანდლები არ არის</h1>
      </div>
    )
  }

  return (
    <div className={`${surface.page} min-h-screen`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <h1 className={`font-black text-3xl tracking-tight mb-8 ${surface.text}`}>ბანდლები</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map(bundle => {
            const savings = bundle.regularTotal - bundle.bundlePrice
            return (
              <div key={bundle.id} className={`${surface.card} border ${surface.border} ${radius} p-5 flex flex-col gap-4`}>
                <div className={`w-full aspect-square overflow-hidden ${radius} ${surface.border} border`}>
                  {bundle.imageUrl ? (
                    <CImg src={bundle.imageUrl} alt={bundle.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-xs ${surface.muted}`}>სურათი არ არის</div>
                  )}
                </div>
                <div>
                  <h2 className={`font-bold text-lg ${surface.text}`}>{bundle.name}</h2>
                  <p className={`text-xs mt-1 ${surface.muted}`}>
                    {bundle.items.map(i => `${i.productName} ×${i.quantity}`).join(' · ')}
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`font-black text-xl ${surface.text}`}>₾{bundle.bundlePrice.toFixed(2)}</span>
                  {savings > 0 && (
                    <span className={`text-xs line-through ${surface.muted}`}>₾{bundle.regularTotal.toFixed(2)}</span>
                  )}
                  {savings > 0 && (
                    <span className="text-xs font-semibold text-emerald-500">დაზოგე ₾{savings.toFixed(2)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleAdd(bundle.id)}
                  disabled={addingId === bundle.id}
                  className={`py-3 text-white text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-90 disabled:opacity-40 ${radius}`}
                  style={{ backgroundColor: tokens.accentColor }}
                >
                  {addingId === bundle.id ? '...' : 'კალათაში დამატება'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
