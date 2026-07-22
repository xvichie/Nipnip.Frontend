'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getProductBySlug, PRODUCTS, getCategoryName } from '@/lib/store/products'
import { useCart } from '@/lib/store/cart-context'
import { CImg } from '@/components/ui/CImg'

function badgeClass(badge: string) {
  if (badge === 'ფასდაკლება') return 'bg-[#c8102e] text-white'
  if (badge === 'ახალი') return 'bg-[#111] text-white'
  return 'bg-white border border-[#e5e5e5] text-[#111]'
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const product = getProductBySlug(slug)
  const router = useRouter()
  const { addItem } = useCart()

  const [activeImage, setActiveImage]           = useState(0)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [selectedSize, setSelectedSize]         = useState<string | null>(null)
  const [added, setAdded]                       = useState(false)
  const [sizeError, setSizeError]               = useState(false)

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <p className="text-5xl mb-6">👟</p>
        <h1 className="text-2xl font-black text-[#111] mb-2">ფეხსაცმელი ვერ მოიძებნა</h1>
        <p className="text-[#999] mb-8">ეს ფეხსაცმელი შესაძლოა გაყიდულია ან ბმული არასწორია.</p>
        <Link href="/example-store/products"
          className="bg-[#111] text-white text-sm font-semibold px-6 py-3 hover:bg-[#333] transition-colors">
          ყველა ფეხსაცმლის ნახვა
        </Link>
      </div>
    )
  }

  const variant = product.variants[selectedVariantIdx]

  function handleAddToCart() {
    if (!selectedSize) { setSizeError(true); setTimeout(() => setSizeError(false), 2500); return }
    addItem({ product: product!, color: variant.color, size: selectedSize, quantity: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    if (!selectedSize) { setSizeError(true); setTimeout(() => setSizeError(false), 2500); return }
    addItem({ product: product!, color: variant.color, size: selectedSize, quantity: 1 })
    router.push('/example-store/checkout')
  }

  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-[#e5e5e5]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-[#999]">
          <Link href="/example-store" className="hover:text-[#111] transition-colors">მთავარი</Link>
          <span>/</span>
          <Link href="/example-store/products" className="hover:text-[#111] transition-colors">ფეხსაცმელი</Link>
          <span>/</span>
          <Link href={`/example-store/products?category=${product.category}`} className="hover:text-[#111] transition-colors">
            {getCategoryName(product.category)}
          </Link>
          <span>/</span>
          <span className="text-[#666] truncate max-w-[160px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* Images */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-2 shrink-0">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={['w-16 h-16 overflow-hidden border-2 transition-colors bg-[#f7f7f7]',
                    activeImage === i ? 'border-[#111]' : 'border-[#e5e5e5] hover:border-[#999]'].join(' ')}
                >
                  <CImg src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 aspect-square bg-[#f7f7f7] overflow-hidden relative">
              <CImg src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              {product.badge && (
                <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 uppercase tracking-wider ${badgeClass(product.badge)}`}>
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-3">
              {getCategoryName(product.category)}
            </p>
            <h1 className="font-black text-3xl sm:text-4xl text-[#111] tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-[#e5e5e5]">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(n => (
                  <svg key={n} width="13" height="13" viewBox="0 0 12 12"
                    fill={n <= Math.round(product.rating) ? '#e8a000' : 'none'}
                    stroke="#e8a000" strokeWidth="1.2" aria-hidden>
                    <path d="M6 1l1.3 2.6L10 4.1l-2 2 .5 2.9L6 7.7 3.5 9l.5-2.9-2-2 2.7-.5L6 1z" />
                  </svg>
                ))}
              </div>
              <span className="text-[#111] font-semibold text-sm">{product.rating}</span>
              <span className="text-[#bbb] text-sm">({product.reviewCount} შეფასება)</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-8">
              <span className="font-black text-4xl text-[#111]">₾{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-[#bbb] text-xl line-through mb-0.5">₾{product.originalPrice}</span>
                  <span className="text-[#c8102e] font-bold text-sm mb-1">
                    დაზოგვა ₾{product.originalPrice - product.price}
                  </span>
                </>
              )}
            </div>

            {/* Color */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#666] mb-3">
                ფერი: <span className="text-[#111] normal-case font-semibold">{variant.color}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedVariantIdx(i); setSelectedSize(null) }}
                    title={v.color}
                    className={['w-7 h-7 rounded-full border-2 transition-all',
                      selectedVariantIdx === i ? 'border-[#111] scale-110' : 'border-[#ccc] hover:border-[#888]'].join(' ')}
                    style={{ backgroundColor: v.colorHex }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className={['text-xs font-semibold uppercase tracking-wider',
                  sizeError ? 'text-[#c8102e]' : 'text-[#666]'].join(' ')}>
                  {sizeError ? '⚠ ზომა არჩეული არ არის' : 'ზომა (EU)'}
                  {selectedSize && !sizeError && <span className="text-[#111] normal-case ml-1">{selectedSize}</span>}
                </p>
                <button className="text-xs text-[#999] hover:text-[#111] underline underline-offset-2 transition-colors">
                  ზომების ცხრილი
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {variant.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false) }}
                    className={['w-11 h-9 text-sm font-medium border transition-colors',
                      selectedSize === size
                        ? 'bg-[#111] border-[#111] text-white'
                        : sizeError
                        ? 'border-[#c8102e]/40 text-[#999] hover:border-[#999] hover:text-[#111]'
                        : 'border-[#e5e5e5] text-[#555] hover:border-[#111] hover:text-[#111]',
                    ].join(' ')}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className={['flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold uppercase tracking-wide transition-colors',
                  added
                    ? 'bg-[#2d6a2d] text-white border border-[#2d6a2d]'
                    : 'border border-[#111] text-[#111] hover:bg-[#f7f7f7]',
                ].join(' ')}
              >
                {added ? '✓ კალათაში დამატდა' : 'კალათაში დამატება'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-4 text-sm font-semibold uppercase tracking-wide bg-[#111] text-white hover:bg-[#333] transition-colors"
              >
                ახლავე შეძენა
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-[#e5e5e5]">
              {['უფასო მიტანა', 'უფასო დაბრუნება', '2-წლიანი გარანტია'].map(f => (
                <span key={f} className="inline-flex items-center gap-1.5 text-xs text-[#555] border border-[#e5e5e5] px-3 py-1.5">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2 6l3 3 5-5" stroke="#2d6a2d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </span>
              ))}
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#999] mb-3">ამ ფეხსაცმლის შესახებ</p>
              <p className="text-[#555] text-sm leading-relaxed">{product.longDescription}</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20 pt-10 border-t border-[#e5e5e5]">
            <h2 className="font-black text-xl text-[#111] tracking-tight mb-6">შეიძლება მოგეწონოს</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} href={`/example-store/products/${p.slug}`} className="group block">
                  <div className="bg-white border border-[#e5e5e5] hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-[#f7f7f7] overflow-hidden">
                      <CImg src={p.images[0]} alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-3.5">
                      <h3 className="text-[#111] font-semibold text-sm mb-1 group-hover:underline underline-offset-2">{p.name}</h3>
                      <span className="text-[#111] font-bold text-sm">₾{p.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
