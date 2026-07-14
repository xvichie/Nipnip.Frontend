'use client'

import Link from 'next/link'
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
        className="rounded-2xl bg-white overflow-hidden transition-shadow duration-300"
        style={{ boxShadow: '0 2px 10px -4px rgba(0,0,0,0.08)' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 45px -15px ${tokens.accentColor}55` }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px -4px rgba(0,0,0,0.08)' }}
      >
        <div className="relative aspect-square bg-[#fff2ec] overflow-hidden">
          {product.thumbnailUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className={[
                  'absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110',
                  product.secondImageUrl ? 'group-hover:opacity-0' : '',
                ].join(' ')}
              />
              {product.secondImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.secondImageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-110"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#c9b8ac] text-xs font-medium">სურათი არ არის</div>
          )}
        </div>
        <div className="p-4">
          {categoryName && (
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: tokens.accentColor }}>{categoryName}</p>
          )}
          <h3 className="text-[#1a1a1a] font-bold text-sm leading-snug mb-2">{product.name}</h3>
          {product.salePrice !== null ? (
            <div className="flex items-center gap-2">
              <span className="font-black text-sm" style={{ color: tokens.accentColor }}>₾{product.salePrice.toFixed(2)}</span>
              <span className="text-[#c9b8ac] text-xs line-through">₾{product.basePrice.toFixed(2)}</span>
            </div>
          ) : (
            <span className="font-black text-sm" style={{ color: tokens.accentColor }}>₾{product.basePrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
