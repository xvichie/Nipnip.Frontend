'use client'

import { useEffect, useRef, useState } from 'react'
import { useMyCategories, useMyPages, useMyProducts, useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { uploadImage } from '@/lib/uploadImage'
import { BANNER_PATTERNS, DEFAULT_THEME_CONFIG, HERO_TEXT_POSITIONS, parseThemeConfig } from '@/lib/store/theme-config'
import { withSaleCategory } from '@/lib/store/sale-category'
import { getThemeDefinition, isThemeId, SURFACE_CLASSES, THEMES } from '@/lib/storefront-themes'
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
  BannerPattern,
  BannerPlacement,
  BannerType,
  CategoryMenuMode,
  CategoryMenuScope,
  FooterContactFormPosition,
  HeroHeight,
  HeroLayout,
  HeroMobileImagePosition,
  HeroMobileImageVisibility,
  HeroMobileTextAlign,
  HeroTextPosition,
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

function ImageField({
  label,
  value,
  uploading,
  onFile,
  onClear,
}: {
  label: string
  value: string
  uploading: boolean
  onFile: (file: File) => void
  onClear: () => void
}) {
  return (
    <div className="fieldset gap-2">
      <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/4 shrink-0 flex items-center justify-center">
          {uploading ? (
            <span className="loading loading-spinner loading-sm text-fuchsia-400" />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/20 text-[10px]">None</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="btn btn-xs bg-white/4 border-white/8 text-white/60 hover:text-white cursor-pointer w-fit">
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }}
            />
          </label>
          {value && (
            <button type="button" onClick={onClear} className="text-xs text-white/30 hover:text-red-400 text-left">
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StoreDesignPage() {
  const { data: store, isLoading } = useMyStore()
  const { data: categories } = useMyCategories()
  const { data: pages } = useMyPages()
  const { data: productsPage } = useMyProducts({ page: 1, pageSize: 8 })
  const { mutate: updateStore, isPending, error } = useUpdateMyStore()

  const [themeId, setThemeId] = useState<ThemeId>('minimal')
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const themePickerRef = useRef<HTMLDivElement>(null)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [previewFullscreen, setPreviewFullscreen] = useState(false)
  const [accentColor, setAccentColor] = useState(DEFAULT_THEME_CONFIG.accentColor)
  const [font, setFont] = useState<Required<ThemeConfig>['font']>(DEFAULT_THEME_CONFIG.font)
  const [logoUrl, setLogoUrl] = useState('')
  const [showStoreName, setShowStoreName] = useState(DEFAULT_THEME_CONFIG.showStoreName)
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [bannerType, setBannerType] = useState<BannerType>(DEFAULT_THEME_CONFIG.bannerType)
  const [bannerUrl, setBannerUrl] = useState('')
  const [bannerColor, setBannerColor] = useState('')
  const [bannerPattern, setBannerPattern] = useState<BannerPattern>(DEFAULT_THEME_CONFIG.bannerPattern)
  const [bannerPlacement, setBannerPlacement] = useState<BannerPlacement>(DEFAULT_THEME_CONFIG.bannerPlacement)
  const [heroLayout, setHeroLayout] = useState<HeroLayout>(DEFAULT_THEME_CONFIG.heroLayout)
  const [heroHeight, setHeroHeight] = useState<HeroHeight>(DEFAULT_THEME_CONFIG.heroHeight)
  const [heroTextPosition, setHeroTextPosition] = useState<HeroTextPosition>(DEFAULT_THEME_CONFIG.heroTextPosition)
  const [heroMobileImage, setHeroMobileImage] = useState<HeroMobileImageVisibility>(DEFAULT_THEME_CONFIG.heroMobileImage)
  const [heroMobileImagePosition, setHeroMobileImagePosition] = useState<HeroMobileImagePosition>(DEFAULT_THEME_CONFIG.heroMobileImagePosition)
  const [heroMobileTextAlign, setHeroMobileTextAlign] = useState<HeroMobileTextAlign>(DEFAULT_THEME_CONFIG.heroMobileTextAlign)
  const [heroEyebrow, setHeroEyebrow] = useState(DEFAULT_THEME_CONFIG.heroEyebrow)
  const [heroHeadline, setHeroHeadline] = useState('')
  const [heroSubheadline, setHeroSubheadline] = useState('')
  const [seoTagline, setSeoTagline] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactAddress, setContactAddress] = useState('')
  const [contactLatitude, setContactLatitude] = useState<number | null>(null)
  const [contactLongitude, setContactLongitude] = useState<number | null>(null)
  const [socialInstagram, setSocialInstagram] = useState('')
  const [socialFacebook, setSocialFacebook] = useState('')
  const [socialTiktok, setSocialTiktok] = useState('')
  const [socialYoutube, setSocialYoutube] = useState('')
  const [socialsPosition, setSocialsPosition] = useState<SocialsPosition>(DEFAULT_THEME_CONFIG.socialsPosition)
  const [showSaleCategory, setShowSaleCategory] = useState(DEFAULT_THEME_CONFIG.showSaleCategory)
  const [showSaleCategoryIcon, setShowSaleCategoryIcon] = useState(DEFAULT_THEME_CONFIG.showSaleCategoryIcon)
  const [navPageIds, setNavPageIds] = useState<string[]>(DEFAULT_THEME_CONFIG.navPageIds)
  const [categoryMenuMode, setCategoryMenuMode] = useState<CategoryMenuMode>(DEFAULT_THEME_CONFIG.categoryMenuMode)
  const [categoryMenuScope, setCategoryMenuScope] = useState<CategoryMenuScope>(DEFAULT_THEME_CONFIG.categoryMenuScope)
  const [categoryMenuSelectedIds, setCategoryMenuSelectedIds] = useState<string[]>(DEFAULT_THEME_CONFIG.categoryMenuSelectedIds)
  const [showLandingCategories, setShowLandingCategories] = useState(DEFAULT_THEME_CONFIG.showLandingCategories)
  const [landingCategoryScope, setLandingCategoryScope] = useState<CategoryMenuScope>(DEFAULT_THEME_CONFIG.landingCategoryScope)
  const [landingCategorySelectedIds, setLandingCategorySelectedIds] = useState<string[]>(DEFAULT_THEME_CONFIG.landingCategorySelectedIds)
  const [landingCategoryColumns, setLandingCategoryColumns] = useState<LandingCategoryColumns>(DEFAULT_THEME_CONFIG.landingCategoryColumns)
  const [footerContactForm, setFooterContactForm] = useState<FooterContactFormPosition>(DEFAULT_THEME_CONFIG.footerContactForm)
  const [showContactInNav, setShowContactInNav] = useState(DEFAULT_THEME_CONFIG.showContactInNav)
  const [contactLabel, setContactLabel] = useState(DEFAULT_THEME_CONFIG.contactLabel)
  const [codEnabled, setCodEnabled] = useState(DEFAULT_THEME_CONFIG.codEnabled)
  const [codNotes, setCodNotes] = useState(DEFAULT_THEME_CONFIG.codNotes)
  const [bankTransferEnabled, setBankTransferEnabled] = useState(DEFAULT_THEME_CONFIG.bankTransferEnabled)
  const [bankTransferNotes, setBankTransferNotes] = useState(DEFAULT_THEME_CONFIG.bankTransferNotes)
  const [shippingZones, setShippingZones] = useState(DEFAULT_THEME_CONFIG.shippingZones)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(DEFAULT_THEME_CONFIG.freeShippingThreshold)
  const [logoUploading, setLogoUploading] = useState(false)
  const [heroImageUploading, setHeroImageUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [saved, setSaved] = useState(false)

  // "Adjust state during render" instead of an effect — hydrates once from the
  // fetched store, which arrives async, so there's no lazy-initializer moment to hook into.
  const [prevStore, setPrevStore] = useState(store)
  if (store && store !== prevStore) {
    setPrevStore(store)
    const parsed = parseThemeConfig(store.themeConfig)
    setThemeId(isThemeId(store.themeId) ? store.themeId : 'minimal')
    setAccentColor(parsed.accentColor)
    setFont(parsed.font)
    setLogoUrl(parsed.logoUrl)
    setShowStoreName(parsed.showStoreName)
    setHeroImageUrl(parsed.heroImageUrl)
    setBannerType(parsed.bannerType)
    setBannerUrl(parsed.bannerUrl)
    setBannerColor(parsed.bannerColor)
    setBannerPattern(parsed.bannerPattern)
    setBannerPlacement(parsed.bannerPlacement)
    setHeroLayout(parsed.heroLayout)
    setHeroHeight(parsed.heroHeight)
    setHeroTextPosition(parsed.heroTextPosition)
    setHeroMobileImage(parsed.heroMobileImage)
    setHeroMobileImagePosition(parsed.heroMobileImagePosition)
    setHeroMobileTextAlign(parsed.heroMobileTextAlign)
    setHeroEyebrow(parsed.heroEyebrow)
    setHeroHeadline(parsed.heroHeadline)
    setHeroSubheadline(parsed.heroSubheadline)
    setSeoTagline(parsed.seoTagline)
    setSeoDescription(parsed.seoDescription)
    setContactEmail(parsed.contactEmail)
    setContactPhone(parsed.contactPhone)
    setContactAddress(parsed.contactAddress)
    setContactLatitude(parsed.contactLatitude)
    setContactLongitude(parsed.contactLongitude)
    setSocialInstagram(parsed.socialInstagram)
    setSocialFacebook(parsed.socialFacebook)
    setSocialTiktok(parsed.socialTiktok)
    setSocialYoutube(parsed.socialYoutube)
    setSocialsPosition(parsed.socialsPosition)
    setShowSaleCategory(parsed.showSaleCategory)
    setShowSaleCategoryIcon(parsed.showSaleCategoryIcon)
    setNavPageIds(parsed.navPageIds)
    setCategoryMenuMode(parsed.categoryMenuMode)
    setCategoryMenuScope(parsed.categoryMenuScope)
    setCategoryMenuSelectedIds(parsed.categoryMenuSelectedIds)
    setShowLandingCategories(parsed.showLandingCategories)
    setLandingCategoryScope(parsed.landingCategoryScope)
    setLandingCategorySelectedIds(parsed.landingCategorySelectedIds)
    setLandingCategoryColumns(parsed.landingCategoryColumns)
    setFooterContactForm(parsed.footerContactForm)
    setShowContactInNav(parsed.showContactInNav)
    setContactLabel(parsed.contactLabel)
    setCodEnabled(parsed.codEnabled)
    setCodNotes(parsed.codNotes)
    setBankTransferEnabled(parsed.bankTransferEnabled)
    setBankTransferNotes(parsed.bankTransferNotes)
    setShippingZones(parsed.shippingZones)
    setFreeShippingThreshold(parsed.freeShippingThreshold)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (themePickerRef.current && !themePickerRef.current.contains(e.target as Node)) {
        setThemePickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!previewFullscreen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setPreviewFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previewFullscreen])

  function toggleNavPage(id: string) {
    setNavPageIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function toggleCategorySelected(id: string) {
    setCategoryMenuSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function toggleLandingCategorySelected(id: string) {
    setLandingCategorySelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleLogoFile(file: File) {
    setLogoUploading(true)
    try {
      setLogoUrl(await uploadImage(file))
    } catch {
      // keep previous logo on failure
    } finally {
      setLogoUploading(false)
    }
  }

  async function handleHeroImageFile(file: File) {
    setHeroImageUploading(true)
    try {
      setHeroImageUrl(await uploadImage(file))
    } catch {
      // keep previous hero image on failure
    } finally {
      setHeroImageUploading(false)
    }
  }

  async function handleBannerFile(file: File) {
    setBannerUploading(true)
    try {
      setBannerUrl(await uploadImage(file))
    } catch {
      // keep previous banner on failure
    } finally {
      setBannerUploading(false)
    }
  }

  function handleSave() {
    updateStore(
      {
        themeId,
        themeConfig: JSON.stringify({
          accentColor,
          font,
          logoUrl,
          showStoreName,
          heroImageUrl,
          bannerType,
          bannerUrl,
          bannerColor,
          bannerPattern,
          bannerPlacement,
          heroLayout,
          heroHeight,
          heroTextPosition,
          heroMobileImage,
          heroMobileImagePosition,
          heroMobileTextAlign,
          heroEyebrow,
          heroHeadline,
          heroSubheadline,
          seoTagline: seoTagline.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined,
          contactEmail,
          contactPhone,
          contactAddress,
          contactLatitude,
          contactLongitude,
          socialInstagram,
          socialFacebook,
          socialTiktok,
          socialYoutube,
          socialsPosition,
          showSaleCategory,
          showSaleCategoryIcon,
          navPageIds,
          categoryMenuMode,
          categoryMenuScope,
          categoryMenuSelectedIds,
          showLandingCategories,
          landingCategoryScope,
          landingCategorySelectedIds,
          landingCategoryColumns,
          footerContactForm,
          showContactInNav,
          contactLabel: contactLabel.trim() || undefined,
          codEnabled,
          codNotes,
          bankTransferEnabled,
          bankTransferNotes,
          shippingZones,
          freeShippingThreshold,
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

  const tokens: Required<ThemeConfig> = {
    accentColor,
    font,
    logoUrl,
    showStoreName,
    heroImageUrl,
    bannerType,
    bannerUrl,
    bannerColor,
    bannerPattern,
    bannerPlacement,
    heroLayout,
    heroHeight,
    heroTextPosition,
    heroMobileImage,
    heroMobileImagePosition,
    heroMobileTextAlign,
    heroEyebrow,
    heroHeadline,
    heroSubheadline,
    seoTagline,
    seoDescription,
    contactEmail,
    contactPhone,
    contactAddress,
    contactLatitude,
    contactLongitude,
    socialInstagram,
    socialFacebook,
    socialTiktok,
    socialYoutube,
    socialsPosition,
    showSaleCategory,
    showSaleCategoryIcon,
    navPageIds,
    categoryMenuMode,
    categoryMenuScope,
    categoryMenuSelectedIds,
    showLandingCategories,
    landingCategoryScope,
    landingCategorySelectedIds,
    landingCategoryColumns,
    footerContactForm,
    showContactInNav,
    contactLabel,
    codEnabled,
    codNotes,
    bankTransferEnabled,
    bankTransferNotes,
    shippingZones,
    freeShippingThreshold,
  }
  const selectableCategories = withSaleCategory((categories ?? []).filter(c => !c.parentCategoryId), showSaleCategory)
  const previewProducts = productsPage?.items.length ? productsPage.items : PLACEHOLDER_PRODUCTS
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

  return (
    <>
    <div className="flex flex-col gap-8 max-w-6xl pb-24">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Design &amp; Theme</h1>
        <p className="text-white/40 text-sm mt-1">Changes update the preview instantly — nothing goes live until you save.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">

        <div className="flex flex-col gap-6">

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-4">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Theme</h2>

            <div className="relative" ref={themePickerRef}>
              <button
                type="button"
                onClick={() => setThemePickerOpen(v => !v)}
                className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-[#14141c] px-3 py-2.5 text-left hover:border-white/25 transition-colors"
              >
                <div className="flex gap-1 shrink-0">
                  {getThemeDefinition(themeId).swatch.map((color, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{getThemeDefinition(themeId).label}</p>
                  <p className="text-white/40 text-xs leading-snug truncate">{getThemeDefinition(themeId).description}</p>
                </div>
                <svg
                  width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden
                  className={`shrink-0 text-white/40 transition-transform ${themePickerOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {themePickerOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-2 rounded-xl border border-white/10 bg-[#14141c] shadow-xl overflow-hidden">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        const isUntouched = accentColor === getThemeDefinition(themeId).defaultAccentColor
                        setThemeId(theme.id)
                        if (isUntouched) setAccentColor(theme.defaultAccentColor)
                        setThemePickerOpen(false)
                      }}
                      className={[
                        'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                        themeId === theme.id ? 'bg-fuchsia-500/10' : 'hover:bg-white/5',
                      ].join(' ')}
                    >
                      <div className="flex gap-1 shrink-0">
                        {theme.swatch.map((color, i) => (
                          <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{theme.label}</p>
                        <p className="text-white/40 text-xs leading-snug">{theme.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Colors &amp; Font</h2>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="input input-sm flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60 font-mono"
                />
              </div>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Font</label>
              <select
                value={font}
                onChange={e => setFont(e.target.value as Required<ThemeConfig>['font'])}
                className="select w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
              >
                <option value="sans">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Branding</h2>
            <ImageField label="Logo" value={logoUrl} uploading={logoUploading} onFile={handleLogoFile} onClear={() => setLogoUrl('')} />
            {logoUrl && (
              <label className="flex items-center gap-3 cursor-pointer -mt-2">
                <input
                  type="checkbox"
                  checked={showStoreName}
                  onChange={e => setShowStoreName(e.target.checked)}
                  className={`toggle toggle-sm ${showStoreName ? 'toggle-success' : 'toggle-error'}`}
                />
                <span className="text-sm text-white/70">Show store name next to logo</span>
              </label>
            )}
            <ImageField label="Hero Image" value={heroImageUrl} uploading={heroImageUploading} onFile={handleHeroImageFile} onClear={() => setHeroImageUrl('')} />
            <p className="text-white/30 text-xs -mt-3">Shown next to your hero text when Layout below is set to Image left/right.</p>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Banner</h2>
            <p className="text-white/30 text-xs -mt-3">A backdrop shown behind the hero section, or just behind the hero image.</p>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'image', label: 'Image' },
                  { value: 'color', label: 'Color' },
                  { value: 'pattern', label: 'Pattern' },
                ] as { value: BannerType; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBannerType(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                      bannerType === opt.value
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                        : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {bannerType === 'image' && (
              <ImageField label="Banner Image" value={bannerUrl} uploading={bannerUploading} onFile={handleBannerFile} onClear={() => setBannerUrl('')} />
            )}

            {bannerType === 'color' && (
              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bannerColor || '#111111'}
                    onChange={e => setBannerColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bannerColor}
                    onChange={e => setBannerColor(e.target.value)}
                    placeholder="#111111"
                    className="input input-sm flex-1 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 font-mono"
                  />
                </div>
              </div>
            )}

            {bannerType === 'pattern' && (
              <>
                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Pattern</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BANNER_PATTERNS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setBannerPattern(opt.value)}
                        className={[
                          'rounded-lg border px-2 py-2 text-xs font-medium text-center transition-colors',
                          bannerPattern === opt.value
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
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Tint Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bannerColor || accentColor}
                      onChange={e => setBannerColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bannerColor}
                      onChange={e => setBannerColor(e.target.value)}
                      placeholder={accentColor}
                      className="input input-sm flex-1 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Placement</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'section', label: 'Behind entire section' },
                  { value: 'behindImage', label: 'Behind hero image only' },
                ] as { value: BannerPlacement; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBannerPlacement(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                      bannerPlacement === opt.value
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                        : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {bannerPlacement === 'behindImage' && heroLayout === 'center' && (
                <p className="text-amber-400/80 text-xs mt-1">Set Layout to Image left/right below — centered hero has no image to place it behind.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Hero</h2>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Layout</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'center', label: 'Centered' },
                  { value: 'imageLeft', label: 'Image left' },
                  { value: 'imageRight', label: 'Image right' },
                ] as { value: HeroLayout; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHeroLayout(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                      heroLayout === opt.value
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                        : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {heroLayout !== 'center' && !heroImageUrl && (
                <p className="text-amber-400/80 text-xs mt-1">Add a Hero Image above — this layout falls back to centered without one.</p>
              )}
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Height</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' },
                ] as { value: HeroHeight; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHeroHeight(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                      heroHeight === opt.value
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
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Text Position</label>
              <div className="grid grid-cols-3 gap-1.5 w-32">
                {HERO_TEXT_POSITIONS.map(pos => {
                  const [v, h] = pos.split('-') as ['top' | 'middle' | 'bottom', 'left' | 'center' | 'right']
                  const justify = h === 'left' ? 'justify-start' : h === 'right' ? 'justify-end' : 'justify-center'
                  const items = v === 'top' ? 'items-start' : v === 'bottom' ? 'items-end' : 'items-center'
                  const active = heroTextPosition === pos
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setHeroTextPosition(pos)}
                      aria-label={pos}
                      className={[
                        'aspect-square rounded-md border flex p-1.5 transition-colors',
                        justify,
                        items,
                        active ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-white/10 bg-white/4 hover:border-white/25',
                      ].join(' ')}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-fuchsia-400' : 'bg-white/40'}`} />
                    </button>
                  )
                })}
              </div>
              <p className="text-white/30 text-xs mt-1">Where the headline/text sits within the hero — also sets text alignment.</p>
            </div>

            <div className="fieldset gap-3 pt-3 border-t border-white/5">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Mobile overrides</p>

              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Hero image on mobile</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'show', label: 'Show' },
                    { value: 'hide', label: 'Hide' },
                  ] as { value: HeroMobileImageVisibility; label: string }[]).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setHeroMobileImage(opt.value)}
                      className={[
                        'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                        heroMobileImage === opt.value
                          ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                          : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {heroLayout !== 'center' && heroMobileImage === 'show' && (
                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Image position on mobile</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'inherit', label: 'Auto' },
                      { value: 'top', label: 'Top' },
                      { value: 'bottom', label: 'Bottom' },
                    ] as { value: HeroMobileImagePosition; label: string }[]).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setHeroMobileImagePosition(opt.value)}
                        className={[
                          'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                          heroMobileImagePosition === opt.value
                            ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                            : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                        ].join(' ')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-white/30 text-xs mt-1">Stack order on narrow screens — independent of the left/right layout above.</p>
                </div>
              )}

              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Text alignment on mobile</label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { value: 'inherit', label: 'Auto' },
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                  ] as { value: HeroMobileTextAlign; label: string }[]).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setHeroMobileTextAlign(opt.value)}
                      className={[
                        'rounded-lg border px-2 py-2 text-xs font-medium text-center transition-colors',
                        heroMobileTextAlign === opt.value
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

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Eyebrow</label>
              <input
                type="text"
                value={heroEyebrow}
                onChange={e => setHeroEyebrow(e.target.value)}
                placeholder="მოგესალმებით"
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
              <p className="text-white/30 text-xs">The small label above the headline. Clear it to hide entirely.</p>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Headline</label>
              <input
                type="text"
                value={heroHeadline}
                onChange={e => setHeroHeadline(e.target.value)}
                placeholder={store.name}
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Subheadline</label>
              <textarea
                value={heroSubheadline}
                onChange={e => setHeroSubheadline(e.target.value)}
                rows={2}
                className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
              />
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
          {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Save Theme'}
        </button>
      </div>
    </div>
    </>
  )
}
