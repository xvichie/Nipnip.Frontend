'use client'

import { use } from 'react'
import { useStore, usePages } from '@/lib/queries/storefront'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { isThemeId } from '@/lib/storefront-themes'
import { Checkout } from '@/components/storefront/shared/Checkout'
import type { ThemeId } from '@/lib/types/storefront'

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: store, isLoading } = useStore(slug)
  const { data: pages } = usePages(slug)

  if (isLoading || !store) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>
  }

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const tokens = parseThemeConfig(store.themeConfig)

  return <Checkout slug={slug} themeId={themeId} tokens={tokens} pages={pages ?? []} />
}
