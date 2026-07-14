'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { filterAndSortProducts, SORT_OPTIONS, type ProductSortOption } from '@/lib/store/product-search'
import { withSaleCategory } from '@/lib/store/sale-category'
import type { CategoryResponse, ProductSummaryResponse, ThemeConfig } from '@/lib/types/storefront'

export function ProductGrid({
  slug,
  categories,
  products,
  activeCategorySlug,
  tokens,
}: {
  slug: string
  categories: CategoryResponse[]
  products: ProductSummaryResponse[]
  activeCategorySlug?: string
  tokens: Required<ThemeConfig>
}) {
  const categoryNames = new Map(categories.map(c => [c.id, c.name]))
  const displayCategories = withSaleCategory(categories, tokens.showSaleCategory)
  const activeCategoryName = activeCategorySlug ? displayCategories.find(c => c.slug === activeCategorySlug)?.name : undefined
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<ProductSortOption>('featured')
  const visibleProducts = filterAndSortProducts(products, search, sortBy)

  return (
    <div className="bg-[#fffaf5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: tokens.accentColor }}>კოლექცია</p>
          <h1 className="font-black text-3xl text-[#1a1a1a] tracking-tight">{activeCategoryName ?? 'ყველა პროდუქტი'}</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          {displayCategories.length > 0 && (
            <aside className="w-full md:w-52 shrink-0 flex flex-col gap-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#c9b8ac] mb-1">კატეგორიები</p>
              <Link
                href={`/products`}
                className={[
                  'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                  !activeCategorySlug ? 'text-white' : 'text-[#1a1a1a]/60 hover:bg-[#fff2ec]',
                ].join(' ')}
                style={!activeCategorySlug ? { backgroundColor: tokens.accentColor } : {}}
              >
                ყველა
              </Link>
              {displayCategories.map(category => (
                <Link
                  key={category.id}
                  href={`/products/category/${category.slug}`}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                    activeCategorySlug === category.slug ? 'text-white' : 'text-[#1a1a1a]/60 hover:bg-[#fff2ec]',
                  ].join(' ')}
                  style={activeCategorySlug === category.slug ? { backgroundColor: tokens.accentColor } : {}}
                >
                  {category.name}
                </Link>
              ))}
            </aside>
          )}

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm text-[#a89a90] font-medium">
                <span className="text-[#1a1a1a] font-bold">{visibleProducts.length}</span> პროდუქტი
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ძიება..."
                  className="w-full sm:w-56 rounded-full bg-white border border-[#f0e4da] text-sm px-4 py-2.5 text-[#1a1a1a] placeholder:text-[#c9b8ac] focus:outline-none transition-colors"
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as ProductSortOption)}
                  className="rounded-full bg-white border border-[#f0e4da] text-sm px-4 py-2.5 text-[#1a1a1a] focus:outline-none transition-colors"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {visibleProducts.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-4 text-center">
                <p className="text-[#c9b8ac] text-sm">პროდუქტი ვერ მოიძებნა.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                {visibleProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    slug={slug}
                    product={product}
                    categoryName={product.categoryId ? categoryNames.get(product.categoryId) : undefined}
                    tokens={tokens}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
