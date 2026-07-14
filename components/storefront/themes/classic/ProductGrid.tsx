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
    <div className="bg-[#fafafa] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">კოლექცია</p>
          <h1 className="font-bold text-3xl text-gray-900">{activeCategoryName ?? 'ყველა პროდუქტი'}</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          {displayCategories.length > 0 && (
            <aside className="w-full md:w-52 shrink-0">
              <div className="rounded-md bg-white shadow-sm p-4 flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">კატეგორიები</p>
                <Link
                  href={`/products`}
                  className={[
                    'rounded px-3 py-1.5 text-sm transition-colors',
                    !activeCategorySlug ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50',
                  ].join(' ')}
                >
                  ყველა
                </Link>
                {displayCategories.map(category => (
                  <Link
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    className={[
                      'rounded px-3 py-1.5 text-sm transition-colors',
                      activeCategorySlug === category.slug ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </aside>
          )}

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <p className="text-sm text-gray-500">
                <span className="text-gray-900 font-medium">{visibleProducts.length}</span> პროდუქტი
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ძიება..."
                  className="w-full sm:w-56 rounded-md bg-white shadow-sm border border-gray-200 text-sm px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors"
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as ProductSortOption)}
                  className="rounded-md bg-white shadow-sm border border-gray-200 text-sm px-3 py-2 text-gray-900 focus:outline-none transition-colors"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {visibleProducts.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-4 text-center">
                <p className="text-gray-400 text-sm">პროდუქტი ვერ მოიძებნა.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
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
