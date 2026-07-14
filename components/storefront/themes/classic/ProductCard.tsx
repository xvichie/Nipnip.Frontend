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
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="rounded-md bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.thumbnailUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className={[
                  'absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-[1.03]',
                  product.secondImageUrl ? 'group-hover:opacity-0' : '',
                ].join(' ')}
              />
              {product.secondImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.secondImageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-[1.03]"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">სურათი არ არის</div>
          )}
        </div>
        <div className="p-3.5">
          {categoryName && <p className="text-gray-400 text-[11px] mb-1">{categoryName}</p>}
          <h3 className="text-gray-900 font-medium text-sm leading-snug mb-2">{product.name}</h3>
          {product.salePrice !== null ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" style={{ color: tokens.accentColor }}>
                ₾{product.salePrice.toFixed(2)}
              </span>
              <span className="text-gray-400 text-xs line-through">₾{product.basePrice.toFixed(2)}</span>
            </div>
          ) : (
            <span className="font-semibold text-sm" style={{ color: tokens.accentColor }}>
              ₾{product.basePrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
