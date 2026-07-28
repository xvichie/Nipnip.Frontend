import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import { parseThemeConfig } from '@/lib/store/theme-config'
import { isThemeId } from '@/lib/storefront-themes'
import { StorePageView } from '@/components/storefront/shared/StorePageView'
import { buildBreadcrumbJsonLd, getStoreUrl, truncateDescription } from '@/lib/store/seo'
import { getStorefrontStrings } from '@/lib/storefront-i18n-server'
import { JsonLd } from '@/components/storefront/shared/JsonLd'
import type { StorePageResponse, StoreResponse, ThemeId } from '@/lib/types/storefront'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>
}): Promise<Metadata> {
  const { slug, pageSlug } = await params

  const store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)

  let page: StorePageResponse
  try {
    page = await apiFetch<StorePageResponse>(`/api/stores/${slug}/pages/${pageSlug}`, null)
  } catch {
    return {}
  }

  return {
    title: page.title,
    description: page.content ? truncateDescription(page.content) : undefined,
    alternates: { canonical: getStoreUrl(slug, `/pages/${pageSlug}`, store.customDomain) },
  }
}

export default async function StorePageRoute({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>
}) {
  const { slug, pageSlug } = await params

  const store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)

  let page: StorePageResponse
  try {
    page = await apiFetch<StorePageResponse>(`/api/stores/${slug}/pages/${pageSlug}`, null)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const t = await getStorefrontStrings(parseThemeConfig(store.themeConfig).defaultLanguage)

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: store.name, url: getStoreUrl(slug, '', store.customDomain) },
        { name: page.title, url: getStoreUrl(slug, `/pages/${pageSlug}`, store.customDomain) },
      ])} />
      <StorePageView slug={slug} page={page} themeId={themeId} t={t} />
    </>
  )
}
