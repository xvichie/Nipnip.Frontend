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
  const { t } = useStorefrontLanguage()
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
    <div className="bg-[#fffaf5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: tokens.accentColor }}>{t.grid.collectionEyebrow}</p>
          <h1 className="font-black text-3xl text-[#1a1a1a] tracking-tight">{activeCategoryName ?? activeCollectionName ?? t.grid.allProductsTitle}</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          <aside className="w-full md:w-52 shrink-0 flex flex-col gap-8 md:sticky md:top-16 md:self-start md:max-h-[calc(100vh-5rem)] md:overflow-y-auto md:pb-6">
            {displayCategories.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#c9b8ac] mb-1">{t.header.categories}</p>
                <Link
                  href={`/products`}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                    !activeCategorySlug ? 'text-white' : 'text-[#1a1a1a]/60 hover:bg-[#fff2ec]',
                  ].join(' ')}
                  style={!activeCategorySlug ? { backgroundColor: tokens.accentColor } : {}}
                >
                  {t.grid.allCategoriesLink}
                </Link>
                {displayCategories.map(category => (
                  <Link
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    className={[
                      'rounded-full py-2 text-sm font-bold transition-colors',
                      activeCategorySlug === category.slug ? 'text-white' : 'text-[#1a1a1a]/60 hover:bg-[#fff2ec]',
                      category.isChild ? 'pl-7 pr-4' : 'px-4',
                    ].join(' ')}
                    style={activeCategorySlug === category.slug ? { backgroundColor: tokens.accentColor } : {}}
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
                onChange={setPriceRange}
                accentColor={tokens.accentColor}
                t={t}
                trackColorClassName="bg-[#f0e4da]"
                labelClassName="text-[#c9b8ac]"
                valueClassName="text-[#1a1a1a]"
              />
            )}

            <OptionFiltersPanel
              facets={facets ?? []}
              selected={optionFilters}
              onChange={setOptionFilters}
              accentColor={tokens.accentColor}
              labelClassName="text-[#c9b8ac]"
              chipClassName="border-[#f0e4da] bg-white text-[#1a1a1a]/70 hover:bg-[#fff2ec]"
            />
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm text-[#a89a90] font-medium">
                <span className="text-[#1a1a1a] font-bold">{totalCount}</span> {t.grid.unitProduct}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={t.grid.searchPlaceholder}
                  className="w-full sm:w-56 rounded-full bg-white border border-[#f0e4da] text-sm px-4 py-2.5 text-[#1a1a1a] placeholder:text-[#c9b8ac] focus:outline-none transition-colors"
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as ProductSortOption)}
                  className="w-full sm:w-auto shrink-0 rounded-full bg-white border border-[#f0e4da] text-sm px-4 py-2.5 text-[#1a1a1a] focus:outline-none transition-colors"
                >
                  {getSortOptions(t).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-square rounded-[2rem]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-4 text-center">
                <p className="text-[#c9b8ac] text-sm">{t.grid.noProductsFound}</p>
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
                  t={t}
                  buttonClassName="btn btn-sm rounded-full bg-white border border-[#f0e4da] text-[#1a1a1a]/60 hover:text-[#1a1a1a] disabled:opacity-30"
                  textClassName="text-[#c9b8ac]"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
