'use client'

import Link from 'next/link'
import { getProductBadge } from '@/lib/store/theme-config'
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
        className="rounded-[1.75rem] bg-white overflow-hidden transition-shadow duration-300 h-full flex flex-col"
        style={{ boxShadow: '0 2px 10px -4px rgba(0,0,0,0.08)' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 45px -15px ${tokens.accentColor}55` }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px -4px rgba(0,0,0,0.08)' }}
      >
        <div className="relative aspect-square bg-[#eaf7fc] overflow-hidden">
          {badge && (
            <span
              className="absolute top-2 left-2 z-10 rounded-full text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1"
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
                  'absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110',
                  product.secondImageUrl ? 'group-hover:opacity-0' : '',
                ].join(' ')}
              />
              {product.secondImageUrl && (
                <CImg
                  src={product.secondImageUrl}
                  cldWidth={600}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-110"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#b8d8e6] text-xs font-medium">{t.product.noImage}</div>
          )}
          <QuickAddButton
            slug={slug}
            productSlug={product.slug}
            tokens={tokens}
            className="absolute inset-x-0 bottom-0 z-10 w-full py-2.5 flex items-center justify-center gap-1.5 text-white text-xs font-bold opacity-100 translate-y-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-full [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 transition-all duration-200 disabled:opacity-60"
            style={{ backgroundColor: tokens.accentColor }}
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          {categoryName && (
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: tokens.accentColor }}>{categoryName}</p>
          )}
          <h3 className="text-[#2b2b2b] font-bold text-sm leading-snug mb-2">{productName}</h3>
          <div className="mt-auto">
            {product.salePrice !== null ? (
              <div className="flex items-center gap-2">
                <span className="font-black text-sm" style={{ color: tokens.accentColor }}>₾{product.salePrice.toFixed(2)}</span>
                <span className="text-[#b8b8b8] text-xs line-through">₾{product.basePrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="font-black text-sm" style={{ color: tokens.accentColor }}>₾{product.basePrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
