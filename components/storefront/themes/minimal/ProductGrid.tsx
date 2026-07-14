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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24">
      <div className="mb-8 pb-6 border-b border-[#e5e5e5]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999] mb-1">კოლექცია</p>
        <h1 className="font-black text-3xl text-[#111] tracking-tight">{activeCategoryName ?? 'ყველა პროდუქტი'}</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-10">

        {displayCategories.length > 0 && (
          <aside className="w-full md:w-48 shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-3">კატეგორიები</p>
            <ul className="flex flex-col">
              <li>
                <Link
                  href={`/store/${slug}/products`}
                  className={[
                    'flex items-center py-1.5 text-sm transition-colors border-b border-[#f0f0f0]',
                    !activeCategorySlug ? 'text-[#111] font-semibold' : 'text-[#666] hover:text-[#111]',
                  ].join(' ')}
                >
                  ყველა
                </Link>
              </li>
              {displayCategories.map(category => (
                <li key={category.id}>
                  <Link
                    href={`/store/${slug}/products/category/${category.slug}`}
                    className={[
                      'flex items-center py-1.5 text-sm transition-colors border-b border-[#f0f0f0]',
                      activeCategorySlug === category.slug ? 'text-[#111] font-semibold' : 'text-[#666] hover:text-[#111]',
                    ].join(' ')}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-[#e5e5e5]">
            <p className="text-sm text-[#666]">
              <span className="text-[#111] font-semibold">{visibleProducts.length}</span> პროდუქტი
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ძიება..."
                className="w-full sm:w-56 border border-[#e5e5e5] text-sm px-3 py-2 text-[#111] placeholder:text-[#999] focus:outline-none focus:border-[#111] transition-colors"
              />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as ProductSortOption)}
                className="border border-[#e5e5e5] text-sm px-3 py-2 text-[#111] focus:outline-none focus:border-[#111] transition-colors bg-white"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="py-32 flex flex-col items-center gap-4 text-center">
              <p className="text-[#999] text-sm">პროდუქტი ვერ მოიძებნა.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleProducts.map(product => (
                <ProductCard
                  key={product.id}
                  slug={slug}
                  product={product}
                  categoryName={product.categoryId ? categoryNames.get(product.categoryId) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
