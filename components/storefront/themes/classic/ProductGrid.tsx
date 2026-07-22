'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { PriceRangeFilter } from '@/components/storefront/shared/PriceRangeFilter'
import { Pagination } from '@/components/storefront/shared/Pagination'
import { useProductPriceRange, useProducts } from '@/lib/queries/storefront'
import { padPriceBounds, SORT_OPTIONS, sortOptionToQuery, type ProductSortOption } from '@/lib/store/product-search'
import { getSidebarCategories } from '@/lib/store/nav-menu'
import type { CategoryResponse, ThemeConfig } from '@/lib/types/storefront'

const PAGE_SIZE = 20

export function ProductGrid({
  slug,
  categories,
  activeCategorySlug,
  tokens,
}: {
  slug: string
  categories: CategoryResponse[]
  activeCategorySlug?: string
  tokens: Required<ThemeConfig>
}) {
  const categoryNames = new Map(categories.map(c => [c.id, c.name]))
  const displayCategories = getSidebarCategories(categories, tokens)
  const activeCategoryName = activeCategorySlug ? displayCategories.find(c => c.slug === activeCategorySlug)?.name : undefined

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<ProductSortOption>('featured')
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [page, setPage] = useState(1)

  const { data: rawBounds } = useProductPriceRange(slug, activeCategorySlug)
  const bounds = rawBounds ? padPriceBounds(rawBounds.min, rawBounds.max) : null
  const effectiveRange = priceRange ?? bounds

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useProducts(slug, {
    categorySlug: activeCategorySlug,
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    minPrice: effectiveRange?.[0],
    maxPrice: effectiveRange?.[1],
    ...sortOptionToQuery(sortBy),
  })

  const products = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  function handleSortChange(next: ProductSortOption) {
    setSortBy(next)
    setPage(1)
  }

  function handlePriceChange(range: [number, number]) {
    setPriceRange(range)
    setPage(1)
  }

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">კოლექცია</p>
          <h1 className="font-bold text-3xl text-gray-900">{activeCategoryName ?? 'ყველა პროდუქტი'}</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          <aside className="w-full md:w-52 shrink-0 flex flex-col gap-4">
            {displayCategories.length > 0 && (
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
                      'rounded py-1.5 text-sm transition-colors',
                      activeCategorySlug === category.slug ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50',
                      category.isChild ? 'pl-6' : 'px-3',
                    ].join(' ')}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            {bounds && (
              <div className="rounded-md bg-white shadow-sm p-4">
                <PriceRangeFilter
                  min={bounds[0]}
                  max={bounds[1]}
                  value={effectiveRange ?? bounds}
                  onChange={handlePriceChange}
                  accentColor={tokens.accentColor}
                  trackColorClassName="bg-gray-200"
                  labelClassName="text-gray-400"
                  valueClassName="text-gray-900"
                />
              </div>
            )}
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <p className="text-sm text-gray-500">
                <span className="text-gray-900 font-medium">{totalCount}</span> პროდუქტი
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ძიება..."
                  className="w-full sm:w-56 rounded-md bg-white shadow-sm border border-gray-200 text-sm px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors"
                />
                <select
                  value={sortBy}
                  onChange={e => handleSortChange(e.target.value as ProductSortOption)}
                  className="w-full sm:w-auto shrink-0 rounded-md bg-white shadow-sm border border-gray-200 text-sm px-3 py-2 text-gray-900 focus:outline-none transition-colors"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-square rounded-md" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-4 text-center">
                <p className="text-gray-400 text-sm">პროდუქტი ვერ მოიძებნა.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      slug={slug}
                      product={product}
                      categoryName={product.categoryId ? categoryNames.get(product.categoryId) : undefined}
                      tokens={tokens}
                    />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                  buttonClassName="btn btn-sm rounded-md bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 disabled:opacity-30"
                  textClassName="text-gray-400"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
