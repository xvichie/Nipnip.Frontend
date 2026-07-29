import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import { StorefrontCartProvider } from '@/lib/store/storefront-cart-context'
import { StorefrontToastProvider } from '@/lib/store/storefront-toast-context'
import { getButtonHoverCssVars, parseThemeConfig, parseThemeOverride } from '@/lib/store/theme-config'
import { isThemeId, SURFACE_CLASSES } from '@/lib/storefront-themes'
import { buildStoreJsonLd, getStoreDescription, getStoreOgImage, getStoreOrigin, getStoreTitle } from '@/lib/store/seo'
import { STOREFRONT_STRINGS } from '@/lib/storefront-i18n'
import { getStorefrontLanguage } from '@/lib/storefront-i18n-server'
import { StorefrontLanguageProvider } from '@/components/storefront/shared/StorefrontLanguageProvider'
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
import { Footer as SportsFooter } from '@/components/storefront/themes/sports/Footer'
import { Footer as ChocolateFooter } from '@/components/storefront/themes/chocolate/Footer'
import { Footer as AthleticFooter } from '@/components/storefront/themes/athletic/Footer'
import { Footer as HandmadeFooter } from '@/components/storefront/themes/handmade/Footer'
import { Footer as FurnitureFooter } from '@/components/storefront/themes/furniture/Footer'
import { Footer as VarsityFooter } from '@/components/storefront/themes/varsity/Footer'
import { Footer as WoodenFooter } from '@/components/storefront/themes/wooden/Footer'
import { Footer as IndustrialFooter } from '@/components/storefront/themes/industrial/Footer'
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
  sports: dynamic(() => import('@/components/storefront/themes/sports/Header').then(m => m.Header)),
  chocolate: dynamic(() => import('@/components/storefront/themes/chocolate/Header').then(m => m.Header)),
  athletic: dynamic(() => import('@/components/storefront/themes/athletic/Header').then(m => m.Header)),
  handmade: dynamic(() => import('@/components/storefront/themes/handmade/Header').then(m => m.Header)),
  furniture: dynamic(() => import('@/components/storefront/themes/furniture/Header').then(m => m.Header)),
  varsity: dynamic(() => import('@/components/storefront/themes/varsity/Header').then(m => m.Header)),
  wooden: dynamic(() => import('@/components/storefront/themes/wooden/Header').then(m => m.Header)),
  industrial: dynamic(() => import('@/components/storefront/themes/industrial/Header').then(m => m.Header)),
}
const FOOTERS = { minimal: MinimalFooter, bold: BoldFooter, classic: ClassicFooter, luxury: LuxuryFooter, vibrant: VibrantFooter, commerce: CommerceFooter, editorial: EditorialFooter, flower: FlowerFooter, kids: KidsFooter, sports: SportsFooter, chocolate: ChocolateFooter, athletic: AthleticFooter, handmade: HandmadeFooter, furniture: FurnitureFooter, varsity: VarsityFooter, wooden: WoodenFooter, industrial: IndustrialFooter }

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
  const lang = await getStorefrontLanguage(tokens.defaultLanguage)
  const title = getStoreTitle(store, tokens, lang)
  const description = getStoreDescription(store, tokens, lang)
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
  const lang = await getStorefrontLanguage(tokens.defaultLanguage)
  const t = STOREFRONT_STRINGS[lang]

  // A branded "closed"/"coming soon" notice instead of a bare 404 — merchant-configurable via
  // the Store Overview page. Skips the categories/pages fetch and the full Header/Footer/cart
  // tree entirely, since there's no real storefront to browse while offline.
  if (!store.isActive) {
    return <StoreOfflinePage store={store} tokens={tokens} t={t} lang={lang} />
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
      style={{ fontFamily: getFontFamily(tokens.font), ...getButtonHoverCssVars(tokens) }}
    >
      <JsonLd data={buildStoreJsonLd(slug, store, tokens)} />
      <PageViewTracker slug={slug} />
      <TrackingScripts tokens={tokens} />
      {override.customCss && <style dangerouslySetInnerHTML={{ __html: override.customCss }} />}
      {override.announcementHtml && <div dangerouslySetInnerHTML={{ __html: override.announcementHtml }} />}
      <StorefrontLanguageProvider initialLang={lang}>
        <AnnouncementBar slug={slug} tokens={tokens} />
        <SaleCountdownBar tokens={tokens} />
        <StorefrontToastProvider>
          <StorefrontCartProvider slug={slug}>
            {showTopBar && <SocialBar themeId={themeId} tokens={tokens} edge="top" />}
            <Header slug={slug} storeName={store.name} categories={categories} pages={pages} tokens={tokens} />
            <main className="flex-1">{children}</main>
            <Footer slug={slug} storeName={store.name} tokens={tokens} pages={pages} t={t} lang={lang} />
            {showBottomBar && <SocialBar themeId={themeId} tokens={tokens} edge="bottom" />}
          </StorefrontCartProvider>
        </StorefrontToastProvider>
      </StorefrontLanguageProvider>
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
