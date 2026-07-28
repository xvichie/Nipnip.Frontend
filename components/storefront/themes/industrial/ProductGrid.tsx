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
    <div className="bg-[#1c1c1c] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8a8a86] mb-2">{t.grid.collectionEyebrow}</p>
          <h1 className="flex items-center gap-2 font-black text-3xl text-[#f2f2f0] tracking-tight">
            <span className="inline-block w-1.5 h-1.5 shrink-0" style={{ backgroundColor: tokens.accentColor }} aria-hidden />
            {activeCategoryName ?? activeCollectionName ?? t.grid.allProductsTitle}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          <aside className="w-full md:w-56 shrink-0 flex flex-col gap-4 md:sticky md:top-14 md:self-start md:max-h-[calc(100vh-4.5rem)] md:overflow-y-auto md:pb-6">
            {displayCategories.length > 0 && (
              <div className="border border-[#3a3a38] bg-[#242422] p-4 flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6f6f6b] mb-2">{t.header.categories}</p>
                <Link
                  href={`/products`}
                  className={[
                    'px-3 py-2 text-sm transition-colors',
                    !activeCategorySlug ? 'bg-[#3a3a38] text-[#f2f2f0] font-semibold' : 'text-[#b5b5b0] hover:bg-[#2f2f2d]',
                  ].join(' ')}
                >
                  {t.grid.allCategoriesLink}
                </Link>
                {displayCategories.map(category => (
                  <Link
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    className={[
                      'py-2 text-sm transition-colors',
                      activeCategorySlug === category.slug ? 'bg-[#3a3a38] text-[#f2f2f0] font-semibold' : 'text-[#b5b5b0] hover:bg-[#2f2f2d]',
                      category.isChild ? 'pl-6' : 'px-3',
                    ].join(' ')}
                  >
                    {getCategoryName(category, lang)}
                  </Link>
                ))}
              </div>
            )}

            {bounds && (
              <div className="border border-[#3a3a38] bg-[#242422] p-4">
                <PriceRangeFilter
                  min={bounds[0]}
                  max={bounds[1]}
                  value={effectiveRange ?? bounds}
                  onChange={setPriceRange}
                  accentColor={tokens.accentColor}
                  t={t}
                  trackColorClassName="bg-[#3a3a38]"
                  labelClassName="text-[#6f6f6b]"
                  valueClassName="text-[#f2f2f0]"
                />
              </div>
            )}

            {(facets ?? []).length > 0 && (
              <div className="border border-[#3a3a38] bg-[#242422] p-4 flex flex-col gap-4">
                <OptionFiltersPanel
                  facets={facets ?? []}
                  selected={optionFilters}
                  onChange={setOptionFilters}
                  accentColor={tokens.accentColor}
                  labelClassName="text-[#6f6f6b]"
                  chipClassName="border-[#3a3a38] bg-[#242422] text-[#b5b5b0] hover:bg-[#2f2f2d]"
                />
              </div>
            )}
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm text-[#8a8a86]">
                <span className="text-[#f2f2f0] font-semibold">{totalCount}</span> {t.grid.unitProduct}
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={t.grid.searchPlaceholder}
                  className="w-full sm:w-56 bg-[#242422] border border-[#3a3a38] text-sm px-3 py-2 text-[#f2f2f0] placeholder:text-[#6f6f6b] focus:outline-none focus:border-[#54544e] transition-colors"
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as ProductSortOption)}
                  className="bg-[#242422] border border-[#3a3a38] text-sm px-3 py-2 text-[#f2f2f0] focus:outline-none focus:border-[#54544e] transition-colors"
                >
                  {getSortOptions(t).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-square" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-4 text-center">
                <p className="text-[#6f6f6b] text-sm">{t.grid.noProductsFound}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
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
                  buttonClassName="btn btn-sm bg-[#242422] border border-[#3a3a38] text-[#8a8a86] hover:text-[#f2f2f0] disabled:opacity-30"
                  textClassName="text-[#6f6f6b]"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
