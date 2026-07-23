import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import { StorefrontCartProvider } from '@/lib/store/storefront-cart-context'
import { StorefrontToastProvider } from '@/lib/store/storefront-toast-context'
import { parseThemeConfig, parseThemeOverride } from '@/lib/store/theme-config'
import { isThemeId, SURFACE_CLASSES } from '@/lib/storefront-themes'
import { buildStoreJsonLd, getStoreDescription, getStoreOgImage, getStoreOrigin, getStoreTitle } from '@/lib/store/seo'
import { JsonLd } from '@/components/storefront/shared/JsonLd'
import { PageViewTracker } from '@/components/storefront/shared/PageViewTracker'
import { Header as MinimalHeader } from '@/components/storefront/themes/minimal/Header'
import { Footer as MinimalFooter } from '@/components/storefront/themes/minimal/Footer'
import { Header as BoldHeader } from '@/components/storefront/themes/bold/Header'
import { Footer as BoldFooter } from '@/components/storefront/themes/bold/Footer'
import { Header as ClassicHeader } from '@/components/storefront/themes/classic/Header'
import { Footer as ClassicFooter } from '@/components/storefront/themes/classic/Footer'
import { Header as LuxuryHeader } from '@/components/storefront/themes/luxury/Header'
import { Footer as LuxuryFooter } from '@/components/storefront/themes/luxury/Footer'
import { Header as VibrantHeader } from '@/components/storefront/themes/vibrant/Header'
import { Footer as VibrantFooter } from '@/components/storefront/themes/vibrant/Footer'
import { Header as CommerceHeader } from '@/components/storefront/themes/commerce/Header'
import { Footer as CommerceFooter } from '@/components/storefront/themes/commerce/Footer'
import { Header as EditorialHeader } from '@/components/storefront/themes/editorial/Header'
import { Footer as EditorialFooter } from '@/components/storefront/themes/editorial/Footer'
import { SocialBar } from '@/components/storefront/shared/SocialBar'
import { AnnouncementBar } from '@/components/storefront/shared/AnnouncementBar'
import type { CategoryResponse, StorePageResponse, StoreResponse, ThemeId } from '@/lib/types/storefront'

const HEADERS = { minimal: MinimalHeader, bold: BoldHeader, classic: ClassicHeader, luxury: LuxuryHeader, vibrant: VibrantHeader, commerce: CommerceHeader, editorial: EditorialHeader }
const FOOTERS = { minimal: MinimalFooter, bold: BoldFooter, classic: ClassicFooter, luxury: LuxuryFooter, vibrant: VibrantFooter, commerce: CommerceFooter, editorial: EditorialFooter }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  let store: StoreResponse
  try {
    store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)
  } catch {
    return {}
  }
  if (!store.isActive) return {}

  const tokens = parseThemeConfig(store.themeConfig)
  const url = getStoreOrigin(slug, store.customDomain)
  const title = getStoreTitle(store, tokens)
  const description = getStoreDescription(store, tokens)
  const ogImage = getStoreOgImage(tokens)

  return {
    title: { default: title, template: `%s — ${store.name}` },
    description,
    openGraph: {
      type: 'website',
      siteName: store.name,
      title,
      description,
      url,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    icons: tokens.logoUrl ? { icon: tokens.logoUrl } : undefined,
  }
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let store: StoreResponse
  try {
    store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  if (!store.isActive) notFound()

  const [categories, pages] = await Promise.all([
    apiFetch<CategoryResponse[]>(`/api/stores/${slug}/categories`, null),
    apiFetch<StorePageResponse[]>(`/api/stores/${slug}/pages`, null),
  ])
  const tokens = parseThemeConfig(store.themeConfig)
  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  // Admin-authored only (written exclusively through the AdminOnly-gated admin API) — trusted
  // content, hence the raw <style>/dangerouslySetInnerHTML below.
  const override = store.themeOverrideEnabled ? parseThemeOverride(store.themeOverride) : {}

  const Header = HEADERS[themeId]
  const Footer = FOOTERS[themeId]
  const showTopBar = tokens.socialsPosition === 'top' || tokens.socialsPosition === 'both'
  const showBottomBar = tokens.socialsPosition === 'bottom' || tokens.socialsPosition === 'both'

  return (
    <div className={`min-h-screen flex flex-col ${SURFACE_CLASSES[themeId].page} ${SURFACE_CLASSES[themeId].text}`}>
      <JsonLd data={buildStoreJsonLd(slug, store, tokens)} />
      <PageViewTracker slug={slug} />
      {override.customCss && <style dangerouslySetInnerHTML={{ __html: override.customCss }} />}
      {override.announcementHtml && <div dangerouslySetInnerHTML={{ __html: override.announcementHtml }} />}
      <AnnouncementBar slug={slug} tokens={tokens} />
      <StorefrontToastProvider>
        <StorefrontCartProvider slug={slug}>
          {showTopBar && <SocialBar themeId={themeId} tokens={tokens} edge="top" />}
          <Header slug={slug} storeName={store.name} categories={categories} pages={pages} tokens={tokens} />
          <main className="flex-1">{children}</main>
          <Footer slug={slug} storeName={store.name} tokens={tokens} pages={pages} />
          {showBottomBar && <SocialBar themeId={themeId} tokens={tokens} edge="bottom" />}
        </StorefrontCartProvider>
      </StorefrontToastProvider>
      {override.footerExtraHtml && <div dangerouslySetInnerHTML={{ __html: override.footerExtraHtml }} />}
    </div>
  )
}
