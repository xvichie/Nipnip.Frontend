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
    <div className="bg-[#fafafa] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-16">
        <Breadcrumbs
          items={[
            { label: 'მთავარი', href: '/' },
            category ? { label: category.name, href: `/products/category/${category.slug}` } : { label: 'ყველა პროდუქტი', href: '/products' },
            { label: product.name },
          ]}
          textClassName="text-gray-900"
          mutedClassName="text-gray-400 hover:text-gray-900"
        />
        <div className="grid lg:grid-cols-2 gap-10">

          <div className="flex gap-3">
            {images.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0">
                {images.map((image, i) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImage(i)}
                    className="w-16 h-16 rounded-md overflow-hidden border-2 transition-colors bg-white"
                    style={{ borderColor: activeImage === i ? tokens.accentColor : '#e5e7eb' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 aspect-square rounded-md bg-white shadow-sm overflow-hidden">
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
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">სურათი არ არის</div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            {salePrice !== null ? (
              <div className="flex items-center gap-3 mb-6">
                <span className="font-bold text-3xl" style={{ color: tokens.accentColor }}>
                  ₾{salePrice.toFixed(2)}
                </span>
                <span className="text-gray-400 text-lg line-through">₾{price.toFixed(2)}</span>
              </div>
            ) : (
              <p className="font-bold text-3xl mb-6" style={{ color: tokens.accentColor }}>
                ₾{price.toFixed(2)}
              </p>
            )}

            <VariantSelector
              options={purchasableOptions}
              selected={selected}
              onChange={(optionId, valueId) => setSelected(prev => ({ ...prev, [optionId]: valueId }))}
              tokens={tokens}
              radiusClass="rounded-md"
            />

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center rounded-md bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-10 text-center text-gray-900 text-sm font-medium tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors text-lg"
                >
                  +
                </button>
              </div>
              {matchedVariant && (
                <span className="text-xs text-gray-400">
                  {matchedVariant.stock > 0 ? `მარაგშია: ${matchedVariant.stock} ცალი` : 'არ არის მარაგში'}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!matchedVariant || matchedVariant.stock < 1}
              onClick={handleAddToCart}
              className="w-full py-3.5 rounded-md text-sm font-semibold shadow-sm hover:shadow-md transition-shadow mb-8 disabled:opacity-40 disabled:cursor-not-allowed text-white"
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
              <p className="text-red-500 text-sm -mt-6 mb-8">დაფიქსირდა შეცდომა. სცადეთ თავიდან.</p>
            )}

            {product.description && (
              <div className="pt-6 border-t border-gray-200">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">აღწერა</p>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
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
