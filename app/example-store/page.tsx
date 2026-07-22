'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PRODUCTS, CATEGORIES, getCategoryName } from '@/lib/store/products'
import { useCart } from '@/lib/store/cart-context'
import { CImg } from '@/components/ui/CImg'

function badgeClass(badge: string) {
  if (badge === 'ფასდაკლება') return 'bg-[#c8102e] text-white'
  if (badge === 'ახალი') return 'bg-[#111] text-white'
  return 'bg-white border border-[#e5e5e5] text-[#111]'
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} width="10" height="10" viewBox="0 0 12 12"
          fill={n <= Math.round(rating) ? '#e8a000' : 'none'}
          stroke="#e8a000" strokeWidth="1.2" aria-hidden>
          <path d="M6 1l1.3 2.6L10 4.1l-2 2 .5 2.9L6 7.7 3.5 9l.5-2.9-2-2 2.7-.5L6 1z" />
        </svg>
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: (typeof PRODUCTS)[0] }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const v = product.variants[0]
    addItem({ product, color: v.color, size: v.sizes[Math.floor(v.sizes.length / 2)], quantity: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <Link href={`/example-store/products/${product.slug}`} className="group block">
      <div className="bg-white border border-[#e5e5e5] hover:shadow-md transition-shadow duration-200">
        <div className="relative aspect-square bg-[#f7f7f7] overflow-hidden">
          <CImg
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.badge && (
            <span className={`absolute top-3 left-3 text-[9px] font-bold px-2 py-1 uppercase tracking-wider ${badgeClass(product.badge)}`}>
              {product.badge}
            </span>
          )}
          <button
            onClick={quickAdd}
            className={[
              'absolute bottom-0 left-0 right-0 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200',
              'opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0',
              added ? 'bg-[#2d6a2d] text-white' : 'bg-[#111] text-white',
            ].join(' ')}
          >
            {added ? '✓ კალათაში დამატდა' : 'სწრაფი დამატება'}
          </button>
        </div>
        <div className="p-3.5">
          <p className="text-[#999] text-[10px] uppercase tracking-wider mb-1">
            {getCategoryName(product.category)}
          </p>
          <h3 className="text-[#111] font-semibold text-sm leading-snug mb-2 group-hover:underline underline-offset-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating rating={product.rating} />
            <span className="text-[#bbb] text-[10px]">({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111] text-sm">₾{product.price}</span>
            {product.originalPrice && (
              <span className="text-[#bbb] text-xs line-through">₾{product.originalPrice}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

const BRANDS = ['Nike', 'Adidas', 'Timberland', 'Vans', 'Dr. Martens', 'Salomon', "Tod's", 'New Balance', 'Nike', 'Adidas', 'Timberland', 'Vans', 'Dr. Martens', 'Salomon', "Tod's", 'New Balance']

export default function StoreHomePage() {
  const newArrivals = PRODUCTS.filter(p => p.badge === 'ბესტსელერი' || p.badge === 'ახალი').slice(0, 4)
  const bestSeller = PRODUCTS.find(p => p.badge === 'ბესტსელერი') ?? PRODUCTS[0]

  // One product per category for the mini-grid in the hero
  const categorySpotlight = [
    PRODUCTS.find(p => p.category === 'running')!,
    PRODUCTS.find(p => p.category === 'sneakers')!,
    PRODUCTS.find(p => p.category === 'boots')!,
    PRODUCTS.find(p => p.category === 'casual')!,
  ]

  return (
    <div className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <>
        <style>{`
          @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .ticker-track { animation: ticker 28s linear infinite; }
        `}</style>

        {/* Full-bleed split — no max-width container so image reaches screen edge */}
        <section className="border-b border-[#e5e5e5] grid lg:grid-cols-[1fr_52%] min-h-[92vh]">

          {/* ── Left: editorial text ── */}
          <div className="flex flex-col justify-between py-14 px-6 sm:px-10 lg:pl-[max(2rem,calc((100vw-80rem)/2+1.5rem))] lg:pr-12 xl:pr-16">

            {/* Top: eyebrow */}
            <div className="flex items-center gap-3">
              <span className="w-6 h-px bg-[#111]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#555]">
                ახალი სეზონი · 2026
              </p>
            </div>

            {/* Middle: headline + body + CTAs */}
            <div>
              <h1 className="font-black text-[#111] tracking-[-0.03em] leading-[0.95] mb-8"
                style={{ fontSize: 'clamp(3.8rem, 7.5vw, 7.5rem)' }}>
                ყოველი<br />
                ნაბიჯი<br />
                <span className="italic font-black">სტილია</span>
              </h1>

              <p className="text-[#666] text-sm leading-relaxed mb-8 max-w-xs">
                პრემიუმ ფეხსაცმელი — მორბენალებისთვის, სნიკერ-მოყვარულებისა და ყველასთვის ვინც სიარულს სერიოზულად ეკიდება.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  href="/example-store/products"
                  className="inline-flex items-center gap-2 bg-[#111] text-white text-xs font-bold px-7 py-3.5 hover:bg-[#333] transition-colors uppercase tracking-widest"
                >
                  ყველა ნახვა
                </Link>
                <Link
                  href="/example-store/products?category=running"
                  className="inline-flex items-center gap-2 border border-[#ccc] text-[#111] text-xs font-bold px-7 py-3.5 hover:border-[#111] transition-colors uppercase tracking-widest"
                >
                  სირბილი
                </Link>
              </div>

              {/* Category spotlight grid */}
              <div className="grid grid-cols-4 gap-2">
                {categorySpotlight.map(p => (
                  <Link key={p.id} href={`/example-store/products?category=${p.category}`}
                    className="group flex flex-col gap-1.5">
                    <div className="aspect-square bg-[#f7f7f7] overflow-hidden border border-[#e5e5e5]">
                      <CImg src={p.images[0]} alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#555] group-hover:text-[#111] transition-colors">
                      {getCategoryName(p.category)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom: stats */}
            <div className="flex items-center gap-8 pt-6 border-t border-[#e5e5e5]">
              {[
                { value: '13', label: 'მოდელი' },
                { value: '4', label: 'კატეგორია' },
                { value: '★ 4.7', label: 'საშ. შეფასება' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-black text-[#111] text-lg leading-none">{value}</p>
                  <p className="text-[#aaa] text-[10px] mt-1 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: full-bleed product photo ── */}
          <div className="hidden lg:block relative bg-[#f0efed] overflow-hidden">
            <CImg
              src={bestSeller.images[0]}
              alt={bestSeller.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Top-left: bestseller tag */}
            <div className="absolute top-6 left-6">
              <span className="bg-white text-[#111] text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 border border-[#e5e5e5]">
                ბესტსელერი
              </span>
            </div>

            {/* Top-right: rating chip */}
            <div className="absolute top-6 right-6 bg-white border border-[#e5e5e5] px-3 py-2 flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="#e8a000" aria-hidden>
                <path d="M6 1l1.3 2.6L10 4.1l-2 2 .5 2.9L6 7.7 3.5 9l.5-2.9-2-2 2.7-.5L6 1z"/>
              </svg>
              <span className="text-[#111] font-bold text-xs">{bestSeller.rating}</span>
              <span className="text-[#aaa] text-[10px]">({bestSeller.reviewCount})</span>
            </div>

            {/* Bottom: product info bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5] px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#aaa] mb-1">
                    {getCategoryName(bestSeller.category)}
                  </p>
                  <p className="font-bold text-[#111] text-base leading-tight">{bestSeller.name}</p>
                </div>
                <div className="flex items-center gap-5">
                  <p className="font-black text-[#111] text-2xl">₾{bestSeller.price}</p>
                  <Link
                    href={`/example-store/products/${bestSeller.slug}`}
                    className="flex items-center justify-center w-10 h-10 bg-[#111] hover:bg-[#333] transition-colors"
                    aria-label="View product"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Brand marquee strip ── */}
        <div className="border-b border-[#e5e5e5] overflow-hidden py-3 bg-[#f7f7f7]">
          <div className="ticker-track flex whitespace-nowrap select-none">
            {BRANDS.map((brand, i) => (
              <span key={i} className="inline-flex items-center gap-4 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#aaa]">
                {brand}
                <span className="text-[#ddd]">·</span>
              </span>
            ))}
          </div>
        </div>
      </>

      {/* ── Categories ───────────────────────────────────────────────── */}
      <section className="border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999] mb-2">დათვალიერება</p>
              <h2 className="font-black text-2xl text-[#111] tracking-tight">კატეგორიებით</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e5e5e5]">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                href={`/example-store/products?category=${cat.slug}`}
                className="group bg-white hover:bg-[#f7f7f7] transition-colors p-8 flex flex-col items-center justify-center gap-3 text-center"
              >
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <p className="font-semibold text-[#111] text-sm group-hover:underline underline-offset-2">{cat.name}</p>
                  <p className="text-[#bbb] text-xs mt-0.5">{cat.count} მოდელი</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ─────────────────────────────────────────────── */}
      <section className="bg-[#f7f7f7] border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999] mb-2">ახლახანს</p>
              <h2 className="font-black text-2xl text-[#111] tracking-tight">ახალი მოდელები</h2>
            </div>
            <Link href="/example-store/products" className="text-xs font-medium text-[#555] hover:text-[#111] transition-colors underline underline-offset-4">
              ყველა ნახვა →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── Best Seller Spotlight ────────────────────────────────────── */}
      <section className="border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 border border-[#e5e5e5]">
            <div className="bg-[#f7f7f7] aspect-square md:aspect-auto min-h-[320px] relative overflow-hidden">
              <CImg src={bestSeller.images[0]} alt={bestSeller.name} className="w-full h-full object-cover" />
              <span className="absolute top-4 left-4 bg-white border border-[#e5e5e5] text-[#111] text-[9px] font-bold px-2.5 py-1 uppercase tracking-wider">
                ბესტსელერი
              </span>
            </div>
            <div className="flex flex-col justify-center px-10 py-12 border-t md:border-t-0 md:border-l border-[#e5e5e5]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-4">
                {getCategoryName(bestSeller.category)}
              </p>
              <h2 className="font-black text-3xl md:text-4xl text-[#111] tracking-tight leading-tight mb-4">
                {bestSeller.name}
              </h2>
              <p className="text-[#666] text-sm leading-relaxed mb-6">
                {bestSeller.description}
              </p>
              <div className="flex items-center gap-2 mb-8">
                <StarRating rating={bestSeller.rating} />
                <span className="text-[#999] text-sm">{bestSeller.rating} ({bestSeller.reviewCount} შეფასება)</span>
              </div>
              <p className="font-black text-4xl text-[#111] mb-8">₾{bestSeller.price}</p>
              <Link
                href={`/example-store/products/${bestSeller.slug}`}
                className="inline-flex items-center gap-2 bg-[#111] text-white text-sm font-semibold px-8 py-3.5 hover:bg-[#333] transition-colors self-start"
              >
                ახლა ყიდვა
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── All Products ─────────────────────────────────────────────── */}
      <section className="bg-[#f7f7f7] border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999] mb-2">კოლექცია</p>
              <h2 className="font-black text-2xl text-[#111] tracking-tight">ყველა ფეხსაცმელი</h2>
            </div>
            <Link href="/example-store/products" className="text-xs font-medium text-[#555] hover:text-[#111] transition-colors underline underline-offset-4">
              {PRODUCTS.length} მოდელი →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {PRODUCTS.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/example-store/products"
              className="inline-block border border-[#111] text-[#111] text-sm font-semibold px-10 py-3.5 hover:bg-[#111] hover:text-white transition-colors"
            >
              ყველა {PRODUCTS.length} ფეხსაცმლის ნახვა
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ──────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e5e5e5]">
          {[
            { icon: '🚚', title: 'უფასო მიტანა',      sub: '₾100-ზე მეტ შეკვეთებზე' },
            { icon: '🔄', title: 'მარტივი დაბრუნება',  sub: '30-დღიანი დაბრუნება' },
            { icon: '🛡️', title: '2-წლიანი გარანტია',  sub: 'ყველა ფეხსაცმელზე' },
            { icon: '💬', title: 'ცოცხალი მხარდაჭერა', sub: 'ორშ–პარ, 10:00–19:00' },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="flex flex-col items-center text-center gap-2 px-6 py-6">
              <span className="text-2xl">{icon}</span>
              <p className="font-semibold text-[#111] text-sm">{title}</p>
              <p className="text-[#999] text-xs">{sub}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
