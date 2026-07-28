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
}: {
  slug: string
  product: ProductSummaryResponse
  categoryName?: string
  tokens: Required<ThemeConfig>
  t: StorefrontStrings
  lang: StorefrontLanguage
}) {
  const badge = getProductBadge(tokens, product, lang)
  const productName = getProductName(product, lang)
  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div className="border border-[#3a3a38] bg-[#242422] overflow-hidden hover:border-[#54544e] transition-colors duration-200 h-full flex flex-col">
        <div className="relative aspect-square bg-[#2a2a28] overflow-hidden">
          {badge && (
            <span
              className="absolute top-2 left-2 z-10 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1"
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
            <div className="w-full h-full flex items-center justify-center text-[#54544e] text-xs">{t.product.noImage}</div>
          )}
          <QuickAddButton
            slug={slug}
            productSlug={product.slug}
            className="absolute inset-x-0 bottom-0 z-10 w-full py-2.5 flex items-center justify-center gap-1.5 text-white text-xs font-semibold opacity-100 translate-y-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-full [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 transition-all duration-200 disabled:opacity-60"
            style={{ backgroundColor: tokens.accentColor }}
          />
        </div>
        <div className="p-3.5 flex flex-col flex-1">
          {categoryName && <p className="text-[#6f6f6b] text-[11px] mb-1">{categoryName}</p>}
          <h3 className="text-[#f2f2f0] font-semibold text-sm leading-snug mb-2">{productName}</h3>
          <div className="mt-auto">
            {product.salePrice !== null ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm" style={{ color: tokens.accentColor }}>
                  ₾{product.salePrice.toFixed(2)}
                </span>
                <span className="text-[#6f6f6b] text-xs line-through">₾{product.basePrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="font-bold text-sm" style={{ color: tokens.accentColor }}>
                ₾{product.basePrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
