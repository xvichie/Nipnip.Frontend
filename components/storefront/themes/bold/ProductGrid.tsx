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
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-2">კოლექცია</p>
          <h1 className="font-black text-4xl text-white tracking-tight">{activeCategoryName ?? 'ყველა პროდუქტი'}</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-10">

          {displayCategories.length > 0 && (
            <aside className="w-full md:w-52 shrink-0 flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">კატეგორიები</p>
              <Link
                href={`/products`}
                className={[
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors text-left',
                  !activeCategorySlug ? 'text-white' : 'text-white/50 hover:text-white',
                ].join(' ')}
                style={!activeCategorySlug ? { backgroundColor: `${tokens.accentColor}33` } : {}}
              >
                ყველა
              </Link>
              {displayCategories.map(category => (
                <Link
                  key={category.id}
                  href={`/products/category/${category.slug}`}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    activeCategorySlug === category.slug ? 'text-white' : 'text-white/50 hover:text-white',
                  ].join(' ')}
                  style={activeCategorySlug === category.slug ? { backgroundColor: `${tokens.accentColor}33` } : {}}
                >
                  {category.name}
                </Link>
              ))}
            </aside>
          )}

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm text-white/50">
                <span className="text-white font-semibold">{visibleProducts.length}</span> პროდუქტი
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ძიება..."
                  className="w-full sm:w-56 rounded-full bg-white/[0.06] border border-white/10 text-sm px-4 py-2 text-white placeholder:text-white/30 focus:outline-none transition-colors"
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as ProductSortOption)}
                  className="rounded-full bg-white/[0.06] border border-white/10 text-sm px-4 py-2 text-white focus:outline-none transition-colors"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {visibleProducts.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-4 text-center">
                <p className="text-white/40 text-sm">პროდუქტი ვერ მოიძებნა.</p>
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
