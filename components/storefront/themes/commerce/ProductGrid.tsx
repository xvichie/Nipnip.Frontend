'use client'

import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { PriceRangeFilter } from '@/components/storefront/shared/PriceRangeFilter'
import { OptionFiltersPanel } from '@/components/storefront/shared/OptionFiltersPanel'
import { Pagination } from '@/components/storefront/shared/Pagination'
import { useProductFacets, useProductPriceRange, useProducts } from '@/lib/queries/storefront'
import { getSortOptions, padPriceBounds, sortOptionToQuery, type ProductSortOption } from '@/lib/store/product-search'
import { useProductListUrlState } from '@/lib/store/use-product-list-url-state'
import { getSidebarCategories } from '@/lib/store/nav-menu'
import type { CategoryResponse, CollectionResponse, ThemeConfig } from '@/lib/types/storefront'
import { useStorefrontLanguage } from '@/components/storefront/shared/StorefrontLanguageProvider'
import { getCategoryName } from '@/lib/store/translations'

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
  const { t, lang } = useStorefrontLanguage()
  const categoryNames = new Map(categories.map(c => [c.id, getCategoryName(c, lang)]))
  const displayCategories = getSidebarCategories(categories, tokens)
  const activeCategory = activeCategorySlug ? displayCategories.find(c => c.slug === activeCategorySlug) : undefined
  const activeCategoryName = activeCategory ? getCategoryName(activeCategory, lang) : undefined
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
    priceRangeInput,
    setPriceRange,
    optionFilters,
    setOptionFilters,
  } = useProductListUrlState()

  const { data: rawBounds } = useProductPriceRange(slug, activeCategorySlug)
  const bounds = rawBounds ? padPriceBounds(rawBounds.min, rawBounds.max) : null
  const effectiveRange = priceRange ?? bounds
  const { data: facets } = useProductFacets(slug, activeCategorySlug)

  const { data, isLoading, isFetching } = useProducts(slug, {
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
  // isLoading only covers the very first fetch (placeholderData keeps the previous page's
  // results on screen during a refetch) — isRefetching is what tells us a filter change is
  // in flight so the grid can show that without swapping back to the skeleton.
  const isRefetching = isFetching && !isLoading

  const products = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{t.grid.collectionEyebrow}</p>
          <h1 className="flex items-center gap-2 font-black text-3xl text-slate-900 tracking-tight">
            <span className="inline-block w-1.5 h-1.5 shrink-0" style={{ backgroundColor: tokens.accentColor }} aria-hidden />
            {activeCategoryName ?? activeCollectionName ?? t.grid.allProductsTitle}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          <aside className="w-full md:w-56 shrink-0 flex flex-col gap-4 md:sticky md:top-14 md:self-start md:max-h-[calc(100vh-4.5rem)] md:overflow-y-auto md:pb-6">
            {displayCategories.length > 0 && (
              <div className="rounded-md border border-slate-200 bg-white p-4 flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{t.header.categories}</p>
                <Link
                  href={`/products`}
                  className={[
                    'rounded-md px-3 py-2 text-sm transition-colors',
                    !activeCategorySlug ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {t.grid.allCategoriesLink}
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
                    {getCategoryName(category, lang)}
                  </Link>
                ))}
              </div>
            )}

            {bounds && (
              <div className="rounded-md border border-slate-200 bg-white p-4">
                <PriceRangeFilter
                  min={bounds[0]}
                  max={bounds[1]}
                  value={priceRangeInput ?? bounds}
                  onChange={setPriceRange}
                  accentColor={tokens.accentColor}
                  t={t}
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
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <span className="text-slate-900 font-semibold">{totalCount}</span> {t.grid.unitProduct}
                {isRefetching && (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-current/20 border-t-current animate-spin opacity-50" aria-hidden />
                )}
              </p>
              <div className="flex items-center gap-3">
                {tokens.searchBarLocation !== 'header' && (
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder={t.grid.searchPlaceholder}
                    className="w-full sm:w-56 rounded-md bg-white border border-slate-200 text-sm px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                  />
                )}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as ProductSortOption)}
                  className="rounded-md bg-white border border-slate-200 text-sm px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 transition-colors"
                >
                  {getSortOptions(t).map(opt => (
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
                <p className="text-slate-400 text-sm">{t.grid.noProductsFound}</p>
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 transition-opacity ${isRefetching ? 'opacity-50' : ''}`}>
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      slug={slug}
                      product={product}
                      categoryName={product.categoryId ? categoryNames.get(product.categoryId) : undefined}
                      tokens={tokens}
                      t={t}
                      lang={lang}
                    />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                  t={t}
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
