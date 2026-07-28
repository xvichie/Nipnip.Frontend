'use client'

import Link from 'next/link'
import { getProductBadge, glowShadow } from '@/lib/store/theme-config'
import { QuickAddButton } from '@/components/storefront/shared/QuickAddButton'
import type { ProductSummaryResponse, ThemeConfig } from '@/lib/types/storefront'
import { useStorefrontLanguage } from '@/components/storefront/shared/StorefrontLanguageProvider'
import { getProductName } from '@/lib/store/translations'
import { CImg } from '@/components/ui/CImg'

export function ProductCard({
  slug,
  product,
  categoryName,
  tokens,
}: {
  slug: string
  product: ProductSummaryResponse
  categoryName?: string
  tokens: Required<ThemeConfig>
}) {
  const { t, lang } = useStorefrontLanguage()
  const productName = getProductName(product, lang)
  const badge = getProductBadge(tokens, product, lang)
  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div
        className="overflow-hidden bg-white/[0.04] border border-white/10 transition-shadow duration-300 h-full flex flex-col"
        style={{ boxShadow: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = glowShadow(tokens.accentColor) }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
      >
        <div className="relative aspect-square bg-white/[0.06] overflow-hidden">
          {badge && (
            <span
              className="absolute top-2 left-2 z-10 text-[#0d0f0d] text-[10px] font-black uppercase tracking-wide px-2.5 py-1"
              style={{ backgroundColor: badge.color }}
            >
              {badge.text}
            </span>
          )}
          {product.thumbnailUrl ? (
            <>
              <CImg
                src={product.thumbnailUrl}
                cldWidth={600}
                alt={productName}
                className={[
                  'absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105',
                  product.secondImageUrl ? 'group-hover:opacity-0' : '',
                ].join(' ')}
              />
              {product.secondImageUrl && (
                <CImg
                  src={product.secondImageUrl}
                  cldWidth={600}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-105"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-wider">
              {t.product.noImage}
            </div>
          )}
          <QuickAddButton
            slug={slug}
            productSlug={product.slug}
            className="absolute inset-x-0 bottom-0 z-10 w-full py-2.5 flex items-center justify-center gap-1.5 text-[#0d0f0d] text-xs font-black uppercase tracking-wider opacity-100 translate-y-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-full [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 transition-all duration-200 disabled:opacity-60"
            style={{ backgroundColor: tokens.accentColor }}
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          {categoryName && (
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-bold">{categoryName}</p>
          )}
          <h3 className="text-white font-black uppercase text-sm leading-snug mb-2">{productName}</h3>
          <div className="mt-auto">
            {product.salePrice !== null ? (
              <div className="flex items-center gap-2">
                <span className="font-black text-sm" style={{ color: tokens.accentColor }}>
                  ₾{product.salePrice.toFixed(2)}
                </span>
                <span className="text-white/30 text-xs line-through">₾{product.basePrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="font-black text-sm" style={{ color: tokens.accentColor }}>
                ₾{product.basePrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
