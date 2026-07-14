import Link from 'next/link'
import type { ProductSummaryResponse } from '@/lib/types/storefront'

export function ProductCard({
  slug,
  product,
  categoryName,
}: {
  slug: string
  product: ProductSummaryResponse
  categoryName?: string
}) {
  return (
    <Link href={`/store/${slug}/products/${product.slug}`} className="group block">
      <div className="bg-white border border-[#e5e5e5] hover:shadow-md transition-shadow duration-200">
        <div className="relative aspect-square bg-[#f7f7f7] overflow-hidden">
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
            <div className="w-full h-full flex items-center justify-center text-[#ccc] text-xs uppercase tracking-wider">
              სურათი არ არის
            </div>
          )}
        </div>
        <div className="p-3.5">
          {categoryName && (
            <p className="text-[#999] text-[10px] uppercase tracking-wider mb-1">{categoryName}</p>
          )}
          <h3 className="text-[#111] font-semibold text-sm leading-snug mb-2 group-hover:underline underline-offset-2">
            {product.name}
          </h3>
          {product.salePrice !== null ? (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#111] text-sm">₾{product.salePrice.toFixed(2)}</span>
              <span className="text-[#999] text-xs line-through">₾{product.basePrice.toFixed(2)}</span>
            </div>
          ) : (
            <span className="font-bold text-[#111] text-sm">₾{product.basePrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
