'use client'

import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { PriceRangeFilter } from '@/components/storefront/shared/PriceRangeFilter'
import { OptionFiltersPanel } from '@/components/storefront/shared/OptionFiltersPanel'
import { Pagination } from '@/components/storefront/shared/Pagination'
import { useProductFacets, useProductPriceRange, useProducts } from '@/lib/queries/storefront'
import { padPriceBounds, SORT_OPTIONS, sortOptionToQuery, type ProductSortOption } from '@/lib/store/product-search'
import { useProductListUrlState } from '@/lib/store/use-product-list-url-state'
import { getSidebarCategories } from '@/lib/store/nav-menu'
import type { CategoryResponse, CollectionResponse, ThemeConfig } from '@/lib/types/storefront'

const PAGE_SIZE = 20

export function ProductGrid({
  slug,
  categories,
  collections = [],
  activeCategorySlug,
  activeCollectionSlug,
  tokens,
}: {
  slug: string
  categories: CategoryResponse[]
  collections?: CollectionResponse[]
  activeCategorySlug?: string
  activeCollectionSlug?: string
  tokens: Required<ThemeConfig>
}) {
  const categoryNames = new Map(categories.map(c => [c.id, c.name]))
  const displayCategories = getSidebarCategories(categories, tokens)
  const activeCategoryName = activeCategorySlug ? displayCategories.find(c => c.slug === activeCategorySlug)?.name : undefined
  const activeCollectionName = activeCollectionSlug ? collections.find(c => c.slug === activeCollectionSlug)?.name : undefined

  const {
    searchInput,
    setSearchInput,
    debouncedSearch,
    page,
    setPage,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    optionFilters,
    setOptionFilters,
  } = useProductListUrlState()

  const { data: rawBounds } = useProductPriceRange(slug, activeCategorySlug)
  const bounds = rawBounds ? padPriceBounds(rawBounds.min, rawBounds.max) : null
  const effectiveRange = priceRange ?? bounds
  const { data: facets } = useProductFacets(slug, activeCategorySlug)

  const { data, isLoading } = useProducts(slug, {
    categorySlug: activeCategorySlug,
    collectionSlug: activeCollectionSlug,
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

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">კოლექცია</p>
          <h1 className="flex items-center gap-2 font-black text-3xl text-slate-900 tracking-tight">
            <span className="inline-block w-1.5 h-1.5 shrink-0" style={{ backgroundColor: tokens.accentColor }} aria-hidden />
            {activeCategoryName ?? activeCollectionName ?? 'ყველა პროდუქტი'}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          <aside className="w-full md:w-56 shrink-0 flex flex-col gap-4 md:sticky md:top-14 md:self-start md:max-h-[calc(100vh-4.5rem)] md:overflow-y-auto md:pb-6">
            {displayCategories.length > 0 && (
              <div className="rounded-md border border-slate-200 bg-white p-4 flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">კატეგორია</p>
                <Link
                  href={`/products`}
                  className={[
                    'rounded-md px-3 py-2 text-sm transition-colors',
                    !activeCategorySlug ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                >
                  ყველა
                </Link>
                {displayCategories.map(category => (
                  <Link
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    className={[
                      'rounded-md py-2 text-sm transition-colors',
                      activeCategorySlug === category.slug ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-50',
                      category.isChild ? 'pl-6' : 'px-3',
                    ].join(' ')}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            {bounds && (
              <div className="rounded-md border border-slate-200 bg-white p-4">
                <PriceRangeFilter
                  min={bounds[0]}
                  max={bounds[1]}
                  value={effectiveRange ?? bounds}
                  onChange={setPriceRange}
                  accentColor={tokens.accentColor}
                  trackColorClassName="bg-slate-200"
                  labelClassName="text-slate-400"
                  valueClassName="text-slate-900"
                />
              </div>
            )}

            {(facets ?? []).length > 0 && (
              <div className="rounded-md border border-slate-200 bg-white p-4 flex flex-col gap-4">
                <OptionFiltersPanel
                  facets={facets ?? []}
                  selected={optionFilters}
                  onChange={setOptionFilters}
                  accentColor={tokens.accentColor}
                  labelClassName="text-slate-400"
                  chipClassName="border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                />
              </div>
            )}
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <p className="text-sm text-slate-500">
                <span className="text-slate-900 font-semibold">{totalCount}</span> პროდუქტი
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="ძიება..."
                  className="w-full sm:w-56 rounded-md bg-white border border-slate-200 text-sm px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as ProductSortOption)}
                  className="rounded-md bg-white border border-slate-200 text-sm px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 transition-colors"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-square rounded-md" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-4 text-center">
                <p className="text-slate-400 text-sm">პროდუქტი ვერ მოიძებნა.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                  buttonClassName="btn btn-sm rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                  textClassName="text-slate-400"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
