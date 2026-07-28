'use client'

import { use } from 'react'
import { useStore } from '@/lib/queries/storefront'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { isThemeId } from '@/lib/storefront-themes'
import { BundleList } from '@/components/storefront/shared/BundleList'
import { useStorefrontLanguage } from '@/components/storefront/shared/StorefrontLanguageProvider'
import type { ThemeId } from '@/lib/types/storefront'

export default function BundlesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: store, isLoading } = useStore(slug)
  const { t } = useStorefrontLanguage()

  if (isLoading || !store) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">{t.cart.loading}</div>
  }

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const tokens = parseThemeConfig(store.themeConfig)

  return <BundleList slug={slug} themeId={themeId} tokens={tokens} t={t} />
}
