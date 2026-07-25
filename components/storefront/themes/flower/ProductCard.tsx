'use client'

import Link from 'next/link'
import { getProductBadge } from '@/lib/store/theme-config'
import { QuickAddButton } from '@/components/storefront/shared/QuickAddButton'
import type { ProductSummaryResponse, ThemeConfig } from '@/lib/types/storefront'
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
  const badge = getProductBadge(tokens, product)
  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div
        className="rounded-2xl bg-white overflow-hidden transition-shadow duration-300 h-full flex flex-col"
        style={{ boxShadow: '0 2px 10px -4px rgba(61,43,40,0.08)' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 18px 40px -16px ${tokens.accentColor}55` }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px -4px rgba(61,43,40,0.08)' }}
      >
        <div className="relative aspect-square bg-[#f8ece7] overflow-hidden">
          {badge && (
            <span
              className="absolute top-2 left-2 z-10 rounded-full text-white text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1"
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
                alt={product.name}
                className={[
                  'absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-[1.03]',
                  product.secondImageUrl ? 'group-hover:opacity-0' : '',
                ].join(' ')}
              />
              {product.secondImageUrl && (
                <CImg
                  src={product.secondImageUrl}
                  cldWidth={600}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-[1.03]"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#cbb3aa] text-xs">სურათი არ არის</div>
          )}
          <QuickAddButton
            slug={slug}
            productSlug={product.slug}
            className="absolute inset-x-0 bottom-0 z-10 w-full py-2.5 flex items-center justify-center gap-1.5 text-white text-xs font-medium opacity-100 translate-y-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-full [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 transition-all duration-200 disabled:opacity-60"
            style={{ backgroundColor: tokens.accentColor }}
          />
        </div>
        <div className="p-3.5 flex flex-col flex-1">
          {categoryName && <p className="text-[#cbb3aa] text-[11px] mb-1">{categoryName}</p>}
          <h3 className="text-[#3d2b28] font-medium text-sm leading-snug mb-2">{product.name}</h3>
          <div className="mt-auto">
            {product.salePrice !== null ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm" style={{ color: tokens.accentColor }}>
                  ₾{product.salePrice.toFixed(2)}
                </span>
                <span className="text-[#cbb3aa] text-xs line-through">₾{product.basePrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="font-semibold text-sm" style={{ color: tokens.accentColor }}>
                ₾{product.basePrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
