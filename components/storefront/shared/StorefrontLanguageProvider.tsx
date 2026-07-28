'use client'

import { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { STOREFRONT_LANG_COOKIE, STOREFRONT_STRINGS, type StorefrontLanguage, type StorefrontStrings } from '@/lib/storefront-i18n'

const STOREFRONT_LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

type StorefrontLanguageContextValue = {
  lang: StorefrontLanguage
  t: StorefrontStrings
  setLang: (lang: StorefrontLanguage) => void
}

const StorefrontLanguageContext = createContext<StorefrontLanguageContextValue | null>(null)

// Seeded with `initialLang`, resolved server-side (from the same cookie) by app/store/[slug]/layout.tsx,
// so the first client render already matches what was server-rendered — no language flash on load.
export function StorefrontLanguageProvider({
  initialLang,
  children,
}: {
  initialLang: StorefrontLanguage
  children: React.ReactNode
}) {
  const [lang, setLangState] = useState<StorefrontLanguage>(initialLang)
  const router = useRouter()

  function setLang(next: StorefrontLanguage) {
    setLangState(next)
    // Not httpOnly (mirrors the nn_ref_* cookie precedent in middleware.ts) since this write
    // itself happens client-side.
    document.cookie = `${STOREFRONT_LANG_COOKIE}=${next}; path=/; max-age=${STOREFRONT_LANG_COOKIE_MAX_AGE}; samesite=lax`
    // Server Components (Home, Footer, ProductCard, etc.) resolved `t` from the cookie at
    // request time — refresh() re-fetches them so they pick up the new language too, without a
    // full page reload.
    router.refresh()
  }

  return (
    <StorefrontLanguageContext.Provider value={{ lang, t: STOREFRONT_STRINGS[lang], setLang }}>
      {children}
    </StorefrontLanguageContext.Provider>
  )
}

export function useStorefrontLanguage() {
  const ctx = useContext(StorefrontLanguageContext)
  if (!ctx) throw new Error('useStorefrontLanguage must be used inside StorefrontLanguageProvider')
  return ctx
}
