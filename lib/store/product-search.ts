import type { StorefrontStrings } from '@/lib/storefront-i18n'

export type ProductSortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'

export function getSortOptions(t: StorefrontStrings): { value: ProductSortOption; label: string }[] {
  return [
    { value: 'featured', label: t.grid.sortFeatured },
    { value: 'price-asc', label: t.grid.sortPriceAsc },
    { value: 'price-desc', label: t.grid.sortPriceDesc },
    { value: 'name-asc', label: t.grid.sortNameAsc },
    { value: 'name-desc', label: t.grid.sortNameDesc },
  ]
}

export function sortOptionToQuery(sortBy: ProductSortOption): { sortBy?: string; sortDir?: string } {
  switch (sortBy) {
    case 'price-asc': return { sortBy: 'price', sortDir: 'asc' }
    case 'price-desc': return { sortBy: 'price', sortDir: 'desc' }
    case 'name-asc': return { sortBy: 'name', sortDir: 'asc' }
    case 'name-desc': return { sortBy: 'name', sortDir: 'desc' }
    default: return {}
  }
}

export function padPriceBounds(min: number, max: number): [number, number] {
  // A single product (or several at the same price) would otherwise collapse
  // the range to a single point, which hides the slider entirely — pad it
  // so the filter stays visible and usable even with minimal catalog data.
  return max > min ? [min, max] : [min, min + Math.max(10, Math.ceil(min * 0.2))]
}
