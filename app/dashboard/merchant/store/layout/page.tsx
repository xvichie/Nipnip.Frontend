'use client'

import { useEffect, useState } from 'react'
import { useMyCategories, useMyCollections, useMyPages, useMyProducts, useMyStore, useUpdateMyStore } from '@/lib/queries/storefront-admin'
import { DEFAULT_THEME_CONFIG, getHomeSectionOrder, HOME_SECTION_KEYS, parseThemeConfig } from '@/lib/store/theme-config'
import { getLandingCollections } from '@/lib/store/landing-collections'
import { withSaleCategory } from '@/lib/store/sale-category'
import { isThemeId, SURFACE_CLASSES } from '@/lib/storefront-themes'
import { StorefrontCartProvider } from '@/lib/store/storefront-cart-context'
import { uploadImage } from '@/lib/uploadImage'
import { PreviewFrame, type PreviewMode } from '@/components/dashboard/store/PreviewFrame'
import { AnnouncementBar } from '@/components/storefront/shared/AnnouncementBar'
import { FeaturedProductsPicker } from '@/components/dashboard/store/FeaturedProductsPicker'
import { CImg } from '@/components/ui/CImg'
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
  ContentImagePosition,
  FeaturedProductsMode,
  FooterContactFormPosition,
  FooterLinkColumn,
  HomeSectionKey,
  LandingCategoryColumns,
  ProductSummaryResponse,
  SocialsPosition,
  ThemeConfig,
  ThemeId,
} from '@/lib/types/storefront'

const LANDING_COLLECTION_PRODUCT_LIMITS = [6, 8, 12, 16] as const

const DAY_LABELS = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი']

const HEADERS = { minimal: MinimalHeader, bold: BoldHeader, classic: ClassicHeader, luxury: LuxuryHeader, vibrant: VibrantHeader, commerce: CommerceHeader, editorial: EditorialHeader }
const FOOTERS = { minimal: MinimalFooter, bold: BoldFooter, classic: ClassicFooter, luxury: LuxuryFooter, vibrant: VibrantFooter, commerce: CommerceFooter, editorial: EditorialFooter }
const HOMES = { minimal: MinimalHome, bold: BoldHome, classic: ClassicHome, luxury: LuxuryHome, vibrant: VibrantHome, commerce: CommerceHome, editorial: EditorialHome }

const PLACEHOLDER_PRODUCTS: ProductSummaryResponse[] = [
  { id: 'preview-1', slug: 'preview-1', categoryId: null, name: 'Sample Product', basePrice: 49.99, salePrice: null, isActive: true, thumbnailUrl: null, createdAt: new Date().toISOString(), collectionIds: [] },
  { id: 'preview-2', slug: 'preview-2', categoryId: null, name: 'Another Item', basePrice: 89, salePrice: null, isActive: true, thumbnailUrl: null, createdAt: new Date().toISOString(), collectionIds: [] },
  { id: 'preview-3', slug: 'preview-3', categoryId: null, name: 'Best Seller', basePrice: 129.5, salePrice: 99.5, isActive: true, thumbnailUrl: null, createdAt: new Date().toISOString(), collectionIds: [] },
  { id: 'preview-4', slug: 'preview-4', categoryId: null, name: 'New Arrival', basePrice: 34, salePrice: null, isActive: true, thumbnailUrl: null, createdAt: new Date().toISOString(), collectionIds: [] },
]

