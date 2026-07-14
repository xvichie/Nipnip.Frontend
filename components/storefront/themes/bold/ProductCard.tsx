'use client'

import Link from 'next/link'
import { glowShadow } from '@/lib/store/theme-config'
import type { ProductSummaryResponse, ThemeConfig } from '@/lib/types/storefront'

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
    <Link href={`/store/${slug}/products/${product.slug}`} className="group block">
      <div
        className="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 transition-shadow duration-300"
        style={{ boxShadow: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = glowShadow(tokens.accentColor) }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
      >
        <div className="relative aspect-square bg-white/[0.06] overflow-hidden">
          {product.thumbnailUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className={[
                  'absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105',
                  product.secondImageUrl ? 'group-hover:opacity-0' : '',
                ].join(' ')}
              />
              {product.secondImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.secondImageUrl}
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
