'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { PriceRangeFilter } from '@/components/storefront/shared/PriceRangeFilter'
import { OptionFiltersPanel } from '@/components/storefront/shared/OptionFiltersPanel'
import { Pagination } from '@/components/storefront/shared/Pagination'
import { useProductFacets, useProductPriceRange, useProducts } from '@/lib/queries/storefront'
import { padPriceBounds, SORT_OPTIONS, sortOptionToQuery, type ProductSortOption } from '@/lib/store/product-search'
import { getSidebarCategories } from '@/lib/store/nav-menu'
import type { CategoryResponse, OptionFilterInput, ThemeConfig } from '@/lib/types/storefront'

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
  const [optionFilters, setOptionFilters] = useState<OptionFilterInput[]>([])
  const [page, setPage] = useState(1)

  const { data: rawBounds } = useProductPriceRange(slug, activeCategorySlug)
  const bounds = rawBounds ? padPriceBounds(rawBounds.min, rawBounds.max) : null
  const effectiveRange = priceRange ?? bounds
  const { data: facets } = useProductFacets(slug, activeCategorySlug)

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
    optionFilters,
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

  function handleOptionFiltersChange(next: OptionFilterInput[]) {
    setOptionFilters(next)
    setPage(1)
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <div className="mb-8 text-center">
          <p className="italic font-serif text-sm text-[#767676] mb-1">კოლექცია</p>
          <h1 className="font-serif text-3xl sm:text-5xl tracking-tight text-[#111111]">{activeCategoryName ?? 'ყველა პროდუქტი'}</h1>
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
                className={`text-xs uppercase tracking-widest transition-colors ${activeCategorySlug === category.slug ? 'text-[#111111] underline underline-offset-4' : 'text-[#767676] hover:text-[#111111] hover:underline underline-offset-4'} ${category.isChild ? 'pl-4' : ''}`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {bounds && (
          <div className="max-w-xs mx-auto mb-10">
            <PriceRangeFilter
              min={bounds[0]}
              max={bounds[1]}
              value={effectiveRange ?? bounds}
              onChange={handlePriceChange}
              accentColor={tokens.accentColor}
              trackColorClassName="bg-black/10"
              labelClassName="text-[#767676]"
              valueClassName="text-[#111111]"
            />
          </div>
        )}

        {(facets ?? []).length > 0 && (
          <div className="max-w-2xl mx-auto mb-10 flex flex-col items-center gap-6">
            <OptionFiltersPanel
              facets={facets ?? []}
              selected={optionFilters}
              onChange={handleOptionFiltersChange}
              accentColor={tokens.accentColor}
              labelClassName="text-[#767676] text-center"
              chipClassName="border-black/15 bg-transparent text-[#111111]/70 hover:border-black/40"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <p className="text-sm text-[#767676]">
            <span className="text-[#111111] font-medium">{totalCount}</span> პროდუქტი
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
              onChange={e => handleSortChange(e.target.value as ProductSortOption)}
              className="bg-transparent underline underline-offset-4 text-sm px-0 py-2 text-[#111111] focus:outline-none"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[4/5]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-4 text-center">
            <p className="text-[#767676] text-sm">პროდუქტი ვერ მოიძებნა.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-8">
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
              buttonClassName="btn btn-sm bg-transparent border border-black/10 text-[#767676] hover:text-[#111111] disabled:opacity-30"
              textClassName="text-[#767676]"
            />
          </>
        )}
      </div>
    </div>
  )
}
