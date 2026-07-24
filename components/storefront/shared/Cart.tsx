'use client'

import Link from 'next/link'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import { SURFACE_CLASSES } from '@/lib/storefront-themes'
import { getRadiusClass } from '@/lib/store/theme-config'
import type { ThemeConfig, ThemeId } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

export function Cart({
  slug,
  themeId,
  tokens,
}: {
  slug: string
  themeId: ThemeId
  tokens: Required<ThemeConfig>
}) {
  const { cart, isLoading, updateItem, removeItem, updateBundleItem, removeBundleItem } = useStorefrontCart()
  const surface = SURFACE_CLASSES[themeId]
  const radius = getRadiusClass(themeId, tokens)
  const hasStockIssue = cart?.items.some(item => item.stock !== null && item.quantity > item.stock) ?? false

  if (isLoading) {
    return (
      <div className={`${surface.page} ${surface.muted} min-h-screen flex items-center justify-center text-sm`}>
        იტვირთება...
      </div>
    )
  }

  if (!cart || (cart.items.length === 0 && cart.bundleItems.length === 0)) {
    return (
      <div className={`${surface.page} min-h-screen flex flex-col items-center justify-center text-center px-4 py-24`}>
        <h1 className={`font-black text-2xl mb-3 ${surface.text}`}>თქვენი კალათა ცარიელია</h1>
        <p className={`text-sm mb-8 ${surface.muted}`}>დაათვალიერეთ კოლექცია და აირჩიეთ სასურველი პროდუქტი.</p>
        <Link
          href={`/`}
          className={`text-white text-sm font-semibold px-8 py-3.5 ${radius}`}
          style={{ backgroundColor: tokens.accentColor }}
        >
          შოპინგის გაგრძელება
        </Link>
      </div>
    )
  }

  return (
    <div className={`${surface.page} min-h-screen`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <div className={`mb-8 pb-6 border-b ${surface.border}`}>
          <h1 className={`font-black text-3xl tracking-tight ${surface.text}`}>თქვენი კალათა</h1>
          <p className={`text-sm mt-1 ${surface.muted}`}>
            {cart.items.length + cart.bundleItems.length} ნივთი
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className={`lg:col-span-2 flex flex-col divide-y ${surface.border}`}>
            {cart.bundleItems.map(item => (
              <div key={item.id} className="flex gap-4 py-6">
                <Link
                  href={`/bundles`}
                  className={`w-20 h-20 shrink-0 overflow-hidden ${radius} ${surface.card} border ${surface.border}`}
                >
                  {item.imageUrl ? (
                    <CImg src={item.imageUrl} alt={item.bundleName} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-[10px] ${surface.muted}`}>
                      სურათი არ არის
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link
                      href={`/bundles`}
                      className={`font-semibold text-sm leading-snug hover:underline underline-offset-2 ${surface.text}`}
                    >
                      {item.bundleName} <span className="text-xs font-normal opacity-60">(ბანდლი)</span>
                    </Link>
                    <button
                      onClick={() => removeBundleItem(item.id)}
                      className={`${surface.muted} hover:text-red-400 transition-colors shrink-0 ml-2`}
                      aria-label="ბანდლის წაშლა"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center border ${surface.border} ${radius}`}>
                      <button
                        onClick={() => updateBundleItem(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className={`w-8 h-8 flex items-center justify-center ${surface.muted} hover:opacity-100 transition-colors text-lg disabled:opacity-30`}
                      >
                        −
                      </button>
                      <span className={`w-8 text-center text-sm font-medium tabular-nums ${surface.text}`}>{item.quantity}</span>
                      <button
                        onClick={() => updateBundleItem(item.id, item.quantity + 1)}
                        className={`w-8 h-8 flex items-center justify-center ${surface.muted} hover:opacity-100 transition-colors text-lg`}
                      >
                        +
                      </button>
                    </div>
                    <span className={`font-bold ${surface.text}`}>₾{(item.bundlePrice * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
            {cart.items.map(item => {
              const outOfStock = item.stock !== null && item.stock <= 0
              const overStock = item.stock !== null && item.quantity > item.stock
              return (
                <div key={item.id} className="flex gap-4 py-6">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className={`w-20 h-20 shrink-0 overflow-hidden ${radius} ${surface.card} border ${surface.border}`}
                  >
                    {item.imageUrl ? (
                      <CImg src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-[10px] ${surface.muted}`}>
                        სურათი არ არის
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link
                        href={`/products/${item.productSlug}`}
                        className={`font-semibold text-sm leading-snug hover:underline underline-offset-2 ${surface.text}`}
                      >
                        {item.productName}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className={`${surface.muted} hover:text-red-400 transition-colors shrink-0 ml-2`}
                        aria-label="ნივთის წაშლა"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                    {item.options.length > 0 && (
                      <p className={`text-xs mb-1 ${surface.muted}`}>
                        {item.options.map(o => `${o.optionName}: ${o.value}`).join(' · ')}
                      </p>
                    )}
                    <p className={`text-xs mb-2 font-mono ${surface.muted}`}>{item.sku}</p>
                    {outOfStock ? (
                      <p className="text-xs text-red-500 font-medium mb-3">არ არის მარაგში</p>
                    ) : overStock ? (
                      <p className="text-xs text-amber-500 font-medium mb-3">მხოლოდ {item.stock} ცალია მარაგში</p>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center border ${surface.border} ${radius}`}>
                        <button
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className={`w-8 h-8 flex items-center justify-center ${surface.muted} hover:opacity-100 transition-colors text-lg disabled:opacity-30`}
                        >
                          −
                        </button>
                        <span className={`w-8 text-center text-sm font-medium tabular-nums ${surface.text}`}>{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.stock === null ? item.quantity + 1 : Math.min(item.stock, item.quantity + 1))}
                          disabled={item.stock !== null && item.quantity >= item.stock}
                          className={`w-8 h-8 flex items-center justify-center ${surface.muted} hover:opacity-100 transition-colors text-lg disabled:opacity-30`}
                        >
                          +
                        </button>
                      </div>
                      <span className={`font-bold ${surface.text}`}>₾{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="pt-6">
              <Link href={`/`} className={`text-sm underline underline-offset-2 ${surface.muted} hover:opacity-80`}>
                ← შოპინგის გაგრძელება
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`${surface.card} border ${surface.border} ${radius} p-6 sticky top-20`}>
              <h2 className={`font-bold text-base mb-6 pb-4 border-b ${surface.border} ${surface.text}`}>შეკვეთის შეჯამება</h2>
              <div className="flex justify-between text-sm mb-6">
                <span className={surface.muted}>სულ</span>
                <span className={`font-black text-lg ${surface.text}`}>₾{cart.total.toFixed(2)}</span>
              </div>
              {tokens.freeShippingThreshold != null && cart.total < tokens.freeShippingThreshold && (
                <div className="mb-6">
                  <p className={`text-xs mb-2 ${surface.muted}`}>
                    დაამატეთ კიდევ ₾{(tokens.freeShippingThreshold - cart.total).toFixed(2)} და მიწოდება იქნება უფასო
                  </p>
                  <div className={`h-1.5 rounded-full overflow-hidden ${surface.border} border`}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (cart.total / tokens.freeShippingThreshold) * 100)}%`,
                        backgroundColor: tokens.accentColor,
                      }}
                    />
                  </div>
                </div>
              )}
              {hasStockIssue ? (
                <>
                  <button
                    type="button"
                    disabled
                    className={`block w-full text-center py-4 text-white text-sm font-semibold uppercase tracking-wide opacity-40 cursor-not-allowed ${radius}`}
                    style={{ backgroundColor: tokens.accentColor }}
                  >
                    გადახდაზე გადასვლა
                  </button>
                  <p className="text-xs text-amber-500 mt-2">
                    შეამცირეთ რაოდენობა მარაგში არსებულამდე, რომ გააგრძელოთ.
                  </p>
                </>
              ) : (
                <Link
                  href={`/checkout`}
                  className={`block w-full text-center py-4 text-white text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-90 ${radius}`}
                  style={{ backgroundColor: tokens.accentColor }}
                >
                  გადახდაზე გადასვლა
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
