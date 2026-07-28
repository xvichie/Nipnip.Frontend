import type { CategoryResponse } from '@/lib/types/storefront'

export const SALE_CATEGORY_SLUG = 'sale'

export const SALE_CATEGORY: CategoryResponse = {
  id: 'sale',
  parentCategoryId: null,
  name: 'ფასდაკლებული',
  nameKa: 'ფასდაკლებული',
  nameEn: 'On Sale',
  nameRu: 'Со скидкой',
  slug: SALE_CATEGORY_SLUG,
  iconUrl: null,
  iconKey: null,
  iconEmoji: '🏷️',
  defaultOptions: '[]',
}

export function withSaleCategory(categories: CategoryResponse[], enabled: boolean, showIcon = true): CategoryResponse[] {
  if (!enabled) return categories
  return [...categories, showIcon ? SALE_CATEGORY : { ...SALE_CATEGORY, iconEmoji: null }]
}
