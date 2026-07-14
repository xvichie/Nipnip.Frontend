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
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <div className="mb-8 text-center">
          <p className="italic font-serif text-sm text-[#767676] mb-1">კოლექცია</p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-[#111111]">{activeCategoryName ?? 'ყველა პროდუქტი'}</h1>
        </div>

        {displayCategories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-6 border-y border-black/10 mb-8">
            <Link
              href={`/products`}
              className={`text-xs uppercase tracking-widest transition-colors ${!activeCategorySlug ? 'text-[#111111] underline underline-offset-4' : 'text-[#767676] hover:text-[#111111] hover:underline underline-offset-4'}`}
            >
              ყველა
            </Link>
            {displayCategories.map(category => (
              <Link
                key={category.id}
                href={`/products/category/${category.slug}`}
                className={`text-xs uppercase tracking-widest transition-colors ${activeCategorySlug === category.slug ? 'text-[#111111] underline underline-offset-4' : 'text-[#767676] hover:text-[#111111] hover:underline underline-offset-4'}`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <p className="text-sm text-[#767676]">
            <span className="text-[#111111] font-medium">{visibleProducts.length}</span> პროდუქტი
          </p>
          <div className="flex items-center gap-6">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ძიება..."
              className="w-full sm:w-56 bg-transparent border-b border-black/20 text-sm px-0 py-2 text-[#111111] placeholder:text-[#767676] focus:outline-none focus:border-black transition-colors"
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as ProductSortOption)}
              className="bg-transparent underline underline-offset-4 text-sm px-0 py-2 text-[#111111] focus:outline-none"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-4 text-center">
            <p className="text-[#767676] text-sm">პროდუქტი ვერ მოიძებნა.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-8">
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
  )
}
