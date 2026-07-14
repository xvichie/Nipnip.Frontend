import type { Metadata } from 'next'
import { apiFetch } from '@/lib/api'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { isThemeId } from '@/lib/storefront-themes'
import { ContactPage } from '@/components/storefront/shared/ContactPage'
import { buildBreadcrumbJsonLd, getStoreUrl, truncateDescription } from '@/lib/store/seo'
import { JsonLd } from '@/components/storefront/shared/JsonLd'
import type { StoreResponse, ThemeId } from '@/lib/types/storefront'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)
  const tokens = parseThemeConfig(store.themeConfig)
  const label = tokens.contactLabel

  const contactBits = [tokens.contactAddress, tokens.contactPhone, tokens.contactEmail].filter(Boolean)
  const description = truncateDescription(
    contactBits.length > 0
      ? `დაუკავშირდით ${store.name}-ს — ${contactBits.join(', ')}.`
      : `${store.name}-ის საკონტაქტო ინფორმაცია.`
  )

  return {
    title: label,
    description,
    alternates: { canonical: getStoreUrl(slug, '/contact') },
  }
}

export default async function StoreContactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const tokens = parseThemeConfig(store.themeConfig)

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: store.name, url: getStoreUrl(slug) },
        { name: tokens.contactLabel, url: getStoreUrl(slug, '/contact') },
      ])} />
      <ContactPage slug={slug} storeName={store.name} themeId={themeId} tokens={tokens} />
    </>
  )
}
