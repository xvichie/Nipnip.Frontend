import { cookies } from 'next/headers'
import { STOREFRONT_LANG_COOKIE, STOREFRONT_STRINGS, type StorefrontLanguage, type StorefrontStrings } from '@/lib/storefront-i18n'

function parseStorefrontLanguage(raw: string | undefined, fallback: StorefrontLanguage): StorefrontLanguage {
  return raw === 'en' || raw === 'ru' || raw === 'ka' ? raw : fallback
}

// Server Components (layout.tsx and every resolver page) call this directly and pass the
// result down as an explicit `t`/`lang` prop — mirrors how `tokens` already flows through the
// storefront render tree, and sidesteps needing every Server Component to be a Client Component
// just to read a cookie. Split into its own module (rather than living in lib/storefront-i18n.ts
// alongside the types/data) because `next/headers` can't be pulled into a Client Component's
// bundle — and StorefrontLanguageProvider.tsx imports that module for its client-safe exports.
//
// `fallback` is the store's own configured default language (ThemeConfig.defaultLanguage) —
// callers that already have the store in hand should pass it through so a first-time visitor
// (no nn_store_lang cookie yet) sees the merchant's chosen default instead of always Georgian.
export async function getStorefrontLanguage(fallback: StorefrontLanguage = 'ka'): Promise<StorefrontLanguage> {
  const store = await cookies()
  return parseStorefrontLanguage(store.get(STOREFRONT_LANG_COOKIE)?.value, fallback)
}

export async function getStorefrontStrings(fallback: StorefrontLanguage = 'ka'): Promise<StorefrontStrings> {
  return STOREFRONT_STRINGS[await getStorefrontLanguage(fallback)]
}
