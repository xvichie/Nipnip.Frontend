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
    <div className="bg-[#f4ede3] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <div className="mb-8 text-center">
          <p className="italic font-serif text-sm text-[#8f8274] mb-1">{t.grid.collectionEyebrow}</p>
          <h1 className="font-serif text-3xl sm:text-5xl tracking-tight text-[#2b2420]">{activeCategoryName ?? activeCollectionName ?? t.grid.allProductsTitle}</h1>
        </div>

        {displayCategories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-6 border-y border-[#2b2420]/10 mb-8">
            <Link
              href={`/products`}
              className={`text-xs uppercase tracking-widest transition-colors ${!activeCategorySlug ? 'text-[#2b2420] underline underline-offset-4' : 'text-[#8f8274] hover:text-[#2b2420] hover:underline underline-offset-4'}`}
            >
              {t.grid.allCategoriesLink}
            </Link>
            {displayCategories.map(category => (
              <Link
                key={category.id}
                href={`/products/category/${category.slug}`}
                className={`text-xs uppercase tracking-widest transition-colors ${activeCategorySlug === category.slug ? 'text-[#2b2420] underline underline-offset-4' : 'text-[#8f8274] hover:text-[#2b2420] hover:underline underline-offset-4'} ${category.isChild ? 'pl-4' : ''}`}
              >
                {getCategoryName(category, lang)}
              </Link>
            ))}
          </div>
        )}

        {bounds && (
          <div className="max-w-xs mx-auto mb-10">
            <PriceRangeFilter
              min={bounds[0]}
              max={bounds[1]}
              value={priceRangeInput ?? bounds}
              onChange={setPriceRange}
              accentColor={tokens.accentColor}
              t={t}
              trackColorClassName="bg-[#2b2420]/10"
              labelClassName="text-[#8f8274]"
              valueClassName="text-[#2b2420]"
            />
          </div>
        )}

        {(facets ?? []).length > 0 && (
          <div className="max-w-2xl mx-auto mb-10 flex flex-col items-center gap-6">
            <OptionFiltersPanel
              facets={facets ?? []}
              selected={optionFilters}
              onChange={setOptionFilters}
              accentColor={tokens.accentColor}
              labelClassName="text-[#8f8274] text-center"
              chipClassName="border-[#2b2420]/15 bg-transparent text-[#2b2420]/70 hover:border-[#2b2420]/40"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <p className="text-sm text-[#8f8274] flex items-center gap-2">
            <span className="text-[#2b2420] font-medium">{totalCount}</span> {t.grid.unitProduct}
            {isRefetching && (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-current/20 border-t-current animate-spin opacity-50" aria-hidden />
            )}
          </p>
          <div className="flex items-center gap-6">
            {tokens.searchBarLocation !== 'header' && (
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={t.grid.searchPlaceholder}
                className="w-full sm:w-56 bg-transparent border-b border-[#2b2420]/20 text-sm px-0 py-2 text-[#2b2420] placeholder:text-[#8f8274] focus:outline-none focus:border-[#2b2420] transition-colors"
              />
            )}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as ProductSortOption)}
              className="bg-transparent underline underline-offset-4 text-sm px-0 py-2 text-[#2b2420] focus:outline-none"
            >
              {getSortOptions(t).map(opt => (
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
            <p className="text-[#8f8274] text-sm">{t.grid.noProductsFound}</p>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-8 transition-opacity ${isRefetching ? 'opacity-50' : ''}`}>
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
              buttonClassName="btn btn-sm bg-transparent border border-[#2b2420]/10 text-[#8f8274] hover:text-[#2b2420] disabled:opacity-30"
              textClassName="text-[#8f8274]"
            />
          </>
        )}
      </div>
    </div>
  )
}
