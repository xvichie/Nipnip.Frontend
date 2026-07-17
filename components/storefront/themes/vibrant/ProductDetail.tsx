'use client'

import { useMemo, useState } from 'react'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import { VariantSelector } from '../../VariantSelector'
import { ImageLightbox } from '../../ImageLightbox'
import { Breadcrumbs } from '@/components/storefront/shared/Breadcrumbs'
import type { CategoryResponse, ProductDetailResponse, ThemeConfig } from '@/lib/types/storefront'

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
    <div className="bg-[#fffaf5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-20">
        <Breadcrumbs
          items={[
            { label: 'მთავარი', href: '/' },
            category ? { label: category.name, href: `/products/category/${category.slug}` } : { label: 'ყველა პროდუქტი', href: '/products' },
            { label: product.name },
          ]}
          textClassName="text-[#1a1a1a]"
          mutedClassName="text-[#a89a90] hover:text-[#1a1a1a]"
        />
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16">

          <div className="flex gap-3">
            {images.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0">
                {images.map((image, i) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImage(i)}
                    className="w-16 h-16 rounded-2xl overflow-hidden border-2 transition-colors bg-white"
                    style={{ borderColor: activeImage === i ? tokens.accentColor : '#f0e4da' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div
              className="flex-1 aspect-square rounded-[2rem] bg-white overflow-hidden"
              style={{ boxShadow: `0 24px 60px -20px ${tokens.accentColor}40` }}
            >
              {images[activeImage] ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="სურათის გადიდება"
                  className="w-full h-full cursor-zoom-in"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={images[activeImage].url} alt={product.name} className="w-full h-full object-cover" />
                </button>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#c9b8ac] text-xs font-medium">სურათი არ არის</div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="font-black text-4xl sm:text-5xl text-[#1a1a1a] tracking-tight leading-[1.05] mb-5">
              {product.name}
            </h1>

            {salePrice !== null ? (
              <div className="flex items-center gap-3 mb-8">
                <span className="font-black text-4xl" style={{ color: tokens.accentColor }}>₾{salePrice.toFixed(2)}</span>
                <span className="text-[#c9b8ac] text-xl line-through">₾{price.toFixed(2)}</span>
              </div>
            ) : (
              <p className="font-black text-4xl mb-8" style={{ color: tokens.accentColor }}>₾{price.toFixed(2)}</p>
            )}

            <VariantSelector
              options={purchasableOptions}
              selected={selected}
              onChange={(optionId, valueId) => setSelected(prev => ({ ...prev, [optionId]: valueId }))}
              tokens={tokens}
              radiusClass="rounded-full"
            />

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center rounded-full bg-white border border-[#f0e4da]">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-10 text-center text-[#1a1a1a] text-sm font-bold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors text-lg"
                >
                  +
                </button>
              </div>
              {selectionComplete && stock !== null && (
                <span className="text-xs font-medium text-[#a89a90]">
                  {stock > 0 ? `მარაგშია: ${stock} ცალი` : 'არ არის მარაგში'}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              className="w-full py-4 rounded-full text-sm font-bold transition-transform hover:scale-[1.02] mb-8 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-white"
              style={{ backgroundColor: added ? '#2d6a2d' : tokens.accentColor, boxShadow: added ? 'none' : `0 16px 40px -12px ${tokens.accentColor}88` }}
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

            {product.description && (
              <div className="pt-8 border-t border-[#f0e4da]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#c9b8ac] mb-3">აღწერა</p>
                <p className="text-[#6b6058] text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.videoUrl && (
              <div className="pt-8 border-t border-[#f0e4da]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#c9b8ac] mb-3">ვიდეო</p>
                <video src={product.videoUrl} controls className="w-full max-w-sm rounded-2xl bg-black" />
              </div>
            )}
          </div>
        </div>

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
