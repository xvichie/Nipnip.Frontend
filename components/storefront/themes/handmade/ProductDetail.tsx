'use client'

import { useMemo, useRef, useState } from 'react'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import { VariantSelector } from '../../VariantSelector'
import { ImageLightbox } from '../../ImageLightbox'
import { Breadcrumbs } from '@/components/storefront/shared/Breadcrumbs'
import { SizeGuideModal } from '@/components/storefront/shared/SizeGuideModal'
import { StickyAddToCartBar } from '@/components/storefront/shared/StickyAddToCartBar'
import { ProductCard } from './ProductCard'
import type { CategoryResponse, ProductDetailResponse, ThemeConfig } from '@/lib/types/storefront'
import { useStorefrontLanguage } from '@/components/storefront/shared/StorefrontLanguageProvider'
import { getCategoryName, getProductDescription, getProductName } from '@/lib/store/translations'
import { CImg } from '@/components/ui/CImg'

export function ProductDetail({
  slug,
  product,
  category,
  tokens,
}: {
  slug: string
  product: ProductDetailResponse
  category?: CategoryResponse
  tokens: Required<ThemeConfig>
}) {
  const { t, lang } = useStorefrontLanguage()
  const productName = getProductName(product, lang)
  const productDescription = getProductDescription(product, lang)
  const { addItem } = useStorefrontCart()
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const addToCartButtonRef = useRef<HTMLButtonElement>(null)

  const purchasableOptions = product.options.filter(option => option.values.length > 0)

  const matchedVariant = useMemo(() => {
    if (product.variants.length === 1 && purchasableOptions.length === 0) return product.variants[0]

    const selectedValueIds = Object.values(selected)
    if (selectedValueIds.length !== purchasableOptions.length) return null

    return (
      product.variants.find(variant => {
        const variantValueIds = new Set(variant.optionValueIds)
        return (
          selectedValueIds.every(id => variantValueIds.has(id)) &&
          variant.optionValueIds.length === selectedValueIds.length
        )
      }) ?? null
    )
  }, [product, selected, purchasableOptions])

  // A combination with no explicit variant override still sells at the base price with
  // unlimited stock — the backend materializes a real variant for it on first purchase.
  const selectionComplete = Object.values(selected).length === purchasableOptions.length
  const stock = matchedVariant ? matchedVariant.stock : null
  const canAddToCart = selectionComplete && (stock === null || stock > 0)
  const price = matchedVariant?.price ?? product.basePrice
  const salePrice = matchedVariant ? matchedVariant.salePrice : product.salePrice
  const images = product.images
  const isLowStock = tokens.lowStockThreshold != null && stock !== null && stock > 0 && stock <= tokens.lowStockThreshold
  const lowStockText = isLowStock ? (tokens.lowStockMessage ? tokens.lowStockMessage.replace('{n}', String(stock)) : t.product.lowStock(stock!)) : null

  async function handleAddToCart() {
    if (!canAddToCart) return
    setAddError(false)
    try {
      await addItem(product.id, Object.values(selected), quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      setAddError(true)
      setTimeout(() => setAddError(false), 3000)
    }
  }

  return (
    <div className="bg-[#f4ede3] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-16">
        <Breadcrumbs
          items={[
            { label: t.product.breadcrumbHome, href: '/' },
            category ? { label: getCategoryName(category, lang), href: `/products/category/${category.slug}` } : { label: t.product.breadcrumbAllProducts, href: '/products' },
            { label: productName },
          ]}
          t={t}
          textClassName="text-[#2b2420]"
          mutedClassName="text-[#8f8274] hover:text-[#2b2420]"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          <div className="flex gap-3">
            {images.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0">
                {images.map((image, i) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImage(i)}
                    className="w-16 h-16 overflow-hidden border transition-colors bg-[#f4ede3]"
                    style={{ borderColor: activeImage === i ? '#2b2420' : 'rgba(43,36,32,0.1)' }}
                  >
                    <CImg src={image.url} cldWidth={160} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 aspect-[4/5] bg-[#e8ddd0] overflow-hidden">
              {images[activeImage] ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label={t.product.zoomAriaLabel}
                  className="w-full h-full cursor-zoom-in"
                >
                  <CImg src={images[activeImage].url} cldWidth={1000} alt={productName} className="w-full h-full object-contain" />
                </button>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#8f8274] text-xs">{t.product.noImage}</div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="font-serif text-3xl sm:text-5xl text-[#2b2420] tracking-tight leading-[0.95] mb-5">
              {productName}
            </h1>

            {salePrice !== null ? (
              <div className="flex items-center gap-3 mb-8">
                <span className="font-medium text-2xl" style={{ color: tokens.accentColor }}>
                  ₾{salePrice.toFixed(2)}
                </span>
                <span className="text-[#8f8274] text-lg line-through">₾{price.toFixed(2)}</span>
              </div>
            ) : (
              <p className="font-medium text-2xl text-[#2b2420] mb-8">
                ₾{price.toFixed(2)}
              </p>
            )}

            <VariantSelector
              options={purchasableOptions}
              selected={selected}
              onChange={(optionId, valueId) => setSelected(prev => ({ ...prev, [optionId]: valueId }))}
              tokens={tokens}
              radiusClass=""
            />

            {tokens.sizeGuideContent && (
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="italic font-serif text-sm text-[#8f8274] hover:text-[#2b2420] underline underline-offset-2 mb-5 text-left w-fit"
              >
                {t.product.sizeGuide}
              </button>
            )}

            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center border border-[#2b2420]/20">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-10 flex items-center justify-center text-[#8f8274] hover:text-[#2b2420] transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-10 text-center text-[#2b2420] text-sm font-medium tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-10 flex items-center justify-center text-[#8f8274] hover:text-[#2b2420] transition-colors text-lg"
                >
                  +
                </button>
              </div>
              {selectionComplete && stock !== null && (
                <span className={`text-xs ${isLowStock ? 'text-red-600 font-medium' : 'text-[#8f8274]'}`}>
                  {stock > 0 ? (lowStockText ?? t.product.inStock(stock)) : t.product.outOfStock}
                </span>
              )}
            </div>

            <button
              ref={addToCartButtonRef}
              type="button"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              className={[
                'w-full py-3.5 border-2 text-xs uppercase tracking-widest font-medium transition-colors mb-8 disabled:opacity-40 disabled:cursor-not-allowed',
                added
                  ? 'border-[#2b2420] bg-[#2b2420] text-white'
                  : 'border-[#2b2420] text-[#2b2420] hover:bg-[#2b2420] hover:text-white',
              ].join(' ')}
            >
              {added
                ? t.product.addedToCart
                : !selectionComplete
                ? t.product.chooseVariant
                : stock !== null && stock < 1
                ? t.product.outOfStock
                : t.product.addToCart}
            </button>

            {addError && (
              <p className="text-red-600 text-sm -mt-6 mb-8">{t.product.addToCartError}</p>
            )}

            {tokens.deliveryEstimateText && (
              <p className="text-xs text-[#8f8274] mb-4">{tokens.deliveryEstimateText}</p>
            )}

            {tokens.trustBadges.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-8">
                {tokens.trustBadges.map((badge, i) => (
                  <span key={i} className="text-xs text-[#8f8274]">✓ {badge}</span>
                ))}
              </div>
            )}

            {productDescription && (
              <div className="pt-6 border-t border-[#2b2420]/10">
                <p className="italic font-serif text-sm text-[#8f8274] mb-3">{t.product.description}</p>
                <p className="font-serif text-base leading-relaxed max-w-md text-[#2b2420]">{productDescription}</p>
              </div>
            )}

            {product.videoUrl && (
              <div className="pt-6 border-t border-[#2b2420]/10">
                <p className="italic font-serif text-sm text-[#8f8274] mb-3">{t.product.video}</p>
                <video src={product.videoUrl} controls className="w-full max-w-sm bg-black" />
              </div>
            )}
          </div>
        </div>

        {tokens.showRelatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#2b2420]/10">
            <p className="italic font-serif text-sm text-[#8f8274] mb-6">{tokens.relatedProductsHeading || t.product.relatedProducts}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-8">
              {product.relatedProducts.map(related => (
                <ProductCard key={related.id} slug={slug} product={related} tokens={tokens} t={t} lang={lang} />
              ))}
            </div>
          </div>
        )}

      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          activeIndex={activeImage}
          onIndexChange={setActiveImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {sizeGuideOpen && tokens.sizeGuideContent && (
        <SizeGuideModal content={tokens.sizeGuideContent} t={t} onClose={() => setSizeGuideOpen(false)} />
      )}

      {tokens.showStickyMobileCta && (
        <StickyAddToCartBar
          triggerRef={addToCartButtonRef}
          productName={productName}
          priceLabel={salePrice !== null ? `₾${salePrice.toFixed(2)}` : `₾${price.toFixed(2)}`}
          disabled={!canAddToCart}
          addedLabel={added ? t.product.addedToCart : null}
          label={!selectionComplete ? t.product.chooseVariant : stock !== null && stock < 1 ? t.product.outOfStock : t.product.addToCart}
          onAdd={handleAddToCart}
          accentColor={tokens.accentColor}
        />
      )}
    </div>
  )
}
