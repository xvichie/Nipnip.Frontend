'use client'

import Link from 'next/link'
import { glowShadow } from '@/lib/store/theme-config'
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
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div
        className="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 transition-shadow duration-300"
        style={{ boxShadow: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = glowShadow(tokens.accentColor) }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
      >
        <div className="relative aspect-square bg-white/[0.06] overflow-hidden">
          {product.thumbnailUrl ? (
            <>
              <CImg
                src={product.thumbnailUrl}
                cldWidth={600}
                alt={product.name}
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
            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs uppercase tracking-wider">
              სურათი არ არის
            </div>
          )}
          <QuickAddButton
            slug={slug}
            productSlug={product.slug}
            className="absolute inset-x-0 bottom-0 z-10 w-full py-2.5 flex items-center justify-center gap-1.5 text-white text-xs font-bold uppercase tracking-wider opacity-100 translate-y-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-full [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 transition-all duration-200 disabled:opacity-60"
            style={{ backgroundColor: tokens.accentColor }}
          />
        </div>
        <div className="p-4">
          {categoryName && (
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-semibold">{categoryName}</p>
          )}
          <h3 className="text-white font-bold text-sm leading-snug mb-2">{product.name}</h3>
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
    </Link>
  )
}
