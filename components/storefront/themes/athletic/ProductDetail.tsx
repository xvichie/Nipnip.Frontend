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
  const lowStockText = isLowStock ? (tokens.lowStockMessage || 'მხოლოდ {n} ცალია დარჩენილი!').replace('{n}', String(stock)) : null

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
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-16">
        <Breadcrumbs
          items={[
            { label: 'მთავარი', href: '/' },
            category ? { label: category.name, href: `/products/category/${category.slug}` } : { label: 'ყველა პროდუქტი', href: '/products' },
            { label: product.name },
          ]}
          textClassName="text-[#0f0f0f]"
          mutedClassName="text-[#8a8a8a] hover:text-[#0f0f0f]"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          <div className="flex gap-3">
            {images.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0">
                {images.map((image, i) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImage(i)}
                    className="w-16 h-16 overflow-hidden border-2 transition-colors bg-white"
                    style={{ borderColor: activeImage === i ? tokens.accentColor : '#e8e8e8' }}
                  >
                    <CImg src={image.url} cldWidth={160} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1 aspect-square border border-[#e8e8e8] bg-white overflow-hidden">
              {product.salePrice !== null && (
                <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1">
                  ფასდაკლება
                </span>
              )}
              {images[activeImage] ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="სურათის გადიდება"
                  className="w-full h-full cursor-zoom-in"
                >
                  <CImg src={images[activeImage].url} cldWidth={1000} alt={product.name} className="w-full h-full object-contain" />
                </button>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#c2c2c2] text-xs">სურათი არ არის</div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="font-black text-3xl sm:text-4xl text-[#0f0f0f] uppercase tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            {salePrice !== null ? (
              <div className="flex items-center gap-3 mb-6">
                <span className="font-black text-3xl" style={{ color: tokens.accentColor }}>
                  ₾{salePrice.toFixed(2)}
                </span>
                <span className="text-[#8a8a8a] text-lg line-through">₾{price.toFixed(2)}</span>
                <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1">
                  ფასდაკლება
                </span>
              </div>
            ) : (
              <p className="font-black text-3xl text-[#0f0f0f] mb-6">
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
                className="text-xs text-[#8a8a8a] hover:text-[#0f0f0f] underline underline-offset-2 mb-4 text-left w-fit"
              >
                საზომი ცხრილი
              </button>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-[#e8e8e8] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-10 flex items-center justify-center text-[#6b6b6b] hover:text-[#0f0f0f] transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-10 text-center text-[#0f0f0f] text-sm font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-10 flex items-center justify-center text-[#6b6b6b] hover:text-[#0f0f0f] transition-colors text-lg"
                >
                  +
                </button>
              </div>
              {selectionComplete && stock !== null && (
                <span className={`text-xs ${isLowStock ? 'text-red-600 font-medium' : 'text-[#8a8a8a]'}`}>
                  {stock > 0 ? (lowStockText ?? `მარაგშია: ${stock} ცალი`) : 'არ არის მარაგში'}
                </span>
              )}
            </div>

            <button
              ref={addToCartButtonRef}
              type="button"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              className="w-full py-3.5 text-sm font-black uppercase tracking-wide shadow-sm hover:shadow-md transition-shadow mb-8 disabled:opacity-40 disabled:cursor-not-allowed text-white"
              style={{ backgroundColor: added ? '#2d6a2d' : tokens.accentColor }}
            >
              {added
                ? '✓ დაემატა კალათაში'
                : !selectionComplete
                ? 'აირჩიეთ ვარიანტი'
                : stock !== null && stock < 1
                ? 'არ არის მარაგში'
                : 'კალათაში დამატება'}
            </button>

            {addError && (
              <p className="text-red-500 text-sm -mt-6 mb-8">დაფიქსირდა შეცდომა. სცადეთ თავიდან.</p>
            )}

            {tokens.deliveryEstimateText && (
              <p className="text-xs text-[#8a8a8a] mb-4">{tokens.deliveryEstimateText}</p>
            )}

            {tokens.trustBadges.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-8">
                {tokens.trustBadges.map((badge, i) => (
                  <span key={i} className="text-xs text-[#8a8a8a]">✓ {badge}</span>
                ))}
              </div>
            )}

            {product.description && (
              <div className="border border-[#e8e8e8] bg-[#f7f7f7] p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8a8a8a] mb-3">აღწერა</p>
                <p className="text-[#4d4d4d] text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.videoUrl && (
              <div className="border border-[#e8e8e8] bg-[#f7f7f7] p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8a8a8a] mb-3">ვიდეო</p>
                <video src={product.videoUrl} controls className="w-full max-w-sm bg-black" />
              </div>
            )}
          </div>
        </div>

        {tokens.showRelatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-14 pt-8 border-t border-[#e8e8e8]">
            <h2 className="font-black text-2xl text-[#0f0f0f] uppercase tracking-tight mb-6">{tokens.relatedProductsHeading || 'მსგავსი პროდუქტები'}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {product.relatedProducts.map(related => (
                <ProductCard key={related.id} slug={slug} product={related} tokens={tokens} />
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
        <SizeGuideModal content={tokens.sizeGuideContent} onClose={() => setSizeGuideOpen(false)} />
      )}

      {tokens.showStickyMobileCta && (
        <StickyAddToCartBar
          triggerRef={addToCartButtonRef}
          productName={product.name}
          priceLabel={salePrice !== null ? `₾${salePrice.toFixed(2)}` : `₾${price.toFixed(2)}`}
          disabled={!canAddToCart}
          addedLabel={added ? '✓ დაემატა კალათაში' : null}
          label={!selectionComplete ? 'აირჩიეთ ვარიანტი' : stock !== null && stock < 1 ? 'არ არის მარაგში' : 'კალათაში დამატება'}
          onAdd={handleAddToCart}
          accentColor={tokens.accentColor}
        />
      )}
    </div>
  )
}
