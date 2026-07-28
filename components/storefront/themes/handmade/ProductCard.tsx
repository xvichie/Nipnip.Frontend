import Link from 'next/link'
import { getProductBadge } from '@/lib/store/theme-config'
import { QuickAddButton } from '@/components/storefront/shared/QuickAddButton'
import type { ProductSummaryResponse, ThemeConfig } from '@/lib/types/storefront'
import type { StorefrontLanguage, StorefrontStrings } from '@/lib/storefront-i18n'
import { getProductName } from '@/lib/store/translations'
import { CImg } from '@/components/ui/CImg'

export function ProductCard({
  slug,
  product,
  categoryName,
  tokens,
  t,
  lang,
  className = '',
  featured = false,
}: {
  slug: string
  product: ProductSummaryResponse
  categoryName?: string
  tokens: Required<ThemeConfig>
  t: StorefrontStrings
  lang: StorefrontLanguage
  /** Optional extra classes for the wrapping grid item — used by Home's asymmetric featured grid. */
  className?: string
  /** Renders a larger caption treatment for the featured (first) tile in the asymmetric grid. */
  featured?: boolean
}) {
  const badge = getProductBadge(tokens, product)
  const productName = getProductName(product, lang)
  return (
    <Link href={`/products/${product.slug}`} className={`group h-full flex flex-col ${className}`}>
      <div className="relative aspect-[4/5] bg-[#e8ddd0] overflow-hidden">
        {badge && (
          <span
            className="absolute top-2 left-2 z-10 text-white text-[9px] uppercase tracking-widest px-2 py-1"
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
                'absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-[1.01] group-hover:opacity-90',
                product.secondImageUrl ? 'group-hover:opacity-0' : '',
              ].join(' ')}
            />
            {product.secondImageUrl && (
              <CImg
                src={product.secondImageUrl}
                cldWidth={600}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-300 ease-out group-hover:opacity-90 group-hover:scale-[1.01]"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8f8274] text-[10px] uppercase tracking-widest">{t.product.noImage}</div>
        )}
        <QuickAddButton
          slug={slug}
          productSlug={product.slug}
          className="absolute inset-x-0 bottom-0 z-10 w-full py-2.5 flex items-center justify-center gap-1.5 bg-[#2b2420] text-white text-[11px] uppercase tracking-widest opacity-100 translate-y-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-full [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 transition-all duration-300 disabled:opacity-60"
        />
      </div>
      <div className="pt-3 mt-auto">
        {categoryName && (
          <p className="text-[#8f8274] text-[10px] uppercase tracking-widest mb-1">{categoryName}</p>
        )}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className={`font-serif italic text-[#2b2420] leading-snug ${featured ? 'text-lg sm:text-xl' : 'text-sm'}`}>
            {productName}
          </h3>
          {product.salePrice !== null ? (
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="text-xs font-medium" style={{ color: tokens.accentColor }}>₾{product.salePrice.toFixed(2)}</span>
              <span className="text-[#8f8274] text-[11px] line-through">₾{product.basePrice.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-xs font-medium text-[#2b2420] shrink-0">₾{product.basePrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
