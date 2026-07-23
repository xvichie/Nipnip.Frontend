'use client'

import { useEffect, useState } from 'react'
import { useMyCategories, useMyPages, useMyProducts, useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { DEFAULT_THEME_CONFIG, getHomeSectionOrder, HOME_SECTION_KEYS, parseThemeConfig } from '@/lib/store/theme-config'
import { withSaleCategory } from '@/lib/store/sale-category'
import { isThemeId, SURFACE_CLASSES } from '@/lib/storefront-themes'
import { StorefrontCartProvider } from '@/lib/store/storefront-cart-context'
import { PreviewFrame, type PreviewMode } from '@/components/dashboard/store/PreviewFrame'
import { Header as MinimalHeader } from '@/components/storefront/themes/minimal/Header'
import { Footer as MinimalFooter } from '@/components/storefront/themes/minimal/Footer'
import { Home as MinimalHome } from '@/components/storefront/themes/minimal/Home'
import { Header as BoldHeader } from '@/components/storefront/themes/bold/Header'
import { Footer as BoldFooter } from '@/components/storefront/themes/bold/Footer'
import { Home as BoldHome } from '@/components/storefront/themes/bold/Home'
import { Header as ClassicHeader } from '@/components/storefront/themes/classic/Header'
import { Footer as ClassicFooter } from '@/components/storefront/themes/classic/Footer'
import { Home as ClassicHome } from '@/components/storefront/themes/classic/Home'
import { Header as LuxuryHeader } from '@/components/storefront/themes/luxury/Header'
import { Footer as LuxuryFooter } from '@/components/storefront/themes/luxury/Footer'
import { Home as LuxuryHome } from '@/components/storefront/themes/luxury/Home'
import { Header as VibrantHeader } from '@/components/storefront/themes/vibrant/Header'
import { Footer as VibrantFooter } from '@/components/storefront/themes/vibrant/Footer'
import { Home as VibrantHome } from '@/components/storefront/themes/vibrant/Home'
import { Header as CommerceHeader } from '@/components/storefront/themes/commerce/Header'
import { Footer as CommerceFooter } from '@/components/storefront/themes/commerce/Footer'
import { Home as CommerceHome } from '@/components/storefront/themes/commerce/Home'
import { Header as EditorialHeader } from '@/components/storefront/themes/editorial/Header'
import { Footer as EditorialFooter } from '@/components/storefront/themes/editorial/Footer'
import { Home as EditorialHome } from '@/components/storefront/themes/editorial/Home'
import type {
  CategoryMenuMode,
  CategoryMenuScope,
  FooterContactFormPosition,
  HomeSectionKey,
  LandingCategoryColumns,
  ProductSummaryResponse,
  SocialsPosition,
  ThemeConfig,
  ThemeId,
} from '@/lib/types/storefront'

const HEADERS = { minimal: MinimalHeader, bold: BoldHeader, classic: ClassicHeader, luxury: LuxuryHeader, vibrant: VibrantHeader, commerce: CommerceHeader, editorial: EditorialHeader }
const FOOTERS = { minimal: MinimalFooter, bold: BoldFooter, classic: ClassicFooter, luxury: LuxuryFooter, vibrant: VibrantFooter, commerce: CommerceFooter, editorial: EditorialFooter }
const HOMES = { minimal: MinimalHome, bold: BoldHome, classic: ClassicHome, luxury: LuxuryHome, vibrant: VibrantHome, commerce: CommerceHome, editorial: EditorialHome }

const PLACEHOLDER_PRODUCTS: ProductSummaryResponse[] = [
  { id: 'preview-1', slug: 'preview-1', categoryId: null, name: 'Sample Product', basePrice: 49.99, salePrice: null, isActive: true, thumbnailUrl: null },
  { id: 'preview-2', slug: 'preview-2', categoryId: null, name: 'Another Item', basePrice: 89, salePrice: null, isActive: true, thumbnailUrl: null },
  { id: 'preview-3', slug: 'preview-3', categoryId: null, name: 'Best Seller', basePrice: 129.5, salePrice: 99.5, isActive: true, thumbnailUrl: null },
  { id: 'preview-4', slug: 'preview-4', categoryId: null, name: 'New Arrival', basePrice: 34, salePrice: null, isActive: true, thumbnailUrl: null },
]

const SECTION_META: Record<HomeSectionKey, { label: string; description: string }> = {
  hero: { label: 'Hero', description: 'Top banner with headline, image, and call to action.' },
  categories: { label: 'Categories Grid', description: 'A grid of category tiles below the hero.' },
  products: { label: 'Product Grid', description: 'Your full product listing.' },
}

const SOCIALS_POSITION_OPTIONS: { value: SocialsPosition; label: string }[] = [
  { value: 'top', label: 'Top of page' },
  { value: 'bottom', label: 'Bottom of page' },
  { value: 'both', label: 'Top & bottom' },
  { value: 'footer', label: 'Inside footer' },
]

function UpDownButtons({
  disabledUp,
  disabledDown,
  onUp,
  onDown,
}: {
  disabledUp: boolean
  disabledDown: boolean
  onUp: () => void
  onDown: () => void
}) {
  return (
    <div className="flex flex-col gap-1 shrink-0">
      <button
        type="button"
        onClick={onUp}
        disabled={disabledUp}
        aria-label="Move up"
        className="w-6 h-5 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:text-white/40 disabled:hover:bg-transparent transition-colors"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 6.5L5 3.5L8 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={disabledDown}
        aria-label="Move down"
        className="w-6 h-5 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:text-white/40 disabled:hover:bg-transparent transition-colors"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

export default function StoreLayoutPage() {
  const { data: store, isLoading } = useMyStore()
  const { data: categories } = useMyCategories()
  const { data: pages } = useMyPages()
  const { data: productsPage, isLoading: productsLoading } = useMyProducts({ page: 1, pageSize: 8 })
  const { mutate: updateStore, isPending, error } = useUpdateMyStore()

  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [previewFullscreen, setPreviewFullscreen] = useState(false)

  const [homeSectionOrder, setHomeSectionOrder] = useState<HomeSectionKey[]>(DEFAULT_THEME_CONFIG.homeSectionOrder)
  const [categoryMenuMode, setCategoryMenuMode] = useState<CategoryMenuMode>(DEFAULT_THEME_CONFIG.categoryMenuMode)
  const [categoryMenuScope, setCategoryMenuScope] = useState<CategoryMenuScope>(DEFAULT_THEME_CONFIG.categoryMenuScope)
  const [categoryMenuSelectedIds, setCategoryMenuSelectedIds] = useState<string[]>(DEFAULT_THEME_CONFIG.categoryMenuSelectedIds)
  const [navPageIds, setNavPageIds] = useState<string[]>(DEFAULT_THEME_CONFIG.navPageIds)
  const [showContactInNav, setShowContactInNav] = useState(DEFAULT_THEME_CONFIG.showContactInNav)
  const [contactLabel, setContactLabel] = useState(DEFAULT_THEME_CONFIG.contactLabel)
  const [showLandingCategories, setShowLandingCategories] = useState(DEFAULT_THEME_CONFIG.showLandingCategories)
  const [landingCategoryScope, setLandingCategoryScope] = useState<CategoryMenuScope>(DEFAULT_THEME_CONFIG.landingCategoryScope)
  const [landingCategorySelectedIds, setLandingCategorySelectedIds] = useState<string[]>(DEFAULT_THEME_CONFIG.landingCategorySelectedIds)
  const [landingCategoryColumns, setLandingCategoryColumns] = useState<LandingCategoryColumns>(DEFAULT_THEME_CONFIG.landingCategoryColumns)
  const [footerContactForm, setFooterContactForm] = useState<FooterContactFormPosition>(DEFAULT_THEME_CONFIG.footerContactForm)
  const [socialsPosition, setSocialsPosition] = useState<SocialsPosition>(DEFAULT_THEME_CONFIG.socialsPosition)
  const [saved, setSaved] = useState(false)

  // "Adjust state during render" instead of an effect — hydrates once from the fetched
  // store, which arrives async, so there's no lazy-initializer moment to hook into. Tracked
  // via a plain "have we hydrated this mount" flag rather than comparing against the previous
  // store by reference — the store query is cached across navigations, so on a revisit `store`
  // can already be populated on the very first render, making it identical to itself and never
  // triggering a reference-inequality check.
  const [hydrated, setHydrated] = useState(false)
  if (store && !hydrated) {
    setHydrated(true)
    const parsed = parseThemeConfig(store.themeConfig)
    setHomeSectionOrder(getHomeSectionOrder(parsed))
    setCategoryMenuMode(parsed.categoryMenuMode)
    setCategoryMenuScope(parsed.categoryMenuScope)
    setCategoryMenuSelectedIds(parsed.categoryMenuSelectedIds)
    setNavPageIds(parsed.navPageIds)
    setShowContactInNav(parsed.showContactInNav)
    setContactLabel(parsed.contactLabel)
    setShowLandingCategories(parsed.showLandingCategories)
    setLandingCategoryScope(parsed.landingCategoryScope)
    setLandingCategorySelectedIds(parsed.landingCategorySelectedIds)
    setLandingCategoryColumns(parsed.landingCategoryColumns)
    setFooterContactForm(parsed.footerContactForm)
    setSocialsPosition(parsed.socialsPosition)
  }

  useEffect(() => {
    if (!previewFullscreen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setPreviewFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previewFullscreen])

  function toggleSection(key: HomeSectionKey) {
    setHomeSectionOrder(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]))
  }

  function moveSection(key: HomeSectionKey, direction: -1 | 1) {
    setHomeSectionOrder(prev => {
      const index = prev.indexOf(key)
      if (index === -1) return prev
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next
    })
  }

  function toggleNavPage(id: string) {
    setNavPageIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  function toggleCategorySelected(id: string) {
    setCategoryMenuSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  function toggleLandingCategorySelected(id: string) {
    setLandingCategorySelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  function handleSave() {
    if (!store) return
    const parsed = parseThemeConfig(store.themeConfig)
    updateStore(
      {
        themeConfig: JSON.stringify({
          ...parsed,
          homeSectionOrder,
          categoryMenuMode,
          categoryMenuScope,
          categoryMenuSelectedIds,
          navPageIds,
          showContactInNav,
          contactLabel: contactLabel.trim() || undefined,
          showLandingCategories,
          landingCategoryScope,
          landingCategorySelectedIds,
          landingCategoryColumns,
          footerContactForm,
          socialsPosition,
        }),
      },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
    )
  }

  if (isLoading || !store) {
    return (
      <div className="flex flex-col gap-8 max-w-6xl">
        <div className="skeleton h-8 w-40 rounded-xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  const parsed = parseThemeConfig(store.themeConfig)
  const tokens: Required<ThemeConfig> = {
    ...parsed,
    homeSectionOrder,
    categoryMenuMode,
    categoryMenuScope,
    categoryMenuSelectedIds,
    navPageIds,
    showContactInNav,
    contactLabel,
    showLandingCategories,
    landingCategoryScope,
    landingCategorySelectedIds,
    landingCategoryColumns,
    footerContactForm,
    socialsPosition,
  }

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const selectableCategories = withSaleCategory((categories ?? []).filter(c => !c.parentCategoryId), tokens.showSaleCategory)
  const previewProducts = productsPage?.items.length
    ? productsPage.items
    : productsLoading ? [] : PLACEHOLDER_PRODUCTS
  const HeaderPreview = HEADERS[themeId]
  const FooterPreview = FOOTERS[themeId]
  const HomePreview = HOMES[themeId]

  const previewContent = (
    <StorefrontCartProvider slug={store.slug} preview>
      <HeaderPreview slug={store.slug} storeName={store.name} categories={categories ?? []} pages={pages ?? []} tokens={tokens} />
      <HomePreview
        slug={store.slug}
        store={store}
        categories={categories ?? []}
        products={previewProducts}
        tokens={tokens}
      />
      <FooterPreview slug={store.slug} storeName={store.name} tokens={tokens} pages={pages ?? []} />
    </StorefrontCartProvider>
  )

  const previewControls = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 p-1">
        <button
          type="button"
          onClick={() => setPreviewMode('desktop')}
          aria-label="Desktop preview"
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-fuchsia-500/20 text-white' : 'text-white/40 hover:text-white'}`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="1.5" y="2.5" width="13" height="8.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
            <path d="M5.5 14h5M8 11v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode('mobile')}
          aria-label="Mobile preview"
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-fuchsia-500/20 text-white' : 'text-white/40 hover:text-white'}`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="4" y="1.5" width="8" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7 12.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <button
        type="button"
        onClick={() => setPreviewFullscreen(v => !v)}
        aria-label={previewFullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}
        className="flex items-center justify-center w-7 h-7 rounded-md border border-white/10 bg-white/4 text-white/50 hover:text-white transition-colors"
      >
        {previewFullscreen ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  )

  const disabledSections = HOME_SECTION_KEYS.filter(key => !homeSectionOrder.includes(key))
  const sectionDisplayOrder = [...homeSectionOrder, ...disabledSections]

  return (
    <>
    <div className="flex flex-col gap-8 max-w-6xl pb-24">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Layout</h1>
        <p className="text-white/40 text-sm mt-1">Changes update the preview instantly — nothing goes live until you save.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        <div className="flex flex-col gap-6">

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Home Page Sections</h2>
              <p className="text-white/30 text-xs mt-1">Show, hide, and reorder the sections on your storefront&apos;s home page.</p>
            </div>
            <div className="flex flex-col gap-2">
              {sectionDisplayOrder.map(key => {
                const enabled = homeSectionOrder.includes(key)
                const posInEnabled = homeSectionOrder.indexOf(key)
                const meta = SECTION_META[key]
                return (
                  <div
                    key={key}
                    className={[
                      'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                      enabled ? 'border-white/10 bg-white/2' : 'border-white/5 bg-white/[0.01] opacity-60',
                    ].join(' ')}
                  >
                    <UpDownButtons
                      disabledUp={!enabled || posInEnabled === 0}
                      disabledDown={!enabled || posInEnabled === homeSectionOrder.length - 1}
                      onUp={() => moveSection(key, -1)}
                      onDown={() => moveSection(key, 1)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{meta.label}</p>
                      <p className="text-white/30 text-xs mt-0.5">{meta.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => toggleSection(key)}
                      className={`toggle toggle-sm shrink-0 ${enabled ? 'toggle-success' : ''}`}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Navigation Menu</h2>
              <p className="text-white/30 text-xs mt-1">Controls what appears in your storefront&apos;s header and mobile menu.</p>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Categories display</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'flat', label: 'Individual links' },
                  { value: 'dropdown', label: 'Single dropdown' },
                ] as { value: CategoryMenuMode; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategoryMenuMode(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-left transition-colors',
                      categoryMenuMode === opt.value
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                        : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Which categories</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'all', label: 'All categories' },
                  { value: 'selected', label: 'Choose categories' },
                ] as { value: CategoryMenuScope; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategoryMenuScope(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-left transition-colors',
                      categoryMenuScope === opt.value
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                        : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {categoryMenuScope === 'selected' && (
              <div className="flex flex-col gap-1.5">
                {selectableCategories.length === 0 ? (
                  <p className="text-white/30 text-xs">No categories yet.</p>
                ) : (
                  selectableCategories.map(category => (
                    <label
                      key={category.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer"
                    >
                      <span className="text-sm text-white/70">{category.name}</span>
                      <input
                        type="checkbox"
                        checked={categoryMenuSelectedIds.includes(category.id)}
                        onChange={() => toggleCategorySelected(category.id)}
                        className="toggle toggle-sm"
                      />
                    </label>
                  ))
                )}
              </div>
            )}

            <div className="fieldset gap-2 pt-2 border-t border-white/5">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Pages in menu</label>
              <p className="text-white/30 text-xs -mt-1 mb-1">Choose which of your custom pages show in the header and mobile menu.</p>
              {(!pages || pages.length === 0) ? (
                <p className="text-white/30 text-xs">No pages yet — add some in the Pages section.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {pages.map(page => (
                    <label
                      key={page.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer"
                    >
                      <span className="text-sm text-white/70">{page.title}</span>
                      <input
                        type="checkbox"
                        checked={navPageIds.includes(page.id)}
                        onChange={() => toggleNavPage(page.id)}
                        className="toggle toggle-sm"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer">
              <span className="text-sm text-white/70">Contact page in menu</span>
              <input
                type="checkbox"
                checked={showContactInNav}
                onChange={e => setShowContactInNav(e.target.checked)}
                className={`toggle toggle-sm ${showContactInNav ? 'toggle-success' : 'toggle-error'}`}
              />
            </label>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Categories Section</h2>
                <p className="text-white/30 text-xs mt-1">A category grid shown on your storefront&apos;s home page, below the hero.</p>
              </div>
              <input
                type="checkbox"
                checked={showLandingCategories}
                onChange={e => setShowLandingCategories(e.target.checked)}
                className={`toggle toggle-sm shrink-0 ${showLandingCategories ? 'toggle-success' : 'toggle-error'}`}
              />
            </label>

            {showLandingCategories && (
              <>
                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Which categories</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'all', label: 'All categories' },
                      { value: 'selected', label: 'Choose categories' },
                    ] as { value: CategoryMenuScope; label: string }[]).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLandingCategoryScope(opt.value)}
                        className={[
                          'rounded-lg border px-3 py-2 text-xs font-medium text-left transition-colors',
                          landingCategoryScope === opt.value
                            ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                            : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                        ].join(' ')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {landingCategoryScope === 'selected' && (
                  <div className="flex flex-col gap-1.5">
                    {selectableCategories.length === 0 ? (
                      <p className="text-white/30 text-xs">No categories yet.</p>
                    ) : (
                      selectableCategories.map(category => (
                        <label
                          key={category.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer"
                        >
                          <span className="text-sm text-white/70">{category.name}</span>
                          <input
                            type="checkbox"
                            checked={landingCategorySelectedIds.includes(category.id)}
                            onChange={() => toggleLandingCategorySelected(category.id)}
                            className="toggle toggle-sm"
                          />
                        </label>
                      ))
                    )}
                  </div>
                )}

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Grid layout</label>
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      { value: 2, label: '2 per row', gridClass: 'grid-cols-2' },
                      { value: 3, label: '3 per row', gridClass: 'grid-cols-3' },
                      { value: 4, label: '4 per row', gridClass: 'grid-cols-4' },
                      { value: 6, label: '6 per row', gridClass: 'grid-cols-6' },
                    ] as { value: LandingCategoryColumns; label: string; gridClass: string }[]).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLandingCategoryColumns(opt.value)}
                        className={[
                          'flex flex-col items-center gap-2 rounded-lg border px-2 py-2.5 transition-colors',
                          landingCategoryColumns === opt.value
                            ? 'border-fuchsia-500 bg-fuchsia-500/10'
                            : 'border-white/10 bg-white/4 hover:border-white/25',
                        ].join(' ')}
                      >
                        <div className={`grid ${opt.gridClass} gap-0.5 w-full`}>
                          {Array.from({ length: opt.value }).map((_, i) => (
                            <div
                              key={i}
                              className={`aspect-square rounded-sm ${landingCategoryColumns === opt.value ? 'bg-fuchsia-400' : 'bg-white/20'}`}
                            />
                          ))}
                        </div>
                        <span className={`text-[10px] font-medium ${landingCategoryColumns === opt.value ? 'text-white' : 'text-white/40'}`}>
                          {opt.value}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-white/30 text-xs mt-1">Columns per row on desktop — rows wrap automatically. Mobile always shows fewer, scaled down.</p>
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Socials Position</h2>
              <p className="text-white/30 text-xs mt-1">Where your social links (set on the Contact tab) appear on the storefront.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SOCIALS_POSITION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSocialsPosition(opt.value)}
                  className={[
                    'rounded-lg border px-3 py-2 text-xs font-medium text-left transition-colors',
                    socialsPosition === opt.value
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                      : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Contact Form</h2>
              <p className="text-white/30 text-xs mt-1">
                Let customers send you a message (name + message, plus email or phone) right from the footer, without visiting a separate page.
                Messages appear under the &quot;Messages&quot; tab of your store admin.
              </p>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Footer placement</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'off', label: 'Off' },
                  { value: 'above', label: 'Above footer' },
                  { value: 'below', label: 'Below footer' },
                ] as { value: FooterContactFormPosition; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFooterContactForm(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-left transition-colors',
                      footerContactForm === opt.value
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                        : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {!previewFullscreen && (
          <div className="lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Live Preview</p>
              {previewControls}
            </div>
            <div className={`rounded-2xl border border-white/10 overflow-hidden h-[720px] ${SURFACE_CLASSES[themeId].page} ${SURFACE_CLASSES[themeId].text}`}>
              <PreviewFrame mode={previewMode}>{previewContent}</PreviewFrame>
            </div>
          </div>
        )}

        {previewFullscreen && (
          <div className="fixed inset-0 z-[100] bg-[#08080d] flex flex-col p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Live Preview</p>
              {previewControls}
            </div>
            <div className={`flex-1 rounded-2xl border border-white/10 overflow-hidden ${SURFACE_CLASSES[themeId].page} ${SURFACE_CLASSES[themeId].text}`}>
              <PreviewFrame mode={previewMode}>{previewContent}</PreviewFrame>
            </div>
          </div>
        )}
      </div>
    </div>

    <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-40 border-t border-white/10 bg-[#0b0b12]/95 backdrop-blur-md px-4 py-3 sm:px-8">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {error && (
          <div className="flex-1 rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
            Failed to save changes.
          </div>
        )}
        {saved && (
          <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
            Saved successfully
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className={`btn gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white disabled:opacity-40 ${error || saved ? '' : 'w-full'}`}
        >
          {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Save Layout'}
        </button>
      </div>
    </div>
    </>
  )
}
