import type { Metadata } from 'next'
import { apiFetch } from '@/lib/api'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { isThemeId } from '@/lib/storefront-themes'
import { ContactPage } from '@/components/storefront/shared/ContactPage'
import { buildBreadcrumbJsonLd, getStoreUrl, truncateDescription } from '@/lib/store/seo'
import { getStorefrontLanguage } from '@/lib/storefront-i18n-server'
import { STOREFRONT_STRINGS } from '@/lib/storefront-i18n'
import { getThemeText } from '@/lib/store/translations'
import { JsonLd } from '@/components/storefront/shared/JsonLd'
import type { StoreResponse, ThemeId } from '@/lib/types/storefront'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)
  const tokens = parseThemeConfig(store.themeConfig)
  const lang = await getStorefrontLanguage(tokens.defaultLanguage)
  const t = STOREFRONT_STRINGS[lang]
  const label = getThemeText(tokens, 'contactLabel', lang)

  const contactBits = [tokens.contactAddress, tokens.contactPhone, tokens.contactEmail].filter(Boolean)
  const description = truncateDescription(
    contactBits.length > 0
      ? t.seo.contactDescriptionWithInfo(store.name, contactBits.join(', '))
      : t.seo.contactDescriptionFallback(store.name)
  )

  return {
    title: label,
    description,
    alternates: { canonical: getStoreUrl(slug, '/contact', store.customDomain) },
  }
}

export default async function StoreContactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const tokens = parseThemeConfig(store.themeConfig)
  const lang = await getStorefrontLanguage(tokens.defaultLanguage)
  const t = STOREFRONT_STRINGS[lang]

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: store.name, url: getStoreUrl(slug, '', store.customDomain) },
        { name: getThemeText(tokens, 'contactLabel', lang), url: getStoreUrl(slug, '/contact', store.customDomain) },
      ])} />
      <ContactPage slug={slug} storeName={store.name} themeId={themeId} tokens={tokens} t={t} lang={lang} />
    </>
  )
}
