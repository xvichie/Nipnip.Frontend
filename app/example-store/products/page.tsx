'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PRODUCTS, CATEGORIES, getCategoryName } from '@/lib/store/products'
import { useCart } from '@/lib/store/cart-context'

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

const SORT_OPTIONS = [
  { value: 'featured',   label: 'გამორჩეული' },
  { value: 'price-asc',  label: 'ფასი: ზრდადი' },
  { value: 'price-desc', label: 'ფასი: კლებადი' },
  { value: 'rating',     label: 'საუკეთესო შეფასება' },
]

const PRICE_BUCKETS = [
  { value: 'all',  label: 'ყველა ფასი', min: 0,   max: Infinity },
  { value: 'lt75', label: '₾75-მდე',    min: 0,   max: 75 },
  { value: 'mid',  label: '₾75–₾150',   min: 75,  max: 150 },
  { value: 'hi',   label: '₾150+',      min: 150, max: Infinity },
]

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
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

function ProductsContent() {
  const params = useSearchParams()
  const activeCategory = params.get('category') ?? 'all'
  const [sort, setSort]               = useState('featured')
  const [search, setSearch]           = useState('')
  const [priceBucket, setPriceBucket] = useState('all')

  const bucket = PRICE_BUCKETS.find(b => b.value === priceBucket) ?? PRICE_BUCKETS[0]

  let filtered = (activeCategory === 'all' ? [...PRODUCTS] : PRODUCTS.filter(p => p.category === activeCategory))
    .filter(p => {
      const q = search.trim().toLowerCase()
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false
      if (p.price < bucket.min || p.price > bucket.max) return false
      return true
    })

  if (sort === 'price-asc')  filtered.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price)
  else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating)

  const catLabel = activeCategory === 'all'
    ? 'ყველა ფეხსაცმელი'
    : CATEGORIES.find(c => c.slug === activeCategory)?.name ?? activeCategory

  const hasFilters = search.trim() || priceBucket !== 'all'

  return (
    <div className="flex flex-col md:flex-row gap-10">

      {/* Sidebar */}
      <aside className="w-full md:w-48 shrink-0 flex flex-col gap-8">

        {/* Search */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-3">ძიება</p>
          <div className="relative">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none" aria-hidden>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ძიება..."
              className="w-full border border-[#e5e5e5] pl-9 pr-3 py-2 text-sm text-[#111] placeholder-[#bbb] focus:outline-none focus:border-[#111] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#111] transition-colors">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-3">კატეგორიები</p>
          <ul className="flex flex-col">
            <li>
              <Link
                href="/example-store/products"
                className={['flex items-center justify-between py-1.5 text-sm transition-colors border-b border-[#f0f0f0]',
                  activeCategory === 'all' ? 'text-[#111] font-semibold' : 'text-[#666] hover:text-[#111]'].join(' ')}
              >
                ყველა
                <span className="text-[#bbb] text-[10px]">{PRODUCTS.length}</span>
              </Link>
            </li>
            {CATEGORIES.map(cat => (
              <li key={cat.id}>
                <Link
                  href={`/example-store/products?category=${cat.slug}`}
                  className={['flex items-center justify-between py-1.5 text-sm transition-colors border-b border-[#f0f0f0]',
                    activeCategory === cat.slug ? 'text-[#111] font-semibold' : 'text-[#666] hover:text-[#111]'].join(' ')}
                >
                  <span className="flex items-center gap-1.5">{cat.icon} {cat.name}</span>
                  <span className="text-[#bbb] text-[10px]">{cat.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Price */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-3">ფასი</p>
          <ul className="flex flex-col gap-1">
            {PRICE_BUCKETS.map(b => (
              <li key={b.value}>
                <button
                  onClick={() => setPriceBucket(b.value)}
                  className={['flex items-center gap-2.5 w-full py-1 text-sm transition-colors text-left',
                    priceBucket === b.value ? 'text-[#111] font-semibold' : 'text-[#666] hover:text-[#111]'].join(' ')}
                >
                  <span className={['w-3.5 h-3.5 border shrink-0 flex items-center justify-center',
                    priceBucket === b.value ? 'border-[#111] bg-[#111]' : 'border-[#ccc]'].join(' ')}>
                    {priceBucket === b.value && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
                        <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  {b.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setPriceBucket('all') }}
            className="text-xs text-[#999] hover:text-[#c8102e] transition-colors self-start underline underline-offset-2"
          >
            ფილტრების გასუფთავება
          </button>
        )}
      </aside>

      {/* Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e5e5e5]">
          <p className="text-sm text-[#666]">
            <span className="text-[#111] font-semibold">{filtered.length}</span> {catLabel}
            {search && <span className="text-[#bbb]"> · „{search}"</span>}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-[#999] text-xs whitespace-nowrap">დალაგება:</label>
            <select
              id="sort"
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="border border-[#e5e5e5] text-[#111] text-xs px-3 py-1.5 focus:outline-none focus:border-[#111] bg-white"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-4 text-center">
            <p className="text-4xl">🔍</p>
            <p className="text-[#999] text-sm">ფეხსაცმელი ვერ მოიძებნა.</p>
            <button
              onClick={() => { setSearch(''); setPriceBucket('all') }}
              className="text-sm text-[#111] underline underline-offset-2 hover:no-underline"
            >
              ფილტრების გასუფთავება
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24">
      <div className="mb-8 pb-6 border-b border-[#e5e5e5]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999] mb-1">კოლექცია</p>
        <h1 className="font-black text-3xl text-[#111] tracking-tight">ჩვენი ფეხსაცმელი</h1>
      </div>
      <Suspense>
        <ProductsContent />
      </Suspense>
    </div>
  )
}
