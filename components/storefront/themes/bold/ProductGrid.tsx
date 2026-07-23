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
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-2">კოლექცია</p>
          <h1 className="font-black text-4xl text-white tracking-tight">{activeCategoryName ?? 'ყველა პროდუქტი'}</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-10">

          <aside className="w-full md:w-52 shrink-0 flex flex-col gap-8 md:sticky md:top-16 md:self-start md:max-h-[calc(100vh-5rem)] md:overflow-y-auto md:pb-6">
            {displayCategories.length > 0 && (
              <div className="flex flex-col gap-2">
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
                      'rounded-full py-2 text-sm font-medium transition-colors',
                      activeCategorySlug === category.slug ? 'text-white' : 'text-white/50 hover:text-white',
                      category.isChild ? 'pl-7 pr-4' : 'px-4',
                    ].join(' ')}
                    style={activeCategorySlug === category.slug ? { backgroundColor: `${tokens.accentColor}33` } : {}}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            {bounds && (
              <PriceRangeFilter
                min={bounds[0]}
                max={bounds[1]}
                value={effectiveRange ?? bounds}
                onChange={handlePriceChange}
                accentColor={tokens.accentColor}
                trackColorClassName="bg-white/10"
                labelClassName="text-white/40"
                valueClassName="text-white"
              />
            )}

            <OptionFiltersPanel
              facets={facets ?? []}
              selected={optionFilters}
              onChange={handleOptionFiltersChange}
              accentColor={tokens.accentColor}
              labelClassName="text-white/40"
              chipClassName="border-white/10 bg-white/[0.06] text-white/60 hover:text-white"
            />
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm text-white/50">
                <span className="text-white font-semibold">{totalCount}</span> პროდუქტი
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ძიება..."
                  className="w-full sm:w-56 rounded-full bg-white/[0.06] border border-white/10 text-sm px-4 py-2 text-white placeholder:text-white/30 focus:outline-none transition-colors"
                />
                <select
                  value={sortBy}
                  onChange={e => handleSortChange(e.target.value as ProductSortOption)}
                  className="w-full sm:w-auto shrink-0 rounded-full bg-white/[0.06] border border-white/10 text-sm px-4 py-2 text-white focus:outline-none transition-colors"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-square rounded-2xl bg-white/[0.04]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-4 text-center">
                <p className="text-white/40 text-sm">პროდუქტი ვერ მოიძებნა.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
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
                  buttonClassName="btn btn-sm rounded-full bg-white/[0.06] border border-white/10 text-white/60 hover:text-white disabled:opacity-30"
                  textClassName="text-white/40"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
