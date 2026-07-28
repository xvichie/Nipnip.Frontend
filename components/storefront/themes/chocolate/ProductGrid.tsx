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
    <div className="bg-[#f7ede0] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#b5651d] mb-2">{t.grid.collectionEyebrow}</p>
          <h1 className="font-serif text-3xl text-[#3b2418]">{activeCategoryName ?? activeCollectionName ?? t.grid.allProductsTitle}</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-10">

          <aside className="w-full md:w-52 shrink-0 flex flex-col gap-4 md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-6rem)] md:overflow-y-auto md:pb-6">
            {displayCategories.length > 0 && (
              <div className="border border-[#3b2418]/10 p-5 flex flex-col gap-1">
                <p className="text-xs uppercase tracking-widest text-[#a68a6d] mb-2">{t.header.categories}</p>
                <Link
                  href={`/products`}
                  className={[
                    'px-3 py-2 text-xs uppercase tracking-widest transition-colors',
                    !activeCategorySlug ? 'text-[#3b2418] font-medium' : 'text-[#a68a6d] hover:text-[#3b2418]',
                  ].join(' ')}
                >
                  {t.grid.allCategoriesLink}
                </Link>
                {displayCategories.map(category => (
                  <Link
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    className={[
                      'py-2 text-xs uppercase tracking-widest transition-colors',
                      activeCategorySlug === category.slug ? 'text-[#3b2418] font-medium' : 'text-[#a68a6d] hover:text-[#3b2418]',
                      category.isChild ? 'pl-6' : 'px-3',
                    ].join(' ')}
                  >
                    {getCategoryName(category, lang)}
                  </Link>
                ))}
              </div>
            )}

            {bounds && (
              <div className="border border-[#3b2418]/10 p-5">
                <PriceRangeFilter
                  min={bounds[0]}
                  max={bounds[1]}
                  value={effectiveRange ?? bounds}
                  onChange={setPriceRange}
                  accentColor={tokens.accentColor}
                  t={t}
                  trackColorClassName="bg-[#3b2418]/10"
                  labelClassName="text-[#a68a6d]"
                  valueClassName="text-[#3b2418]"
                />
              </div>
            )}

            {(facets ?? []).length > 0 && (
              <div className="border border-[#3b2418]/10 p-5 flex flex-col gap-5">
                <OptionFiltersPanel
                  facets={facets ?? []}
                  selected={optionFilters}
                  onChange={setOptionFilters}
                  accentColor={tokens.accentColor}
                  labelClassName="text-[#a68a6d]"
                  chipClassName="border-[#3b2418]/15 bg-white text-[#3b2418]/70 hover:border-[#3b2418]/40"
                />
              </div>
            )}
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-xs uppercase tracking-widest text-[#a68a6d]">
                <span className="text-[#3b2418] font-medium">{totalCount}</span> {t.grid.unitProduct}
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={t.grid.searchPlaceholder}
                  className="w-full sm:w-56 bg-white border border-[#3b2418]/15 text-sm px-3 py-2 text-[#3b2418] placeholder:text-[#a68a6d] focus:outline-none focus:border-[#3b2418] transition-colors"
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as ProductSortOption)}
                  className="bg-white border border-[#3b2418]/15 text-sm px-3 py-2 text-[#3b2418] focus:outline-none focus:border-[#3b2418] transition-colors"
                >
                  {getSortOptions(t).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-[4/5]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-4 text-center">
                <p className="text-[#a68a6d] text-sm">{t.grid.noProductsFound}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  buttonClassName="btn btn-sm bg-white border border-[#3b2418]/15 text-[#3b2418]/60 hover:text-[#3b2418] disabled:opacity-30"
                  textClassName="text-[#a68a6d]"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
