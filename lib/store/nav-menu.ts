import type { CategoryResponse, StorePageResponse, ThemeConfig } from '@/lib/types/storefront'
import { withSaleCategory } from './sale-category'

export function getNavCategories(categories: CategoryResponse[], tokens: Required<ThemeConfig>): CategoryResponse[] {
  const topLevel = withSaleCategory(categories.filter(c => !c.parentCategoryId), tokens.showSaleCategory)
  if (tokens.categoryMenuScope === 'selected') {
    const selected = new Set(tokens.categoryMenuSelectedIds)
    return topLevel.filter(c => selected.has(c.id))
  }
  return topLevel
}

export function getNavPages(pages: StorePageResponse[], tokens: Required<ThemeConfig>): StorePageResponse[] {
  if (tokens.navPageIds.length === 0) return []
  const byId = new Map(pages.map(p => [p.id, p]))
  return tokens.navPageIds
    .map(id => byId.get(id))
    .filter((p): p is StorePageResponse => !!p)
}