const SECTION_META: Record<HomeSectionKey, { label: string; description: string }> = {
  hero: { label: 'Hero', description: 'Top banner with headline, image, and call to action.' },
  categories: { label: 'Categories Grid', description: 'A grid of category tiles below the hero.' },
  products: { label: 'Product Grid', description: 'Your full product listing.' },
  collections: { label: 'Collections', description: 'Horizontally-scrolling rows of your curated product collections.' },
  faq: { label: 'FAQ', description: 'A collapsible list of questions and answers — configured below.' },
  content: { label: 'Content Block', description: 'An "About us" style section with a heading, text, image, and button — configured below.' },
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
  const { data: collections } = useMyCollections()
  const { data: pages } = useMyPages()
  const { data: productsPage, isLoading: productsLoading } = useMyProducts({ page: 1, pageSize: 8 })
  const { data: allProductsPage } = useMyProducts({ page: 1, pageSize: 200 })
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
  const [showLandingCollections, setShowLandingCollections] = useState(DEFAULT_THEME_CONFIG.showLandingCollections)
  const [landingCollectionScope, setLandingCollectionScope] = useState<CategoryMenuScope>(DEFAULT_THEME_CONFIG.landingCollectionScope)
  const [landingCollectionSelectedIds, setLandingCollectionSelectedIds] = useState<string[]>(DEFAULT_THEME_CONFIG.landingCollectionSelectedIds)
  const [landingCollectionOrder, setLandingCollectionOrder] = useState<string[]>(DEFAULT_THEME_CONFIG.landingCollectionOrder)
  const [landingCollectionTitleOverrides, setLandingCollectionTitleOverrides] = useState<Record<string, string>>(DEFAULT_THEME_CONFIG.landingCollectionTitleOverrides)
  const [landingCollectionProductLimit, setLandingCollectionProductLimit] = useState(DEFAULT_THEME_CONFIG.landingCollectionProductLimit)
  const [footerContactForm, setFooterContactForm] = useState<FooterContactFormPosition>(DEFAULT_THEME_CONFIG.footerContactForm)
  const [socialsPosition, setSocialsPosition] = useState<SocialsPosition>(DEFAULT_THEME_CONFIG.socialsPosition)
  const [featuredProductsMode, setFeaturedProductsMode] = useState<FeaturedProductsMode>(DEFAULT_THEME_CONFIG.featuredProductsMode)
  const [featuredProductIds, setFeaturedProductIds] = useState<string[]>(DEFAULT_THEME_CONFIG.featuredProductIds)
  const [contentHeading, setContentHeading] = useState('')
  const [contentBody, setContentBody] = useState('')
  const [contentImageUrl, setContentImageUrl] = useState('')
  const [contentImagePosition, setContentImagePosition] = useState<ContentImagePosition>(DEFAULT_THEME_CONFIG.contentImagePosition)
  const [contentButtonText, setContentButtonText] = useState('')
  const [contentButtonLink, setContentButtonLink] = useState('')
  const [contentImageUploading, setContentImageUploading] = useState(false)
  const [announcementEnabled, setAnnouncementEnabled] = useState(DEFAULT_THEME_CONFIG.announcementEnabled)
  const [announcementText, setAnnouncementText] = useState('')
  const [announcementColor, setAnnouncementColor] = useState(DEFAULT_THEME_CONFIG.announcementColor)
  const [announcementLink, setAnnouncementLink] = useState('')
  const [announcementDismissible, setAnnouncementDismissible] = useState(DEFAULT_THEME_CONFIG.announcementDismissible)
  const [footerCopyrightText, setFooterCopyrightText] = useState(DEFAULT_THEME_CONFIG.footerCopyrightText)
  const [showPlatformAttribution, setShowPlatformAttribution] = useState(DEFAULT_THEME_CONFIG.showPlatformAttribution)
  const [footerShowPaymentIcons, setFooterShowPaymentIcons] = useState(DEFAULT_THEME_CONFIG.footerShowPaymentIcons)
  const [footerShowLogo, setFooterShowLogo] = useState(DEFAULT_THEME_CONFIG.footerShowLogo)
  const [footerLinkColumns, setFooterLinkColumns] = useState<FooterLinkColumn[]>(DEFAULT_THEME_CONFIG.footerLinkColumns)
  const [lowStockThreshold, setLowStockThreshold] = useState(DEFAULT_THEME_CONFIG.lowStockThreshold)
  const [lowStockMessage, setLowStockMessage] = useState(DEFAULT_THEME_CONFIG.lowStockMessage)
  const [showRelatedProducts, setShowRelatedProducts] = useState(DEFAULT_THEME_CONFIG.showRelatedProducts)
  const [relatedProductsHeading, setRelatedProductsHeading] = useState(DEFAULT_THEME_CONFIG.relatedProductsHeading)
  const [deliveryEstimateText, setDeliveryEstimateText] = useState(DEFAULT_THEME_CONFIG.deliveryEstimateText)
  const [trustBadges, setTrustBadges] = useState<string[]>(DEFAULT_THEME_CONFIG.trustBadges)
  const [sizeGuideContent, setSizeGuideContent] = useState(DEFAULT_THEME_CONFIG.sizeGuideContent)
  const [checkoutNotesEnabled, setCheckoutNotesEnabled] = useState(DEFAULT_THEME_CONFIG.checkoutNotesEnabled)
  const [checkoutTosEnabled, setCheckoutTosEnabled] = useState(DEFAULT_THEME_CONFIG.checkoutTosEnabled)
  const [checkoutTosPageId, setCheckoutTosPageId] = useState(DEFAULT_THEME_CONFIG.checkoutTosPageId)
  const [checkoutThankYouHeading, setCheckoutThankYouHeading] = useState(DEFAULT_THEME_CONFIG.checkoutThankYouHeading)
  const [checkoutThankYouMessage, setCheckoutThankYouMessage] = useState(DEFAULT_THEME_CONFIG.checkoutThankYouMessage)
  const [showFaqSection, setShowFaqSection] = useState(DEFAULT_THEME_CONFIG.showFaqSection)
  const [faqHeading, setFaqHeading] = useState(DEFAULT_THEME_CONFIG.faqHeading)
  const [faqItems, setFaqItems] = useState(DEFAULT_THEME_CONFIG.faqItems)
  const [showStickyMobileCta, setShowStickyMobileCta] = useState(DEFAULT_THEME_CONFIG.showStickyMobileCta)
  const [storeHoursEnabled, setStoreHoursEnabled] = useState(DEFAULT_THEME_CONFIG.storeHoursEnabled)
  const [storeHours, setStoreHours] = useState(DEFAULT_THEME_CONFIG.storeHours)
  const [saleCountdownEnabled, setSaleCountdownEnabled] = useState(DEFAULT_THEME_CONFIG.saleCountdownEnabled)
  const [saleCountdownEndsAt, setSaleCountdownEndsAt] = useState(DEFAULT_THEME_CONFIG.saleCountdownEndsAt)
  const [saleCountdownText, setSaleCountdownText] = useState(DEFAULT_THEME_CONFIG.saleCountdownText)
  const [facebookPixelId, setFacebookPixelId] = useState(DEFAULT_THEME_CONFIG.facebookPixelId)
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(DEFAULT_THEME_CONFIG.googleAnalyticsId)
  const [tiktokPixelId, setTiktokPixelId] = useState(DEFAULT_THEME_CONFIG.tiktokPixelId)
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
    setShowLandingCollections(parsed.showLandingCollections)
    setLandingCollectionScope(parsed.landingCollectionScope)
    setLandingCollectionSelectedIds(parsed.landingCollectionSelectedIds)
    setLandingCollectionOrder(parsed.landingCollectionOrder)
    setLandingCollectionTitleOverrides(parsed.landingCollectionTitleOverrides)
    setLandingCollectionProductLimit(parsed.landingCollectionProductLimit)
    setFooterContactForm(parsed.footerContactForm)
    setSocialsPosition(parsed.socialsPosition)
    setFeaturedProductsMode(parsed.featuredProductsMode)
    setFeaturedProductIds(parsed.featuredProductIds)
    setContentHeading(parsed.contentHeading)
    setContentBody(parsed.contentBody)
    setContentImageUrl(parsed.contentImageUrl)
    setContentImagePosition(parsed.contentImagePosition)
    setContentButtonText(parsed.contentButtonText)
    setContentButtonLink(parsed.contentButtonLink)
    setAnnouncementEnabled(parsed.announcementEnabled)
    setAnnouncementText(parsed.announcementText)
    setAnnouncementColor(parsed.announcementColor)
    setAnnouncementLink(parsed.announcementLink)
    setAnnouncementDismissible(parsed.announcementDismissible)
    setFooterCopyrightText(parsed.footerCopyrightText)
    setShowPlatformAttribution(parsed.showPlatformAttribution)
    setFooterShowPaymentIcons(parsed.footerShowPaymentIcons)
    setFooterShowLogo(parsed.footerShowLogo)
    setFooterLinkColumns(parsed.footerLinkColumns)
    setLowStockThreshold(parsed.lowStockThreshold)
    setLowStockMessage(parsed.lowStockMessage)
    setShowRelatedProducts(parsed.showRelatedProducts)
    setRelatedProductsHeading(parsed.relatedProductsHeading)
    setDeliveryEstimateText(parsed.deliveryEstimateText)
    setTrustBadges(parsed.trustBadges)
    setSizeGuideContent(parsed.sizeGuideContent)
    setCheckoutNotesEnabled(parsed.checkoutNotesEnabled)
    setCheckoutTosEnabled(parsed.checkoutTosEnabled)
    setCheckoutTosPageId(parsed.checkoutTosPageId)
    setCheckoutThankYouHeading(parsed.checkoutThankYouHeading)
    setCheckoutThankYouMessage(parsed.checkoutThankYouMessage)
    setShowFaqSection(parsed.showFaqSection)
    setFaqHeading(parsed.faqHeading)
    setFaqItems(parsed.faqItems)
    setShowStickyMobileCta(parsed.showStickyMobileCta)
    setStoreHoursEnabled(parsed.storeHoursEnabled)
    setStoreHours(parsed.storeHours)
    setSaleCountdownEnabled(parsed.saleCountdownEnabled)
    setSaleCountdownEndsAt(parsed.saleCountdownEndsAt)
    setSaleCountdownText(parsed.saleCountdownText)
    setFacebookPixelId(parsed.facebookPixelId)
    setGoogleAnalyticsId(parsed.googleAnalyticsId)
    setTiktokPixelId(parsed.tiktokPixelId)
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

  function toggleLandingCollectionSelected(id: string) {
    setLandingCollectionSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  function setLandingCollectionTitleOverride(id: string, title: string) {
    setLandingCollectionTitleOverrides(prev => {
      const next = { ...prev }
      if (title.trim()) next[id] = title
      else delete next[id]
      return next
    })
  }

  // Operates on the currently-displayed order (visible collections, in their current order)
  // rather than the raw landingCollectionOrder state, so newly-created collections that were
  // just appended at the end (see getLandingCollections) get persisted into their shown position
  // the first time they're reordered.
  function moveLandingCollection(id: string, direction: -1 | 1, visibleIds: string[]) {
    const index = visibleIds.indexOf(id)
    const nextIndex = index + direction
    if (index === -1 || nextIndex < 0 || nextIndex >= visibleIds.length) return
    const next = [...visibleIds]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    setLandingCollectionOrder(next)
  }

  function addFooterLinkColumn() {
    setFooterLinkColumns(prev => [...prev, { title: '', links: [] }])
  }

  function removeFooterLinkColumn(index: number) {
    setFooterLinkColumns(prev => prev.filter((_, i) => i !== index))
  }

  function updateFooterLinkColumnTitle(index: number, title: string) {
    setFooterLinkColumns(prev => prev.map((c, i) => (i === index ? { ...c, title } : c)))
  }

  function addFooterLink(columnIndex: number) {
    setFooterLinkColumns(prev => prev.map((c, i) => (i === columnIndex ? { ...c, links: [...c.links, { label: '', url: '' }] } : c)))
  }

  function removeFooterLink(columnIndex: number, linkIndex: number) {
    setFooterLinkColumns(prev => prev.map((c, i) => (i === columnIndex ? { ...c, links: c.links.filter((_, j) => j !== linkIndex) } : c)))
  }

  function updateFooterLink(columnIndex: number, linkIndex: number, field: 'label' | 'url', value: string) {
    setFooterLinkColumns(prev => prev.map((c, i) => (
      i === columnIndex ? { ...c, links: c.links.map((l, j) => (j === linkIndex ? { ...l, [field]: value } : l)) } : c
    )))
  }

  function addTrustBadge() {
    setTrustBadges(prev => [...prev, ''])
  }

  function removeTrustBadge(index: number) {
    setTrustBadges(prev => prev.filter((_, i) => i !== index))
  }

  function updateTrustBadge(index: number, value: string) {
    setTrustBadges(prev => prev.map((b, i) => (i === index ? value : b)))
  }

  function addFaqItem() {
    setFaqItems(prev => [...prev, { question: '', answer: '' }])
  }

  function removeFaqItem(index: number) {
    setFaqItems(prev => prev.filter((_, i) => i !== index))
  }

  function updateFaqItem(index: number, field: 'question' | 'answer', value: string) {
    setFaqItems(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function updateStoreHoursDay(day: number, field: 'open' | 'close' | 'closed', value: string | boolean) {
    setStoreHours(prev => prev.map(d => (d.day === day ? { ...d, [field]: value } : d)))
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
          showLandingCollections,
          landingCollectionScope,
          landingCollectionSelectedIds,
          landingCollectionOrder,
          landingCollectionTitleOverrides,
          landingCollectionProductLimit,
          footerContactForm,
          socialsPosition,
          featuredProductsMode,
          featuredProductIds,
          contentHeading: contentHeading.trim() || undefined,
          contentBody: contentBody.trim() || undefined,
          contentImageUrl,
          contentImagePosition,
          contentButtonText: contentButtonText.trim() || undefined,
          contentButtonLink: contentButtonLink.trim() || undefined,
          announcementEnabled,
          announcementText: announcementText.trim() || undefined,
          announcementColor,
          announcementLink: announcementLink.trim() || undefined,
          announcementDismissible,
          footerCopyrightText: footerCopyrightText.trim() || undefined,
          showPlatformAttribution,
          footerShowPaymentIcons,
          footerShowLogo,
          footerLinkColumns,
          lowStockThreshold,
          lowStockMessage: lowStockMessage.trim() || undefined,
          showRelatedProducts,
          relatedProductsHeading: relatedProductsHeading.trim() || undefined,
          deliveryEstimateText: deliveryEstimateText.trim() || undefined,
          trustBadges,
          sizeGuideContent: sizeGuideContent.trim() || undefined,
          checkoutNotesEnabled,
          checkoutTosEnabled,
          checkoutTosPageId,
          checkoutThankYouHeading: checkoutThankYouHeading.trim() || undefined,
          checkoutThankYouMessage: checkoutThankYouMessage.trim() || undefined,
          showFaqSection,
          faqHeading: faqHeading.trim() || undefined,
          faqItems,
          showStickyMobileCta,
          storeHoursEnabled,
          storeHours,
          saleCountdownEnabled,
          saleCountdownEndsAt,
          saleCountdownText: saleCountdownText.trim() || undefined,
          facebookPixelId: facebookPixelId.trim() || undefined,
          googleAnalyticsId: googleAnalyticsId.trim() || undefined,
          tiktokPixelId: tiktokPixelId.trim() || undefined,
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
    showLandingCollections,
    landingCollectionScope,
    landingCollectionSelectedIds,
    landingCollectionOrder,
    landingCollectionTitleOverrides,
    landingCollectionProductLimit,
    footerContactForm,
    socialsPosition,
    featuredProductsMode,
    featuredProductIds,
    contentHeading,
    contentBody,
    contentImageUrl,
    contentImagePosition,
    contentButtonText,
    contentButtonLink,
    announcementEnabled,
    announcementText,
    announcementColor,
    announcementLink,
    announcementDismissible,
    footerCopyrightText,
    showPlatformAttribution,
    footerShowPaymentIcons,
    footerShowLogo,
    footerLinkColumns,
    lowStockThreshold,
    lowStockMessage,
    showRelatedProducts,
    relatedProductsHeading,
    deliveryEstimateText,
    trustBadges,
    sizeGuideContent,
    checkoutNotesEnabled,
    checkoutTosEnabled,
    checkoutTosPageId,
    checkoutThankYouHeading,
    checkoutThankYouMessage,
    showFaqSection,
    faqHeading,
    faqItems,
    showStickyMobileCta,
    storeHoursEnabled,
    storeHours,
    saleCountdownEnabled,
    saleCountdownEndsAt,
    saleCountdownText,
    facebookPixelId,
    googleAnalyticsId,
    tiktokPixelId,
  }

  const themeId: ThemeId = isThemeId(store.themeId) ? store.themeId : 'minimal'
  const selectableCategories = withSaleCategory((categories ?? []).filter(c => !c.parentCategoryId), tokens.showSaleCategory)
  const visibleCollections = getLandingCollections(collections ?? [], tokens)
  const allProductsById = new Map((allProductsPage?.items ?? []).map(p => [p.id, p]))
  const curatedPreviewProducts = featuredProductIds
    .map(id => allProductsById.get(id))
    .filter((p): p is ProductSummaryResponse => !!p)
  const previewProducts = featuredProductsMode === 'curated'
    ? curatedPreviewProducts
    : productsPage?.items.length
      ? productsPage.items
      : productsLoading ? [] : PLACEHOLDER_PRODUCTS
  // Preview approximation only — built from the same already-fetched allProductsPage rather than
  // a per-collection network request; order isn't authoritative here since SortOrder isn't in the
  // product DTO, which is fine for a live preview.
  const collectionProducts = new Map(
    (collections ?? []).map(collection => [
      collection.id,
      (allProductsPage?.items ?? []).filter(p => p.collectionIds.includes(collection.id)),
    ])
  )
  const HeaderPreview = HEADERS[themeId]
  const FooterPreview = FOOTERS[themeId]
  const HomePreview = HOMES[themeId]

  const previewContent = (
    <StorefrontCartProvider slug={store.slug} preview>
      <AnnouncementBar slug={store.slug} tokens={tokens} />
      <HeaderPreview slug={store.slug} storeName={store.name} categories={categories ?? []} pages={pages ?? []} tokens={tokens} />
      <HomePreview
        slug={store.slug}
        store={store}
        categories={categories ?? []}
        collections={collections ?? []}
        collectionProducts={collectionProducts}
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Announcement Bar</h2>
                <p className="text-white/30 text-xs mt-1">A thin strip above your header, shown on every page.</p>
              </div>
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={e => setAnnouncementEnabled(e.target.checked)}
                className={`toggle toggle-sm shrink-0 ${announcementEnabled ? 'toggle-success' : ''}`}
              />
            </div>

            {announcementEnabled && (
              <>
                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Message</label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={e => setAnnouncementText(e.target.value)}
                    placeholder="🚚 Free shipping on orders over 100₾"
                    className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="fieldset gap-2 flex-1">
                    <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Background color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={announcementColor}
                        onChange={e => setAnnouncementColor(e.target.value)}
                        className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={announcementColor}
                        onChange={e => setAnnouncementColor(e.target.value)}
                        className="input input-sm flex-1 bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                      />
                    </div>
                    <p className="text-white/30 text-xs">Text color is picked automatically for readability.</p>
                  </div>
                </div>

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Link (optional)</label>
                  <input
                    type="text"
                    value={announcementLink}
                    onChange={e => setAnnouncementLink(e.target.value)}
                    placeholder="/products/category/sale"
                    className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementDismissible}
                    onChange={e => setAnnouncementDismissible(e.target.checked)}
                    className={`toggle toggle-sm ${announcementDismissible ? 'toggle-success' : ''}`}
                  />
                  <span className="text-sm text-white/70">Visitors can close it</span>
                </label>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Product Grid Content</h2>
              <p className="text-white/30 text-xs mt-1">What shows in the homepage Product Grid section.</p>
            </div>
            <div className="fieldset gap-2">
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'latest', label: 'Newest products' },
                  { value: 'curated', label: 'Hand-picked' },
                ] as { value: FeaturedProductsMode; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFeaturedProductsMode(opt.value)}
                    className={[
                      'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                      featuredProductsMode === opt.value
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

          {featuredProductsMode === 'curated' && (
            <FeaturedProductsPicker
              pickedIds={featuredProductIds}
              onChange={setFeaturedProductIds}
              resolveMap={allProductsById}
            />
          )}

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Content Block</h2>
              <p className="text-white/30 text-xs mt-1">
                An optional &quot;About us&quot; style section — enable it above under Home Page Sections once it has a heading or text.
              </p>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Heading</label>
              <input
                type="text"
                value={contentHeading}
                onChange={e => setContentHeading(e.target.value)}
                placeholder="Why shop with us"
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Text</label>
              <textarea
                value={contentBody}
                onChange={e => setContentBody(e.target.value)}
                rows={4}
                className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
              />
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Image (optional)</label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/4 shrink-0 flex items-center justify-center">
                  {contentImageUploading ? (
                    <span className="loading loading-spinner loading-sm text-fuchsia-400" />
                  ) : contentImageUrl ? (
                    <CImg src={contentImageUrl} alt="" className="w-full h-full object-cover" />
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
                      onChange={async e => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        setContentImageUploading(true)
                        try {
                          setContentImageUrl(await uploadImage(f))
                        } finally {
                          setContentImageUploading(false)
                        }
                      }}
                    />
                  </label>
                  {contentImageUrl && (
                    <button type="button" onClick={() => setContentImageUrl('')} className="text-xs text-white/30 hover:text-red-400 text-left">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {contentImageUrl && (
              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Image position</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'left', label: 'Left' },
                    { value: 'right', label: 'Right' },
                  ] as { value: ContentImagePosition; label: string }[]).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setContentImagePosition(opt.value)}
                      className={[
                        'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                        contentImagePosition === opt.value
                          ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                          : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Button text</label>
                <input
                  type="text"
                  value={contentButtonText}
                  onChange={e => setContentButtonText(e.target.value)}
                  placeholder="Learn more"
                  className="input input-sm w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                />
              </div>
              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Button link</label>
                <input
                  type="text"
                  value={contentButtonLink}
                  onChange={e => setContentButtonLink(e.target.value)}
                  placeholder="/pages/about"
                  className="input input-sm w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                />
              </div>
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
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Collections Section</h2>
                <p className="text-white/30 text-xs mt-1">Horizontally-scrolling rows of your product collections, shown on the home page.</p>
              </div>
              <input
                type="checkbox"
                checked={showLandingCollections}
                onChange={e => setShowLandingCollections(e.target.checked)}
                className={`toggle toggle-sm shrink-0 ${showLandingCollections ? 'toggle-success' : 'toggle-error'}`}
              />
            </label>

            {showLandingCollections && (
              <>
                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Which collections</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'all', label: 'All collections' },
                      { value: 'selected', label: 'Choose collections' },
                    ] as { value: CategoryMenuScope; label: string }[]).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLandingCollectionScope(opt.value)}
                        className={[
                          'rounded-lg border px-3 py-2 text-xs font-medium text-left transition-colors',
                          landingCollectionScope === opt.value
                            ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                            : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                        ].join(' ')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {landingCollectionScope === 'selected' && (
                  <div className="flex flex-col gap-1.5">
                    {(collections ?? []).length === 0 ? (
                      <p className="text-white/30 text-xs">No collections yet.</p>
                    ) : (
                      (collections ?? []).map(collection => (
                        <label
                          key={collection.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer"
                        >
                          <span className="text-sm text-white/70">{collection.name}</span>
                          <input
                            type="checkbox"
                            checked={landingCollectionSelectedIds.includes(collection.id)}
                            onChange={() => toggleLandingCollectionSelected(collection.id)}
                            className="toggle toggle-sm"
                          />
                        </label>
                      ))
                    )}
                  </div>
                )}

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Order &amp; titles</label>
                  {visibleCollections.length === 0 ? (
                    <p className="text-white/30 text-xs">No visible collections.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {visibleCollections.map((collection, index) => (
                        <div key={collection.id} className="flex items-center gap-2 rounded-xl bg-white/2 border border-white/5 px-3 py-2">
                          <UpDownButtons
                            disabledUp={index === 0}
                            disabledDown={index === visibleCollections.length - 1}
                            onUp={() => moveLandingCollection(collection.id, -1, visibleCollections.map(c => c.id))}
                            onDown={() => moveLandingCollection(collection.id, 1, visibleCollections.map(c => c.id))}
                          />
                          <input
                            type="text"
                            value={landingCollectionTitleOverrides[collection.id] ?? ''}
                            onChange={e => setLandingCollectionTitleOverride(collection.id, e.target.value)}
                            placeholder={collection.name}
                            className="input input-sm flex-1 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-white/30 text-xs mt-1">Optional heading override per collection — defaults to the collection&apos;s own name.</p>
                </div>

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Products per row</label>
                  <div className="grid grid-cols-4 gap-2">
                    {LANDING_COLLECTION_PRODUCT_LIMITS.map(limit => (
                      <button
                        key={limit}
                        type="button"
                        onClick={() => setLandingCollectionProductLimit(limit)}
                        className={[
                          'rounded-lg border px-3 py-2 text-xs font-medium text-center transition-colors',
                          landingCollectionProductLimit === limit
                            ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white'
                            : 'border-white/10 bg-white/4 text-white/50 hover:text-white',
                        ].join(' ')}
                      >
                        {limit}
                      </button>
                    ))}
                  </div>
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

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Footer</h2>
              <p className="text-white/30 text-xs mt-1">Copyright line, branding, payment badges, and custom link columns shown in your storefront&apos;s footer.</p>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Copyright text</label>
              <input
                type="text"
                value={footerCopyrightText}
                onChange={e => setFooterCopyrightText(e.target.value)}
                placeholder={`© ${new Date().getFullYear()} ${store.name}`}
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>

            <label className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer">
              <span className="text-sm text-white/70">Show store logo in footer</span>
              <input
                type="checkbox"
                checked={footerShowLogo}
                onChange={e => setFooterShowLogo(e.target.checked)}
                className={`toggle toggle-sm ${footerShowLogo ? 'toggle-success' : ''}`}
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer">
              <span className="text-sm text-white/70">Show accepted payment methods</span>
              <input
                type="checkbox"
                checked={footerShowPaymentIcons}
                onChange={e => setFooterShowPaymentIcons(e.target.checked)}
                className={`toggle toggle-sm ${footerShowPaymentIcons ? 'toggle-success' : ''}`}
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer">
              <span className="text-sm text-white/70">Show &quot;Made by NipNip&quot; attribution</span>
              <input
                type="checkbox"
                checked={showPlatformAttribution}
                onChange={e => setShowPlatformAttribution(e.target.checked)}
                className={`toggle toggle-sm ${showPlatformAttribution ? 'toggle-success' : 'toggle-error'}`}
              />
            </label>

            <div className="fieldset gap-2 pt-2 border-t border-white/5">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Custom link columns</label>
              <p className="text-white/30 text-xs -mt-1 mb-1">Add grouped links (e.g. &quot;Shop&quot;, &quot;Help&quot;) shown alongside your Pages in the footer.</p>
              <div className="flex flex-col gap-3">
                {footerLinkColumns.map((column, columnIndex) => (
                  <div key={columnIndex} className="rounded-xl bg-white/2 border border-white/5 p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={column.title}
                        onChange={e => updateFooterLinkColumnTitle(columnIndex, e.target.value)}
                        placeholder="Column title (e.g. Shop)"
                        className="input input-xs flex-1 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
                      />
                      <button
                        type="button"
                        onClick={() => removeFooterLinkColumn(columnIndex)}
                        className="btn btn-xs btn-circle bg-white/4 border-white/10 text-white/50 hover:text-white shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                    {column.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="flex items-center gap-2 pl-3">
                        <input
                          type="text"
                          value={link.label}
                          onChange={e => updateFooterLink(columnIndex, linkIndex, 'label', e.target.value)}
                          placeholder="Label"
                          className="input input-xs w-28 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={e => updateFooterLink(columnIndex, linkIndex, 'url', e.target.value)}
                          placeholder="https://…"
                          className="input input-xs flex-1 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
                        />
                        <button
                          type="button"
                          onClick={() => removeFooterLink(columnIndex, linkIndex)}
                          className="btn btn-xs btn-circle bg-white/4 border-white/10 text-white/50 hover:text-white shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addFooterLink(columnIndex)}
                      className="btn btn-xs self-start bg-white/4 border-white/10 text-white/60 hover:text-white"
                    >
                      + Link
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addFooterLinkColumn}
                className="btn btn-xs self-start bg-white/4 border-white/10 text-white/60 hover:text-white"
              >
                + Column
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Product Page</h2>
              <p className="text-white/30 text-xs mt-1">Low-stock urgency, related products, delivery info, trust badges, and a size guide shown on every product page.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Low-stock threshold</label>
                <input
                  type="number"
                  min="0"
                  value={lowStockThreshold ?? ''}
                  onChange={e => setLowStockThreshold(e.target.value === '' ? null : Number(e.target.value))}
                  placeholder="Off"
                  className="input input-sm w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                />
              </div>
              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Message</label>
                <input
                  type="text"
                  value={lowStockMessage}
                  onChange={e => setLowStockMessage(e.target.value)}
                  placeholder="მხოლოდ {n} ცალია დარჩენილი!"
                  className="input input-sm w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                />
              </div>
            </div>
            <p className="text-white/30 text-xs -mt-3">Shown once stock drops to or below the threshold. Use {'{n}'} in the message for the actual count.</p>

            <label className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer">
              <span className="text-sm text-white/70">Show related products section</span>
              <input
                type="checkbox"
                checked={showRelatedProducts}
                onChange={e => setShowRelatedProducts(e.target.checked)}
                className={`toggle toggle-sm ${showRelatedProducts ? 'toggle-success' : 'toggle-error'}`}
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer">
              <span className="text-sm text-white/70">Sticky mobile add-to-cart bar</span>
              <input
                type="checkbox"
                checked={showStickyMobileCta}
                onChange={e => setShowStickyMobileCta(e.target.checked)}
                className={`toggle toggle-sm ${showStickyMobileCta ? 'toggle-success' : ''}`}
              />
            </label>

            {showRelatedProducts && (
              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Related products heading</label>
                <input
                  type="text"
                  value={relatedProductsHeading}
                  onChange={e => setRelatedProductsHeading(e.target.value)}
                  placeholder="მსგავსი პროდუქტები"
                  className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                />
              </div>
            )}

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Delivery estimate</label>
              <input
                type="text"
                value={deliveryEstimateText}
                onChange={e => setDeliveryEstimateText(e.target.value)}
                placeholder="მიწოდება 2-4 დღეში"
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Trust badges</label>
              <div className="flex flex-col gap-2">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={badge}
                      onChange={e => updateTrustBadge(i, e.target.value)}
                      placeholder="100% ორიგინალი"
                      className="input input-sm flex-1 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
                    />
                    <button
                      type="button"
                      onClick={() => removeTrustBadge(i)}
                      className="btn btn-xs btn-circle bg-white/4 border-white/10 text-white/50 hover:text-white shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addTrustBadge}
                className="btn btn-xs self-start bg-white/4 border-white/10 text-white/60 hover:text-white"
              >
                + Badge
              </button>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Size guide</label>
              <textarea
                value={sizeGuideContent}
                onChange={e => setSizeGuideContent(e.target.value)}
                rows={4}
                placeholder="Leave empty to hide the size guide link"
                className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Checkout</h2>
              <p className="text-white/30 text-xs mt-1">A buyer note field, a Terms-of-Service checkbox, and the order-confirmation message.</p>
            </div>

            <label className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer">
              <span className="text-sm text-white/70">Let buyers leave a note at checkout</span>
              <input
                type="checkbox"
                checked={checkoutNotesEnabled}
                onChange={e => setCheckoutNotesEnabled(e.target.checked)}
                className={`toggle toggle-sm ${checkoutNotesEnabled ? 'toggle-success' : ''}`}
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl bg-white/2 border border-white/5 px-4 py-2.5 cursor-pointer">
              <span className="text-sm text-white/70">Require Terms of Service acceptance</span>
              <input
                type="checkbox"
                checked={checkoutTosEnabled}
                onChange={e => setCheckoutTosEnabled(e.target.checked)}
                className={`toggle toggle-sm ${checkoutTosEnabled ? 'toggle-success' : ''}`}
              />
            </label>

            {checkoutTosEnabled && (
              <div className="fieldset gap-2">
                <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Terms of Service page</label>
                {(!pages || pages.length === 0) ? (
                  <p className="text-white/30 text-xs">No pages yet — add one in the Pages section first.</p>
                ) : (
                  <select
                    value={checkoutTosPageId}
                    onChange={e => setCheckoutTosPageId(e.target.value)}
                    className="select w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                  >
                    <option value="">Choose a page…</option>
                    {pages.map(page => (
                      <option key={page.id} value={page.id}>{page.title}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Thank-you heading</label>
              <input
                type="text"
                value={checkoutThankYouHeading}
                onChange={e => setCheckoutThankYouHeading(e.target.value)}
                placeholder="შეკვეთა გაფორმდა!"
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Thank-you message</label>
              <textarea
                value={checkoutThankYouMessage}
                onChange={e => setCheckoutThankYouMessage(e.target.value)}
                rows={2}
                placeholder="Leave empty to keep the default order-confirmation message"
                className="textarea w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60 resize-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">FAQ Section</h2>
                <p className="text-white/30 text-xs mt-1">A collapsible list of questions and answers, shown on your home page.</p>
              </div>
              <input
                type="checkbox"
                checked={showFaqSection}
                onChange={e => setShowFaqSection(e.target.checked)}
                className={`toggle toggle-sm shrink-0 ${showFaqSection ? 'toggle-success' : 'toggle-error'}`}
              />
            </label>

            {showFaqSection && (
              <>
                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Heading</label>
                  <input
                    type="text"
                    value={faqHeading}
                    onChange={e => setFaqHeading(e.target.value)}
                    placeholder="ხშირად დასმული კითხვები"
                    className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  {faqItems.map((item, index) => (
                    <div key={index} className="rounded-xl bg-white/2 border border-white/5 p-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.question}
                          onChange={e => updateFaqItem(index, 'question', e.target.value)}
                          placeholder="კითხვა"
                          className="input input-sm flex-1 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60"
                        />
                        <button
                          type="button"
                          onClick={() => removeFaqItem(index)}
                          className="btn btn-xs btn-circle bg-white/4 border-white/10 text-white/50 hover:text-white shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                      <textarea
                        value={item.answer}
                        onChange={e => updateFaqItem(index, 'answer', e.target.value)}
                        rows={2}
                        placeholder="პასუხი"
                        className="textarea textarea-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 resize-none"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addFaqItem}
                  className="btn btn-xs self-start bg-white/4 border-white/10 text-white/60 hover:text-white"
                >
                  + Question
                </button>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Store Hours</h2>
                <p className="text-white/30 text-xs mt-1">Shows a live &quot;open now&quot; / &quot;opens at&quot; badge in your storefront header.</p>
              </div>
              <input
                type="checkbox"
                checked={storeHoursEnabled}
                onChange={e => setStoreHoursEnabled(e.target.checked)}
                className={`toggle toggle-sm shrink-0 ${storeHoursEnabled ? 'toggle-success' : 'toggle-error'}`}
              />
            </label>

            {storeHoursEnabled && (
              <div className="flex flex-col gap-2">
                {storeHours.map(d => (
                  <div key={d.day} className="flex items-center gap-2 rounded-xl bg-white/2 border border-white/5 px-3 py-2">
                    <span className="w-24 text-xs text-white/60 shrink-0">{DAY_LABELS[d.day]}</span>
                    <input
                      type="time"
                      value={d.open}
                      disabled={d.closed}
                      onChange={e => updateStoreHoursDay(d.day, 'open', e.target.value)}
                      className="input input-xs flex-1 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 disabled:opacity-30"
                    />
                    <span className="text-white/30 text-xs">—</span>
                    <input
                      type="time"
                      value={d.close}
                      disabled={d.closed}
                      onChange={e => updateStoreHoursDay(d.day, 'close', e.target.value)}
                      className="input input-xs flex-1 bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 disabled:opacity-30"
                    />
                    <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={d.closed}
                        onChange={e => updateStoreHoursDay(d.day, 'closed', e.target.checked)}
                        className="toggle toggle-xs"
                      />
                      <span className="text-[10px] text-white/40">დაკეტილია</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Sale Countdown</h2>
                <p className="text-white/30 text-xs mt-1">An urgency bar counting down to a set end time — great for flash sales.</p>
              </div>
              <input
                type="checkbox"
                checked={saleCountdownEnabled}
                onChange={e => setSaleCountdownEnabled(e.target.checked)}
                className={`toggle toggle-sm shrink-0 ${saleCountdownEnabled ? 'toggle-success' : 'toggle-error'}`}
              />
            </label>

            {saleCountdownEnabled && (
              <>
                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Ends at</label>
                  <input
                    type="datetime-local"
                    value={saleCountdownEndsAt ?? ''}
                    onChange={e => setSaleCountdownEndsAt(e.target.value || null)}
                    className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                  />
                  <p className="text-white/30 text-xs">The bar disappears on its own once this time passes.</p>
                </div>

                <div className="fieldset gap-2">
                  <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Message</label>
                  <input
                    type="text"
                    value={saleCountdownText}
                    onChange={e => setSaleCountdownText(e.target.value)}
                    placeholder="🔥 Sale ends in"
                    className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
                  />
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/2 p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Marketing &amp; Tracking</h2>
              <p className="text-white/30 text-xs mt-1">Fires standard page-view and purchase events for your own ad campaigns.</p>
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Facebook Pixel ID</label>
              <input
                type="text"
                value={facebookPixelId}
                onChange={e => setFacebookPixelId(e.target.value)}
                placeholder="1234567890123456"
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">Google Analytics Measurement ID</label>
              <input
                type="text"
                value={googleAnalyticsId}
                onChange={e => setGoogleAnalyticsId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
            </div>

            <div className="fieldset gap-2">
              <label className="fieldset-legend text-white/60 text-xs uppercase tracking-wider">TikTok Pixel ID</label>
              <input
                type="text"
                value={tiktokPixelId}
                onChange={e => setTiktokPixelId(e.target.value)}
                placeholder="CXXXXXXXXXXXXXXXXXXX"
                className="input w-full bg-white/4 border-white/10 focus:border-fuchsia-500/60"
              />
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
