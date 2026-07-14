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
    <div className="bg-[#faf7f2] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9c7a4a] mb-2">კოლექცია</p>
          <h1 className="font-serif text-3xl text-[#1c1a17]">{activeCategoryName ?? 'ყველა პროდუქტი'}</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-10">

          {displayCategories.length > 0 && (
            <aside className="w-full md:w-52 shrink-0">
              <div className="border border-[#1c1a17]/10 p-5 flex flex-col gap-1">
                <p className="text-xs uppercase tracking-widest text-[#9c8f7e] mb-2">კატეგორიები</p>
                <Link
                  href={`/products`}
                  className={[
                    'px-3 py-2 text-xs uppercase tracking-widest transition-colors',
                    !activeCategorySlug ? 'text-[#1c1a17] font-medium' : 'text-[#9c8f7e] hover:text-[#1c1a17]',
                  ].join(' ')}
                >
                  ყველა
                </Link>
                {displayCategories.map(category => (
                  <Link
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    className={[
                      'px-3 py-2 text-xs uppercase tracking-widest transition-colors',
                      activeCategorySlug === category.slug ? 'text-[#1c1a17] font-medium' : 'text-[#9c8f7e] hover:text-[#1c1a17]',
                    ].join(' ')}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </aside>
          )}

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-xs uppercase tracking-widest text-[#9c8f7e]">
                <span className="text-[#1c1a17] font-medium">{visibleProducts.length}</span> პროდუქტი
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ძიება..."
                  className="w-full sm:w-56 bg-white border border-[#1c1a17]/15 text-sm px-3 py-2 text-[#1c1a17] placeholder:text-[#9c8f7e] focus:outline-none focus:border-[#1c1a17] transition-colors"
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as ProductSortOption)}
                  className="bg-white border border-[#1c1a17]/15 text-sm px-3 py-2 text-[#1c1a17] focus:outline-none focus:border-[#1c1a17] transition-colors"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {visibleProducts.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-4 text-center">
                <p className="text-[#9c8f7e] text-sm">პროდუქტი ვერ მოიძებნა.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
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
