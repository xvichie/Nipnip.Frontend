import type { CategoryResponse, StorePageResponse, ThemeConfig } from '@/lib/types/storefront'
import { withSaleCategory } from './sale-category'

export interface NavCategory extends CategoryResponse {
  /** True for a subcategory rendered directly under its parent — nav components use this to indent it. */
  isChild: boolean
}

// Groups top-level categories with their children immediately following them, so callers can
// render the result as-is with a single .map(), indenting entries where isChild is true, instead
// of needing to build/render a tree themselves.
function groupByParent(topLevel: CategoryResponse[], all: CategoryResponse[]): NavCategory[] {
  const result: NavCategory[] = []
  for (const parent of topLevel) {
    result.push({ ...parent, isChild: false })
    for (const child of all.filter(c => c.parentCategoryId === parent.id)) {
      result.push({ ...child, isChild: true })
    }
  }
  return result
}

export function getNavCategories(categories: CategoryResponse[], tokens: Required<ThemeConfig>): NavCategory[] {
  let topLevel = withSaleCategory(categories.filter(c => !c.parentCategoryId), tokens.showSaleCategory)
  if (tokens.categoryMenuScope === 'selected') {
    const selected = new Set(tokens.categoryMenuSelectedIds)
    topLevel = topLevel.filter(c => selected.has(c.id))
  }
  return groupByParent(topLevel, categories)
}

// Used by the product-listing sidebar, which always shows every category regardless of the
// nav menu's own selected-categories scope.
export function getSidebarCategories(categories: CategoryResponse[], tokens: Required<ThemeConfig>): NavCategory[] {
  const topLevel = withSaleCategory(categories.filter(c => !c.parentCategoryId), tokens.showSaleCategory)
  return groupByParent(topLevel, categories)
}

export function getNavPages(pages: StorePageResponse[], tokens: Required<ThemeConfig>): StorePageResponse[] {
  if (tokens.navPageIds.length === 0) return []
  const byId = new Map(pages.map(p => [p.id, p]))
  return tokens.navPageIds
    .map(id => byId.get(id))
    .filter((p): p is StorePageResponse => !!p)
}
