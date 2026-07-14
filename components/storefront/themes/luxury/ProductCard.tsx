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
      <div className="bg-white border border-[#1c1a17]/10 group-hover:border-[#1c1a17]/25 transition-colors overflow-hidden">
        <div className="relative aspect-[4/5] bg-[#f4efe7] overflow-hidden">
          {product.thumbnailUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className={[
                  'absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105',
                  product.secondImageUrl ? 'group-hover:opacity-0' : '',
                ].join(' ')}
              />
              {product.secondImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.secondImageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#9c8f7e] text-[10px] uppercase tracking-widest">სურათი არ არის</div>
          )}
        </div>
        <div className="p-4">
          {categoryName && (
            <p className="text-[#9c8f7e] text-[10px] uppercase tracking-widest mb-1.5">{categoryName}</p>
          )}
          <h3 className="text-[#1c1a17] font-serif text-base leading-snug mb-2">{product.name}</h3>
          {product.salePrice !== null ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: tokens.accentColor }}>₾{product.salePrice.toFixed(2)}</span>
              <span className="text-[#9c8f7e] text-xs line-through">₾{product.basePrice.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-sm font-medium" style={{ color: tokens.accentColor }}>₾{product.basePrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
