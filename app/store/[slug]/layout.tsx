import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import { StorefrontCartProvider } from '@/lib/store/storefront-cart-context'
import { StorefrontToastProvider } from '@/lib/store/storefront-toast-context'
import { parseThemeConfig, parseThemeOverride } from '@/lib/store/theme-config'
import { isThemeId, SURFACE_CLASSES } from '@/lib/storefront-themes'
import { buildStoreJsonLd, getStoreDescription, getStoreOgImage, getStoreOrigin, getStoreTitle } from '@/lib/store/seo'
import { JsonLd } from '@/components/storefront/shared/JsonLd'
import { PageViewTracker } from '@/components/storefront/shared/PageViewTracker'
import { Footer as MinimalFooter } from '@/components/storefront/themes/minimal/Footer'
import { Footer as BoldFooter } from '@/components/storefront/themes/bold/Footer'
import { Footer as ClassicFooter } from '@/components/storefront/themes/classic/Footer'
import { Footer as LuxuryFooter } from '@/components/storefront/themes/luxury/Footer'
import { Footer as VibrantFooter } from '@/components/storefront/themes/vibrant/Footer'
import { Footer as CommerceFooter } from '@/components/storefront/themes/commerce/Footer'
import { Footer as EditorialFooter } from '@/components/storefront/themes/editorial/Footer'
import { Footer as FlowerFooter } from '@/components/storefront/themes/flower/Footer'
import { Footer as KidsFooter } from '@/components/storefront/themes/kids/Footer'
import { SocialBar } from '@/components/storefront/shared/SocialBar'
import { AnnouncementBar } from '@/components/storefront/shared/AnnouncementBar'
import { SaleCountdownBar } from '@/components/storefront/shared/SaleCountdownBar'
import { FloatingContactButton } from '@/components/storefront/shared/FloatingContactButton'
import { TrackingScripts } from '@/components/storefront/shared/TrackingScripts'
import { StoreOfflinePage } from '@/components/storefront/shared/StoreOfflinePage'
import { ALL_FONT_VARIABLE_CLASSES, getFontFamily } from '@/lib/storefront-fonts'
import { isCurrentUserAdmin } from '@/lib/server/is-admin'
import type { CategoryResponse, StorePageResponse, StoreResponse, ThemeId } from '@/lib/types/storefront'

// Header is a Client Component in every theme (mobile menu state, etc.) — dynamic() per theme
// means a storefront only ever ships the ONE active theme's header JS to the browser, instead
// of all nine bundled together. Footer has no client-side state in any theme, so it stays a
// plain static import: there's no client bundle to split in the first place.
const HEADERS = {
  minimal: dynamic(() => import('@/components/storefront/themes/minimal/Header').then(m => m.Header)),
  bold: dynamic(() => import('@/components/storefront/themes/bold/Header').then(m => m.Header)),
  classic: dynamic(() => import('@/components/storefront/themes/classic/Header').then(m => m.Header)),
  luxury: dynamic(() => import('@/components/storefront/themes/luxury/Header').then(m => m.Header)),
  vibrant: dynamic(() => import('@/components/storefront/themes/vibrant/Header').then(m => m.Header)),
  commerce: dynamic(() => import('@/components/storefront/themes/commerce/Header').then(m => m.Header)),
  editorial: dynamic(() => import('@/components/storefront/themes/editorial/Header').then(m => m.Header)),
  flower: dynamic(() => import('@/components/storefront/themes/flower/Header').then(m => m.Header)),
  kids: dynamic(() => import('@/components/storefront/themes/kids/Header').then(m => m.Header)),
}
const FOOTERS = { minimal: MinimalFooter, bold: BoldFooter, classic: ClassicFooter, luxury: LuxuryFooter, vibrant: VibrantFooter, commerce: CommerceFooter, editorial: EditorialFooter, flower: FlowerFooter, kids: KidsFooter }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  let store: StoreResponse
  try {
    store = await apiFetch<StoreResponse>(`/api/stores/${slug}`, null)
  } catch {
    return {}
  }
  if (store.isProspect && !(await isCurrentUserAdmin())) return {}
  if (!store.isActive) return { title: store.name, robots: { index: false, follow: false } }

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
    icons: (tokens.faviconUrl || tokens.logoUrl) ? { icon: tokens.faviconUrl || tokens.logoUrl } : undefined,
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

  // Admin sales-demo store — not a real customer yet, so it must never be reachable on its
  // real slug/subdomain (or the /preview alias, which rewrites here) by anyone but a signed-in
  // admin. This is the single authoritative check for both access paths.
  if (store.isProspect && !(await isCurrentUserAdmin())) notFound()

  const tokens = parseThemeConfig(store.themeConfig)

  // A branded "closed"/"coming soon" notice instead of a bare 404 — merchant-configurable via
  // the Store Overview page. Skips the categories/pages fetch and the full Header/Footer/cart
  // tree entirely, since there's no real storefront to browse while offline.
  if (!store.isActive) {
    return <StoreOfflinePage store={store} tokens={tokens} />
  }

  const [categories, pages] = await Promise.all([
    apiFetch<CategoryResponse[]>(`/api/stores/${slug}/categories`, null),
    apiFetch<StorePageResponse[]>(`/api/stores/${slug}/pages`, null),
  ])
  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  // Admin-authored only (written exclusively through the AdminOnly-gated admin API) — trusted
  // content, hence the raw <style>/dangerouslySetInnerHTML below.
  const override = store.themeOverrideEnabled ? parseThemeOverride(store.themeOverride) : {}

  const Header = HEADERS[themeId]
  const Footer = FOOTERS[themeId]
  const showTopBar = tokens.socialsPosition === 'top' || tokens.socialsPosition === 'both'
  const showBottomBar = tokens.socialsPosition === 'bottom' || tokens.socialsPosition === 'both'

  const content = (
    <div
      className={`min-h-screen flex flex-col ${SURFACE_CLASSES[themeId].page} ${SURFACE_CLASSES[themeId].text} ${ALL_FONT_VARIABLE_CLASSES}`}
      style={{ fontFamily: getFontFamily(tokens.font) }}
    >
      <JsonLd data={buildStoreJsonLd(slug, store, tokens)} />
      <PageViewTracker slug={slug} />
      <TrackingScripts tokens={tokens} />
      {override.customCss && <style dangerouslySetInnerHTML={{ __html: override.customCss }} />}
      {override.announcementHtml && <div dangerouslySetInnerHTML={{ __html: override.announcementHtml }} />}
      <AnnouncementBar slug={slug} tokens={tokens} />
      <SaleCountdownBar tokens={tokens} />
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
      <FloatingContactButton tokens={tokens} />
    </div>
  )

  if (tokens.layoutWidth !== 'boxed') return content

  return (
    <div className="min-h-screen" style={{ backgroundColor: tokens.boxedBackgroundColor }}>
      <div className="mx-auto shadow-2xl shadow-black/40" style={{ maxWidth: `${tokens.boxedMaxWidth}px` }}>
        {content}
      </div>
    </div>
  )
}
