import type { StorefrontLanguage } from '@/lib/storefront-i18n'
import type { ThemeConfig, TranslatableThemeText } from '@/lib/types/storefront'
import { stripHtml } from '@/lib/html'

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

export function getCollectionName(
  collection: { name: string; nameEn?: string | null; nameRu?: string | null },
  lang: StorefrontLanguage
): string {
  if (lang === 'en' && collection.nameEn) return collection.nameEn
  if (lang === 'ru' && collection.nameRu) return collection.nameRu
  return collection.name
}

export function getBundleName(
  bundle: { name: string; nameEn?: string | null; nameRu?: string | null },
  lang: StorefrontLanguage
): string {
  if (lang === 'en' && bundle.nameEn) return bundle.nameEn
  if (lang === 'ru' && bundle.nameRu) return bundle.nameRu
  return bundle.name
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

// Page title/content are authored as rich-text HTML (Tiptap, in the merchant dashboard) — these
// two return plain text, stripped of markup, for every context that reuses them as a label rather
// than rendering them as markup (nav menu links, the browser <title> tag, JSON-LD breadcrumbs,
// meta descriptions, the admin pages list). Use getPageTitleHtml/getPageContentHtml instead
// wherever the actual formatted page is rendered.
export function getPageTitle(
  page: { title: string; titleEn?: string | null; titleRu?: string | null },
  lang: StorefrontLanguage
): string {
  return stripHtml(getPageTitleHtml(page, lang))
}

export function getPageContent(
  page: { content: string; contentEn?: string | null; contentRu?: string | null },
  lang: StorefrontLanguage
): string {
  return stripHtml(getPageContentHtml(page, lang))
}

export function getPageTitleHtml(
  page: { title: string; titleEn?: string | null; titleRu?: string | null },
  lang: StorefrontLanguage
): string {
  if (lang === 'en' && page.titleEn) return page.titleEn
  if (lang === 'ru' && page.titleRu) return page.titleRu
  return page.title
}

export function getPageContentHtml(
  page: { content: string; contentEn?: string | null; contentRu?: string | null },
  lang: StorefrontLanguage
): string {
  if (lang === 'en' && page.contentEn) return page.contentEn
  if (lang === 'ru' && page.contentRu) return page.contentRu
  return page.content
}

// ThemeConfig's free-text fields (hero, content block, FAQ, footer, checkout, etc.) don't get
// a NameKa/En/Ru column split like categories/products — ThemeConfig is an opaque JSON blob the
// backend never migrates. Instead every translatable field keeps its existing single value as
// the base/default-language content, and `tokens.translations.en`/`.ru` layer optional overrides
// on top — same fallback shape as everywhere else, just sourced from a sidecar object instead of
// sibling columns. Use this for any scalar item-level translated field (hero slide text, FAQ
// question/answer, footer link labels, shipping zone names, trust badges, ...).
export function resolveThemeText(
  base: string | null | undefined,
  en: string | null | undefined,
  ru: string | null | undefined,
  lang: StorefrontLanguage
): string {
  if (lang === 'en' && en) return en
  if (lang === 'ru' && ru) return ru
  return base ?? ''
}

// Convenience wrapper for the ~25 top-level ThemeConfig scalar fields that share the
// `tokens.translations.en/ru[field]` sidecar shape (see TranslatableThemeText).
export function getThemeText(
  tokens: Required<ThemeConfig>,
  field: keyof TranslatableThemeText,
  lang: StorefrontLanguage
): string {
  const base = tokens[field]
  return resolveThemeText(
    typeof base === 'string' ? base : '',
    tokens.translations.en?.[field],
    tokens.translations.ru?.[field],
    lang
  )
}

export function getTrustBadgeText(
  badge: { text: string; translations?: { en?: string; ru?: string } },
  lang: StorefrontLanguage
): string {
  return resolveThemeText(badge.text, badge.translations?.en, badge.translations?.ru, lang)
}

// Falls back to the collection's own (already-translated) name when no override is set for
// this collection id, or when the override exists but resolves to an empty string.
export function getCollectionTitleOverride(
  override: { value: string; translations?: { en?: string; ru?: string } } | undefined,
  fallbackName: string,
  lang: StorefrontLanguage
): string {
  if (!override) return fallbackName
  return resolveThemeText(override.value, override.translations?.en, override.translations?.ru, lang) || fallbackName
}
