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
    <div className="bg-[#faf7f2] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9c7a4a] mb-2">{t.grid.collectionEyebrow}</p>
          <h1 className="font-serif text-3xl text-[#1c1a17]">{activeCategoryName ?? activeCollectionName ?? t.grid.allProductsTitle}</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-10">

          <aside className="w-full md:w-52 shrink-0 flex flex-col gap-4 md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-6rem)] md:overflow-y-auto md:pb-6">
            {displayCategories.length > 0 && (
              <div className="border border-[#1c1a17]/10 p-5 flex flex-col gap-1">
                <p className="text-xs uppercase tracking-widest text-[#9c8f7e] mb-2">{t.header.categories}</p>
                <Link
                  href={`/products`}
                  className={[
                    'px-3 py-2 text-xs uppercase tracking-widest transition-colors',
                    !activeCategorySlug ? 'text-[#1c1a17] font-medium' : 'text-[#9c8f7e] hover:text-[#1c1a17]',
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
                      activeCategorySlug === category.slug ? 'text-[#1c1a17] font-medium' : 'text-[#9c8f7e] hover:text-[#1c1a17]',
                      category.isChild ? 'pl-6' : 'px-3',
                    ].join(' ')}
                  >
                    {getCategoryName(category, lang)}
                  </Link>
                ))}
              </div>
            )}

            {bounds && (
              <div className="border border-[#1c1a17]/10 p-5">
                <PriceRangeFilter
                  min={bounds[0]}
                  max={bounds[1]}
                  value={effectiveRange ?? bounds}
                  onChange={setPriceRange}
                  accentColor={tokens.accentColor}
                  t={t}
                  trackColorClassName="bg-[#1c1a17]/10"
                  labelClassName="text-[#9c8f7e]"
                  valueClassName="text-[#1c1a17]"
                />
              </div>
            )}

            {(facets ?? []).length > 0 && (
              <div className="border border-[#1c1a17]/10 p-5 flex flex-col gap-5">
                <OptionFiltersPanel
                  facets={facets ?? []}
                  selected={optionFilters}
                  onChange={setOptionFilters}
                  accentColor={tokens.accentColor}
                  labelClassName="text-[#9c8f7e]"
                  chipClassName="border-[#1c1a17]/15 bg-white text-[#1c1a17]/70 hover:border-[#1c1a17]/40"
                />
              </div>
            )}
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-xs uppercase tracking-widest text-[#9c8f7e]">
                <span className="text-[#1c1a17] font-medium">{totalCount}</span> {t.grid.unitProduct}
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={t.grid.searchPlaceholder}
                  className="w-full sm:w-56 bg-white border border-[#1c1a17]/15 text-sm px-3 py-2 text-[#1c1a17] placeholder:text-[#9c8f7e] focus:outline-none focus:border-[#1c1a17] transition-colors"
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as ProductSortOption)}
                  className="bg-white border border-[#1c1a17]/15 text-sm px-3 py-2 text-[#1c1a17] focus:outline-none focus:border-[#1c1a17] transition-colors"
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
                <p className="text-[#9c8f7e] text-sm">{t.grid.noProductsFound}</p>
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
                  buttonClassName="btn btn-sm bg-white border border-[#1c1a17]/15 text-[#1c1a17]/60 hover:text-[#1c1a17] disabled:opacity-30"
                  textClassName="text-[#9c8f7e]"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
