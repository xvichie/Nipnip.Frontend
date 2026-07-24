import type { CollectionResponse, ThemeConfig } from '@/lib/types/storefront'

export function getLandingCollections(collections: CollectionResponse[], tokens: Required<ThemeConfig>): CollectionResponse[] {
  if (!tokens.showLandingCollections) return []

  const base = tokens.landingCollectionScope === 'selected'
    ? collections.filter(c => tokens.landingCollectionSelectedIds.includes(c.id))
    : collections

  const order = tokens.landingCollectionOrder.filter(id => base.some(c => c.id === id))
  const ordered = order.map(id => base.find(c => c.id === id)!)
  const unordered = base.filter(c => !order.includes(c.id))
  // Newly-created collections not yet placed in landingCollectionOrder just append at the end.
  return [...ordered, ...unordered]
}
