import type { CategoryResponse } from '@/lib/types/storefront'

export const SALE_CATEGORY_SLUG = 'sale'

export const SALE_CATEGORY: CategoryResponse = {
  id: 'sale',
  parentCategoryId: null,
  name: 'ფასდაკლებული',
  slug: SALE_CATEGORY_SLUG,
  iconUrl: null,
  iconKey: null,
  iconEmoji: '🏷️',
}

export function withSaleCategory(categories: CategoryResponse[], enabled: boolean, showIcon = true): CategoryResponse[] {
  if (!enabled) return categories
  return [...categories, showIcon ? SALE_CATEGORY : { ...SALE_CATEGORY, iconEmoji: null }]
}
