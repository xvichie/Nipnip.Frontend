import type { CategoryResponse, ThemeConfig } from '@/lib/types/storefront'
import { withSaleCategory } from './sale-category'

export function getLandingCategories(categories: CategoryResponse[], tokens: Required<ThemeConfig>): CategoryResponse[] {
  if (!tokens.showLandingCategories) return []

  const topLevel = withSaleCategory(categories.filter(c => !c.parentCategoryId), tokens.showSaleCategory, tokens.showSaleCategoryIcon)
  if (tokens.landingCategoryScope === 'selected') {
    const selected = new Set(tokens.landingCategorySelectedIds)
    return topLevel.filter(c => selected.has(c.id))
  }
  return topLevel
}
