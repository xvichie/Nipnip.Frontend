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
import { getCategoryName } from '@/lib/store/translations'
import type { CategoryResponse, CollectionResponse, ThemeConfig } from '@/lib/types/storefront'
import { useStorefrontLanguage } from '@/components/storefront/shared/StorefrontLanguageProvider'

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24">
      <div className="mb-8 pb-6 border-b border-[#e5e5e5]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999] mb-1">{t.grid.collectionEyebrow}</p>
        <h1 className="font-black text-3xl text-[#111] tracking-tight">{activeCategoryName ?? activeCollectionName ?? t.grid.allProductsTitle}</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-10">

        <aside className="w-full md:w-48 shrink-0 flex flex-col gap-8 md:sticky md:top-14 md:self-start md:max-h-[calc(100vh-4.5rem)] md:overflow-y-auto md:pb-6">
          {displayCategories.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-3">{t.header.categories}</p>
              <ul className="flex flex-col">
                <li>
                  <Link
                    href={`/products`}
                    className={[
                      'flex items-center py-1.5 text-sm transition-colors border-b border-[#f0f0f0]',
                      !activeCategorySlug ? 'text-[#111] font-semibold' : 'text-[#666] hover:text-[#111]',
                    ].join(' ')}
                  >
                    {t.grid.allCategoriesLink}
                  </Link>
                </li>
                {displayCategories.map(category => (
                  <li key={category.id}>
                    <Link
                      href={`/products/category/${category.slug}`}
                      className={[
                        'flex items-center py-1.5 text-sm transition-colors border-b border-[#f0f0f0]',
                        activeCategorySlug === category.slug ? 'text-[#111] font-semibold' : 'text-[#666] hover:text-[#111]',
                        category.isChild ? 'pl-4' : '',
                      ].join(' ')}
                    >
                      {getCategoryName(category, lang)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bounds && (
            <PriceRangeFilter
              min={bounds[0]}
              max={bounds[1]}
              value={effectiveRange ?? bounds}
              onChange={setPriceRange}
              accentColor={tokens.accentColor}
              t={t}
              trackColorClassName="bg-[#e5e5e5]"
              labelClassName="text-[#999]"
              valueClassName="text-[#111]"
            />
          )}

          <OptionFiltersPanel
            facets={facets ?? []}
            selected={optionFilters}
            onChange={setOptionFilters}
            accentColor={tokens.accentColor}
            labelClassName="text-[#999]"
            chipClassName="border-[#e5e5e5] text-[#555] hover:border-[#111]"
          />
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-[#e5e5e5]">
            <p className="text-sm text-[#666]">
              <span className="text-[#111] font-semibold">{totalCount}</span> {t.grid.unitProduct}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={t.grid.searchPlaceholder}
                className="w-full sm:w-56 border border-[#e5e5e5] text-sm px-3 py-2 text-[#111] placeholder:text-[#999] focus:outline-none focus:border-[#111] transition-colors"
              />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as ProductSortOption)}
                className="w-full sm:w-auto shrink-0 border border-[#e5e5e5] text-sm px-3 py-2 text-[#111] focus:outline-none focus:border-[#111] transition-colors bg-white"
              >
                {getSortOptions(t).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-32 flex flex-col items-center gap-4 text-center">
              <p className="text-[#999] text-sm">{t.grid.noProductsFound}</p>
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
                    t={t}
                  />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
                t={t}
                buttonClassName="btn btn-sm bg-white border border-[#e5e5e5] text-[#555] hover:text-[#111] disabled:opacity-30"
                textClassName="text-[#999]"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
