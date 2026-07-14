'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import { VariantSelector } from '../../VariantSelector'
import { ImageLightbox } from '../../ImageLightbox'
import type { ProductDetailResponse, ThemeConfig } from '@/lib/types/storefront'

export function ProductDetail({
  slug,
  product,
  tokens,
}: {
  slug: string
  product: ProductDetailResponse
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

  const price = matchedVariant?.price ?? product.basePrice
  const salePrice = matchedVariant ? matchedVariant.salePrice : product.salePrice
  const images = product.images

  async function handleAddToCart() {
    if (!matchedVariant) return
    setAddError(false)
    try {
      await addItem(matchedVariant.id, quantity)
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
        <div className="grid lg:grid-cols-2 gap-14">

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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="w-full h-full object-cover" />
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={images[activeImage].url} alt={product.name} className="w-full h-full object-cover" />
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
              {matchedVariant && (
                <span className="text-xs uppercase tracking-widest text-[#9c8f7e]">
                  {matchedVariant.stock > 0 ? `მარაგშია: ${matchedVariant.stock} ცალი` : 'არ არის მარაგში'}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!matchedVariant || matchedVariant.stock < 1}
              onClick={handleAddToCart}
              className="w-full py-4 text-xs uppercase tracking-[0.2em] font-medium transition-opacity mb-9 disabled:opacity-40 disabled:cursor-not-allowed text-white hover:opacity-90"
              style={{ backgroundColor: added ? '#2d6a2d' : tokens.accentColor }}
            >
              {added
                ? '✓ დაემატა კალათაში'
                : !matchedVariant
                ? 'აირჩიეთ ვარიანტი'
                : matchedVariant.stock < 1
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
          </div>
        </div>

        <div className="mt-12">
          <Link href={`/store/${slug}/products`} className="text-xs uppercase tracking-widest text-[#9c8f7e] hover:text-[#1c1a17] transition-colors">
            ← ყველა პროდუქტს დაბრუნება
          </Link>
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
