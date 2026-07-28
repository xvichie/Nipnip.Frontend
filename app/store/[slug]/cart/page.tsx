'use client'

import { use } from 'react'
import { useStore } from '@/lib/queries/storefront'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { isThemeId } from '@/lib/storefront-themes'
import { Cart } from '@/components/storefront/shared/Cart'
import { useStorefrontLanguage } from '@/components/storefront/shared/StorefrontLanguageProvider'
import type { ThemeId } from '@/lib/types/storefront'

export default function CartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: store, isLoading } = useStore(slug)
  const { t, lang } = useStorefrontLanguage()

  if (isLoading || !store) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">{t.cart.loading}</div>
  }

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const tokens = parseThemeConfig(store.themeConfig)

  return <Cart slug={slug} themeId={themeId} tokens={tokens} t={t} lang={lang} />
}
