import { cookies } from 'next/headers'
import { STOREFRONT_LANG_COOKIE, STOREFRONT_STRINGS, type StorefrontLanguage, type StorefrontStrings } from '@/lib/storefront-i18n'

function parseStorefrontLanguage(raw: string | undefined): StorefrontLanguage {
  return raw === 'en' || raw === 'ru' ? raw : 'ka'
}

// Server Components (layout.tsx and every resolver page) call this directly and pass the
// result down as an explicit `t`/`lang` prop — mirrors how `tokens` already flows through the
// storefront render tree, and sidesteps needing every Server Component to be a Client Component
// just to read a cookie. Split into its own module (rather than living in lib/storefront-i18n.ts
// alongside the types/data) because `next/headers` can't be pulled into a Client Component's
// bundle — and StorefrontLanguageProvider.tsx imports that module for its client-safe exports.
export async function getStorefrontLanguage(): Promise<StorefrontLanguage> {
  const store = await cookies()
  return parseStorefrontLanguage(store.get(STOREFRONT_LANG_COOKIE)?.value)
}

export async function getStorefrontStrings(): Promise<StorefrontStrings> {
  return STOREFRONT_STRINGS[await getStorefrontLanguage()]
}
