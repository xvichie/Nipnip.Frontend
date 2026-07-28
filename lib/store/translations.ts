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

export function getProductName(
  product: { name: string; nameEn?: string | null; nameRu?: string | null },
  lang: StorefrontLanguage
): string {
  if (lang === 'en' && product.nameEn) return product.nameEn
  if (lang === 'ru' && product.nameRu) return product.nameRu
  return product.name
}

export function getProductDescription(
  product: { description: string | null; descriptionEn?: string | null; descriptionRu?: string | null },
  lang: StorefrontLanguage
): string | null {
  if (lang === 'en' && product.descriptionEn) return product.descriptionEn
  if (lang === 'ru' && product.descriptionRu) return product.descriptionRu
  return product.description
}

export function getOptionName(
  option: { name: string; nameEn?: string | null; nameRu?: string | null },
  lang: StorefrontLanguage
): string {
  if (lang === 'en' && option.nameEn) return option.nameEn
  if (lang === 'ru' && option.nameRu) return option.nameRu
  return option.name
}

export function getOptionValueName(
  value: { value: string; valueEn?: string | null; valueRu?: string | null },
  lang: StorefrontLanguage
): string {
  if (lang === 'en' && value.valueEn) return value.valueEn
  if (lang === 'ru' && value.valueRu) return value.valueRu
  return value.value
}
