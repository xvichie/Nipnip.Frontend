import Link from 'next/link'
import type { ProductSummaryResponse, ThemeConfig } from '@/lib/types/storefront'

export function ProductCard({
  slug,
  product,
  categoryName,
  tokens,
  className = '',
  featured = false,
}: {
  slug: string
  product: ProductSummaryResponse
  categoryName?: string
  tokens: Required<ThemeConfig>
  /** Optional extra classes for the wrapping grid item — used by Home's asymmetric featured grid. */
  className?: string
  /** Renders a larger caption treatment for the featured (first) tile in the asymmetric grid. */
  featured?: boolean
}) {
  return (
    <Link href={`/store/${slug}/products/${product.slug}`} className={`group block ${className}`}>
      <div className="relative aspect-[4/5] bg-[#f2f2f2] overflow-hidden">
        {product.thumbnailUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.thumbnailUrl}
              alt={product.name}
              className={[
                'absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-[1.01] group-hover:opacity-90',
                product.secondImageUrl ? 'group-hover:opacity-0' : '',
              ].join(' ')}
            />
            {product.secondImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.secondImageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-300 ease-out group-hover:opacity-90 group-hover:scale-[1.01]"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#767676] text-[10px] uppercase tracking-widest">სურათი არ არის</div>
        )}
      </div>
      <div className="pt-3">
        {categoryName && (
          <p className="text-[#767676] text-[10px] uppercase tracking-widest mb-1">{categoryName}</p>
        )}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className={`font-serif italic text-[#111111] leading-snug ${featured ? 'text-lg sm:text-xl' : 'text-sm'}`}>
            {product.name}
          </h3>
          {product.salePrice !== null ? (
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="text-xs font-medium" style={{ color: tokens.accentColor }}>₾{product.salePrice.toFixed(2)}</span>
              <span className="text-[#767676] text-[11px] line-through">₾{product.basePrice.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-xs font-medium text-[#111111] shrink-0">₾{product.basePrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
