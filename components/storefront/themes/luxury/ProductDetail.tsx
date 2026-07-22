'use client'

import { useMemo, useState } from 'react'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import { VariantSelector } from '../../VariantSelector'
import { ImageLightbox } from '../../ImageLightbox'
import { Breadcrumbs } from '@/components/storefront/shared/Breadcrumbs'
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
    <div className="bg-[#faf7f2] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-20">
        <Breadcrumbs
          items={[
            { label: 'მთავარი', href: '/' },
            category ? { label: category.name, href: `/products/category/${category.slug}` } : { label: 'ყველა პროდუქტი', href: '/products' },
            { label: product.name },
          ]}
          textClassName="text-[#1c1a17]"
          mutedClassName="text-[#9c8f7e] hover:text-[#1c1a17]"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

          <div className="flex gap-3">
            {images.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0">
                {images.map((image, i) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImage(i)}
                    className="w-16 h-16 overflow-hidden border transition-colors bg-white"
                    style={{ borderColor: activeImage === i ? tokens.accentColor : 'rgba(28,26,23,0.12)' }}
                  >
                    <CImg src={image.url} cldWidth={160} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 aspect-[4/5] bg-white border border-[#1c1a17]/10 overflow-hidden">
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
                <div className="w-full h-full flex items-center justify-center text-[#9c8f7e] text-[10px] uppercase tracking-widest">სურათი არ არის</div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1c1a17] tracking-tight leading-tight mb-5">
              {product.name}
            </h1>

            {salePrice !== null ? (
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl font-medium" style={{ color: tokens.accentColor }}>₾{salePrice.toFixed(2)}</span>
                <span className="text-[#9c8f7e] text-lg line-through">₾{price.toFixed(2)}</span>
              </div>
            ) : (
              <p className="text-2xl font-medium mb-8" style={{ color: tokens.accentColor }}>₾{price.toFixed(2)}</p>
            )}

            <VariantSelector
              options={purchasableOptions}
              selected={selected}
              onChange={(optionId, valueId) => setSelected(prev => ({ ...prev, [optionId]: valueId }))}
              tokens={tokens}
            />

            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center border border-[#1c1a17]/15">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-10 flex items-center justify-center text-[#1c1a17]/60 hover:text-[#1c1a17] transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-10 text-center text-[#1c1a17] text-sm font-medium tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-10 flex items-center justify-center text-[#1c1a17]/60 hover:text-[#1c1a17] transition-colors text-lg"
                >
                  +
                </button>
              </div>
              {selectionComplete && stock !== null && (
                <span className="text-xs uppercase tracking-widest text-[#9c8f7e]">
                  {stock > 0 ? `მარაგშია: ${stock} ცალი` : 'არ არის მარაგში'}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              className="w-full py-4 text-xs uppercase tracking-[0.2em] font-medium transition-opacity mb-9 disabled:opacity-40 disabled:cursor-not-allowed text-white hover:opacity-90"
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
              <p className="text-red-500 text-sm -mt-7 mb-8">დაფიქსირდა შეცდომა. სცადეთ თავიდან.</p>
            )}

            {product.description && (
              <div className="pt-7 border-t border-[#1c1a17]/10">
                <p className="text-xs uppercase tracking-widest text-[#9c8f7e] mb-3">აღწერა</p>
                <p className="text-[#6b6255] text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.videoUrl && (
              <div className="pt-7 border-t border-[#1c1a17]/10">
                <p className="text-xs uppercase tracking-widest text-[#9c8f7e] mb-3">ვიდეო</p>
                <video src={product.videoUrl} controls className="w-full max-w-sm bg-black" />
              </div>
            )}
          </div>
        </div>

        {product.relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#1c1a17]/10">
            <p className="text-xs uppercase tracking-widest text-[#9c8f7e] mb-6">მსგავსი პროდუქტები</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </div>
  )
}
