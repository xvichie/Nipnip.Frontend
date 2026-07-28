import type { StorefrontLanguage } from '@/lib/storefront-i18n'

// Every translatable entity follows the same shape: a resolved `name` (the backend's ka -> en ->
// ru fallback, always non-empty) plus optional per-language overrides. A resolver like this one
// is what future entities (products, collections, pages) will replicate.
export function getCategoryName(
  category: { name: string; nameEn?: string | null; nameRu?: string | null },
  lang: StorefrontLanguage
): string {
  if (lang === 'en' && category.nameEn) return category.nameEn
  if (lang === 'ru' && category.nameRu) return category.nameRu
  return category.name
}
