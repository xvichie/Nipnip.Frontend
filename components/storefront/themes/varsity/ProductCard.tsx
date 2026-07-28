'use client'

import Link from 'next/link'
import { getProductBadge } from '@/lib/store/theme-config'
import { QuickAddButton } from '@/components/storefront/shared/QuickAddButton'
import type { ProductSummaryResponse, ThemeConfig } from '@/lib/types/storefront'
import { useStorefrontLanguage } from '@/components/storefront/shared/StorefrontLanguageProvider'
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
  const { t } = useStorefrontLanguage()
  const badge = getProductBadge(tokens, product)
  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div
        className="bg-white border border-[#e3e7ec] overflow-hidden transition-shadow duration-200 h-full flex flex-col"
        style={{ boxShadow: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `5px 5px 0 ${tokens.accentColor}` }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
      >
        <div className="relative aspect-square bg-[#eef2f6] overflow-hidden">
          {badge && (
            <span
              className="absolute top-2 left-2 z-10 text-white text-[10px] font-black uppercase tracking-wide px-2.5 py-1"
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
            <div className="w-full h-full flex items-center justify-center text-[#a8b3bd] text-xs font-medium">{t.product.noImage}</div>
          )}
          <QuickAddButton
            slug={slug}
            productSlug={product.slug}
            className="absolute inset-x-0 bottom-0 z-10 w-full py-2.5 flex items-center justify-center gap-1.5 text-white text-xs font-black uppercase tracking-wide opacity-100 translate-y-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-full [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 transition-all duration-200 disabled:opacity-60"
            style={{ backgroundColor: '#1d3557' }}
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          {categoryName && (
            <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: tokens.accentColor }}>{categoryName}</p>
          )}
          <h3 className="text-[#1d3557] font-black text-sm uppercase leading-snug mb-2">{product.name}</h3>
          <div className="mt-auto">
            {product.salePrice !== null ? (
              <div className="flex items-center gap-2">
                <span className="font-black text-sm" style={{ color: tokens.accentColor }}>₾{product.salePrice.toFixed(2)}</span>
                <span className="text-[#a8b3bd] text-xs line-through">₾{product.basePrice.toFixed(2)}</span>
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
