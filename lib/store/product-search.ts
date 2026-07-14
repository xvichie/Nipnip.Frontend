import type { ProductSummaryResponse } from '@/lib/types/storefront'

export type ProductSortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'

export const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: 'featured', label: 'რეკომენდებული' },
  { value: 'price-asc', label: 'ფასი: დაბლიდან მაღლა' },
  { value: 'price-desc', label: 'ფასი: მაღლიდან დაბლა' },
  { value: 'name-asc', label: 'სახელი: ა-ჰ' },
  { value: 'name-desc', label: 'სახელი: ჰ-ა' },
]

export function filterAndSortProducts(
  products: ProductSummaryResponse[],
  search: string,
  sortBy: ProductSortOption,
): ProductSummaryResponse[] {
  const query = search.trim().toLowerCase()
  const filtered = query ? products.filter(p => p.name.toLowerCase().includes(query)) : products

  if (sortBy === 'featured') return filtered

  const effectivePrice = (p: ProductSummaryResponse) => p.salePrice ?? p.basePrice
  const sorted = [...filtered]

  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b))
      break
    case 'price-desc':
      sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a))
      break
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'ka'))
      break
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name, 'ka'))
      break
  }
  return sorted
}
