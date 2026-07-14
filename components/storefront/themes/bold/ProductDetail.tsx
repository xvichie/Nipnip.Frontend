'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useStorefrontCart } from '@/lib/store/storefront-cart-context'
import { VariantSelector } from '../../VariantSelector'
import { ImageLightbox } from '../../ImageLightbox'
import { glowShadow, shadeColor } from '@/lib/store/theme-config'
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
  const gradient = `linear-gradient(135deg, ${tokens.accentColor}, ${shadeColor(tokens.accentColor, -30)})`

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
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">

          <div className="flex gap-3">
            {images.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0">
                {images.map((image, i) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImage(i)}
                    className="w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors bg-white/[0.06]"
                    style={{ borderColor: activeImage === i ? tokens.accentColor : 'rgba(255,255,255,0.1)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div
              className="flex-1 aspect-square rounded-2xl bg-white/[0.06] overflow-hidden"
              style={{ boxShadow: glowShadow(tokens.accentColor) }}
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
                <div className="w-full h-full flex items-center justify-center text-white/20 text-xs uppercase tracking-wider">
                  სურათი არ არის
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            {salePrice !== null ? (
              <div className="flex items-center gap-3 mb-8">
                <span className="font-black text-4xl" style={{ color: tokens.accentColor }}>
                  ₾{salePrice.toFixed(2)}
                </span>
                <span className="text-white/30 text-xl line-through">₾{price.toFixed(2)}</span>
              </div>
            ) : (
              <p className="font-black text-4xl mb-8" style={{ color: tokens.accentColor }}>
                ₾{price.toFixed(2)}
              </p>
            )}

            <VariantSelector
              options={purchasableOptions}
              selected={selected}
              onChange={(optionId, valueId) => setSelected(prev => ({ ...prev, [optionId]: valueId }))}
              tokens={tokens}
              radiusClass="rounded-xl"
            />

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center rounded-full bg-white/[0.06] border border-white/10">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-white/60 hover:text-white transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-10 text-center text-white text-sm font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-white/60 hover:text-white transition-colors text-lg"
                >
                  +
                </button>
              </div>
              {matchedVariant && (
                <span className="text-xs text-white/40">
                  {matchedVariant.stock > 0 ? `მარაგშია: ${matchedVariant.stock} ცალი` : 'არ არის მარაგში'}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!matchedVariant || matchedVariant.stock < 1}
              onClick={handleAddToCart}
              className="w-full py-4 rounded-full text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.02] mb-8 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-white"
              style={{ background: added ? '#2d6a2d' : gradient, boxShadow: added ? 'none' : glowShadow(tokens.accentColor, '88') }}
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
              <p className="text-red-400 text-sm -mt-6 mb-8">დაფიქსირდა შეცდომა. სცადეთ თავიდან.</p>
            )}

            {product.description && (
              <div className="pt-8 border-t border-white/10">
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">აღწერა</p>
                <p className="text-white/70 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <Link
            href={`/products`}
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
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
