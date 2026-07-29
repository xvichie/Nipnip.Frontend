import type { CSSProperties } from 'react'
import { getThemeDefinition, RADIUS_CLASS } from '@/lib/storefront-themes'
import { getThemeText } from '@/lib/store/translations'
import type { StorefrontLanguage } from '@/lib/storefront-i18n'
import type { AdminThemeOverride, CategoryResponse, HeroSlide, HomeSectionKey, ProductSummaryResponse, ThemeConfig, ThemeConfigTranslations } from '@/lib/types/storefront'

export const DEFAULT_THEME_CONFIG: Required<ThemeConfig> = {
  translations: {},
  defaultLanguage: 'ka',
  accentColor: '#111111',
  font: 'sans',
  cornerRadius: 'theme',
  sectionBackgroundColors: {},
  layoutWidth: 'full',
  boxedMaxWidth: 1400,
  boxedBackgroundColor: '#111111',
  logoUrl: '',
  showStoreName: false,
  heroImageUrl: '',
  heroVideoUrl: '',
  heroVideoMobileEnabled: false,
  heroImageFit: 'contain',
  heroImagePosition: 'center',
  bannerType: 'image',
  bannerUrl: '',
  bannerColor: '',
  bannerPattern: 'dots',
  bannerPlacement: 'section',
  heroLayout: 'center',
  heroHeight: 'medium',
  heroTextPosition: 'middle-center',
  heroMobileImage: 'show',
  heroMobileImagePosition: 'inherit',
  heroMobileTextAlign: 'inherit',
  heroEyebrow: 'მოგესალმებით',
  heroEyebrowSize: 'md',
  heroHeadline: '',
  heroHeadlineSize: 'md',
  heroSubheadline: '',
  heroSubheadlineSize: 'md',
  heroOverlayOpacity: 0,
  heroTextTheme: 'auto',
  heroCtaEnabled: true,
  heroCtaText: '',
  heroCtaLinkType: 'products',
  heroCtaCategoryId: '',
  heroCtaCustomUrl: '',
  heroSecondaryCtaEnabled: false,
  heroSecondaryCtaText: '',
  heroSecondaryCtaLinkType: 'products',
  heroSecondaryCtaCategoryId: '',
  heroSecondaryCtaCustomUrl: '',
  heroKenBurnsEnabled: false,
  heroScrollIndicatorEnabled: false,
  seoTagline: '',
  seoDescription: '',
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  contactLatitude: null,
  contactLongitude: null,
  socialInstagram: '',
  socialFacebook: '',
  socialTiktok: '',
  socialYoutube: '',
  socialsPosition: 'footer',
  showSaleCategory: false,
  showSaleCategoryIcon: true,
  navPageIds: [],
  searchBarLocation: 'productsPage',
  categoryMenuMode: 'flat',
  categoryMenuScope: 'all',
  categoryMenuSelectedIds: [],
  showLandingCategories: true,
  landingCategoryScope: 'all',
  landingCategorySelectedIds: [],
  landingCategoryColumns: 4,
  showLandingCollections: true,
  landingCollectionScope: 'all',
  landingCollectionSelectedIds: [],
  landingCollectionOrder: [],
  landingCollectionTitleOverrides: {},
  landingCollectionProductLimit: 12,
  footerContactForm: 'off',
  showContactInNav: false,
  contactLabel: 'კონტაქტი',
  homeSectionOrder: ['hero', 'categories', 'products'],
  featuredProductsMode: 'latest',
  featuredProductIds: [],
  contentHeading: '',
  contentBody: '',
  contentImageUrl: '',
  contentImagePosition: 'left',
  contentButtonText: '',
  contentButtonLink: '',
  announcementEnabled: false,
  announcementText: '',
  announcementColor: '#111111',
  announcementLink: '',
  announcementDismissible: true,
  badgeSaleEnabled: true,
  badgeSaleText: '',
  badgeSaleColor: '#dc2626',
  badgeNewEnabled: false,
  badgeNewText: '',
  badgeNewColor: '',
  badgeNewDays: 14,
  codEnabled: true,
  codNotes: '',
  bankTransferEnabled: true,
  bankTransferNotes: '',
  flittEnabled: false,
  tbcEnabled: false,
  bogEnabled: false,
  cityPayEnabled: false,
  shippingZones: [],
  freeShippingThreshold: null,
  footerCopyrightText: '',
  showPlatformAttribution: true,
  footerShowPaymentIcons: false,
  footerShowLogo: false,
  faviconUrl: '',
  socialImageUrl: '',
  footerLinkColumns: [],
  lowStockThreshold: null,
  lowStockMessage: '',
  showRelatedProducts: true,
  relatedProductsHeading: '',
  deliveryEstimateText: '',
  trustBadges: [],
  sizeGuideContent: '',
  offlineMode: 'closed',
  offlineMessage: '',
  offlineReopenDate: null,
  checkoutNotesEnabled: false,
  checkoutTosEnabled: false,
  checkoutTosPageId: '',
  checkoutThankYouHeading: '',
  checkoutThankYouMessage: '',
  headerSticky: true,
  headerBackgroundColor: '',
  showFaqSection: false,
  faqHeading: '',
  faqItems: [],
  showStickyMobileCta: true,
  storeHoursEnabled: false,
  storeHours: [
    { day: 0, open: '09:00', close: '18:00', closed: false },
    { day: 1, open: '09:00', close: '18:00', closed: false },
    { day: 2, open: '09:00', close: '18:00', closed: false },
    { day: 3, open: '09:00', close: '18:00', closed: false },
    { day: 4, open: '09:00', close: '18:00', closed: false },
    { day: 5, open: '09:00', close: '18:00', closed: false },
    { day: 6, open: '09:00', close: '18:00', closed: false },
  ],
  heroSlides: [],
  facebookPixelId: '',
  googleAnalyticsId: '',
  tiktokPixelId: '',
  saleCountdownEnabled: false,
  saleCountdownEndsAt: null,
  saleCountdownText: '',
  minOrderAmount: null,
  whatsappNumber: '',
  viberNumber: '',
  pickupEnabled: false,
  pickupAddress: '',
  pickupInstructions: '',
}

// Normalizes trustBadges from either shape: pre-translations stores saved plain strings,
// newer saves write { text, translations? } objects — no backend migration is possible for an
// opaque JSON blob, so every read has to tolerate both.
function normalizeTrustBadges(raw: unknown): Required<ThemeConfig>['trustBadges'] {
  if (!Array.isArray(raw)) return []
  return raw.map(item => (typeof item === 'string' ? { text: item } : item))
}

// Same "tolerate the old plain-string shape" normalization as trustBadges, but for a
// Record<string, string> -> Record<string, CollectionTitleOverride> value upgrade.
function normalizeCollectionTitleOverrides(raw: unknown): Required<ThemeConfig>['landingCollectionTitleOverrides'] {
  if (!raw || typeof raw !== 'object') return {}
  const entries = Object.entries(raw as Record<string, unknown>).map(([key, value]) => [
    key,
    typeof value === 'string' ? { value } : value,
  ])
  return Object.fromEntries(entries)
}

export function parseThemeConfig(raw: string): Required<ThemeConfig> {
  try {
    const parsed = JSON.parse(raw) as ThemeConfig
    return {
      ...DEFAULT_THEME_CONFIG,
      ...parsed,
      trustBadges: normalizeTrustBadges(parsed.trustBadges),
      landingCollectionTitleOverrides: normalizeCollectionTitleOverrides(parsed.landingCollectionTitleOverrides),
    }
  } catch {
    return DEFAULT_THEME_CONFIG
  }
}

export const HOME_SECTION_KEYS: Required<ThemeConfig>['homeSectionOrder'] = ['hero', 'categories', 'products', 'collections', 'faq', 'content']

// Sanitizes tokens.homeSectionOrder against unknown/duplicate entries (e.g. hand-edited JSON).
// Deliberately does NOT re-add sections missing from the array — a section absent from the
// saved order means the merchant turned it off, which must stick.
export function getHomeSectionOrder(tokens: Required<ThemeConfig>): Required<ThemeConfig>['homeSectionOrder'] {
  const seen = new Set<string>()
  return tokens.homeSectionOrder.filter(key => {
    if (!HOME_SECTION_KEYS.includes(key) || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// Admin-only overlay (customCss / announcementHtml / footerExtraHtml) — see AdminThemeOverride.
export function parseThemeOverride(raw: string | null | undefined): AdminThemeOverride {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as AdminThemeOverride
  } catch {
    return {}
  }
}

export const LANDING_CATEGORY_GRID_CLASS: Record<Required<ThemeConfig>['landingCategoryColumns'], string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
}

export const HERO_HEIGHT_CLASS: Record<Required<ThemeConfig>['heroHeight'], string> = {
  small: 'min-h-[280px] sm:min-h-[340px]',
  medium: 'min-h-[420px] sm:min-h-[520px]',
  large: 'min-h-[560px] sm:min-h-[680px]',
}

export const HERO_TEXT_POSITION_CLASS: Record<Required<ThemeConfig>['heroTextPosition'], { wrapper: string; align: string }> = {
  'top-left': { wrapper: 'justify-start items-start', align: 'text-left' },
  'top-center': { wrapper: 'justify-start items-center', align: 'text-center' },
  'top-right': { wrapper: 'justify-start items-end', align: 'text-right' },
  'middle-left': { wrapper: 'justify-center items-start', align: 'text-left' },
  'middle-center': { wrapper: 'justify-center items-center', align: 'text-center' },
  'middle-right': { wrapper: 'justify-center items-end', align: 'text-right' },
  'bottom-left': { wrapper: 'justify-end items-start', align: 'text-left' },
  'bottom-center': { wrapper: 'justify-end items-center', align: 'text-center' },
  'bottom-right': { wrapper: 'justify-end items-end', align: 'text-right' },
}

type HeroHorizontalAlign = 'left' | 'center' | 'right'

const HERO_ALIGN_CLASS: Record<HeroHorizontalAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const HERO_ALIGN_CLASS_MD: Record<HeroHorizontalAlign, string> = {
  left: 'md:text-left',
  center: 'md:text-center',
  right: 'md:text-right',
}

export function getHeroTextAlignClass(tokens: Required<ThemeConfig>): string {
  const desktopHorizontal = tokens.heroTextPosition.split('-')[1] as HeroHorizontalAlign

  if (tokens.heroMobileTextAlign === 'inherit') {
    return HERO_ALIGN_CLASS[desktopHorizontal]
  }

  return `${HERO_ALIGN_CLASS[tokens.heroMobileTextAlign]} ${HERO_ALIGN_CLASS_MD[desktopHorizontal]}`
}

const HERO_JUSTIFY_CLASS: Record<HeroHorizontalAlign, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

const HERO_JUSTIFY_CLASS_MD: Record<HeroHorizontalAlign, string> = {
  left: 'md:justify-start',
  center: 'md:justify-center',
  right: 'md:justify-end',
}

// Companion to getHeroTextAlignClass for the CTA button row — that row is a flex container,
// so the text-align classes above (which only affect inline/block content) don't touch it;
// without a matching justify-content it always sits flush-left regardless of heroTextPosition.
export function getHeroButtonRowClass(tokens: Required<ThemeConfig>): string {
  const desktopHorizontal = tokens.heroTextPosition.split('-')[1] as HeroHorizontalAlign

  if (tokens.heroMobileTextAlign === 'inherit') {
    return HERO_JUSTIFY_CLASS[desktopHorizontal]
  }

  return `${HERO_JUSTIFY_CLASS[tokens.heroMobileTextAlign]} ${HERO_JUSTIFY_CLASS_MD[desktopHorizontal]}`
}

export const HERO_IMAGE_POSITION_CLASS: Record<Required<ThemeConfig>['heroImagePosition'], string> = {
  center: 'object-center',
  top: 'object-top',
  bottom: 'object-bottom',
  left: 'object-left',
  right: 'object-right',
}

export function getHeroImageClass(tokens: Required<ThemeConfig>): string {
  if (tokens.heroImageFit === 'cover') {
    return `w-full h-full object-cover ${HERO_IMAGE_POSITION_CLASS[tokens.heroImagePosition]}`
  }
  return 'max-w-full max-h-full object-contain'
}

export const HERO_HEADLINE_SIZE_CLASS: Record<Required<ThemeConfig>['heroHeadlineSize'], string> = {
  sm: 'text-2xl sm:text-3xl',
  md: 'text-4xl sm:text-6xl',
  lg: 'text-5xl sm:text-7xl',
  xl: 'text-6xl sm:text-8xl',
}

export const HERO_SUBHEADLINE_SIZE_CLASS: Record<Required<ThemeConfig>['heroSubheadlineSize'], string> = {
  sm: 'text-xs',
  md: 'text-sm sm:text-base',
  lg: 'text-base sm:text-lg',
  xl: 'text-lg sm:text-xl',
}

export const HERO_EYEBROW_SIZE_CLASS: Record<Required<ThemeConfig>['heroEyebrowSize'], string> = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
  xl: 'text-base',
}

export function getHeroBackgroundImageClass(tokens: Required<ThemeConfig>): string {
  return `w-full h-full object-cover ${HERO_IMAGE_POSITION_CLASS[tokens.heroImagePosition]}`
}

export function hasHeroVideo(tokens: Required<ThemeConfig>): boolean {
  return tokens.heroLayout === 'background' && !!tokens.heroVideoUrl
}

// Only the shared, non-themed components (Cart, Checkout, Bundle list, Contact page) read this —
// every other themed component hardcodes its own rounded-* classes per theme and is unaffected.
export function getRadiusClass(themeId: string, tokens: Required<ThemeConfig>): string {
  const radius = tokens.cornerRadius === 'theme' ? getThemeDefinition(themeId).radius : tokens.cornerRadius
  return RADIUS_CLASS[radius]
}

export function getSectionBackgroundStyle(
  tokens: Required<ThemeConfig>,
  key: Exclude<HomeSectionKey, 'hero'>
): CSSProperties | undefined {
  const color = tokens.sectionBackgroundColors[key]
  return color ? { backgroundColor: color } : undefined
}

// Merchant-facing "light/dark/auto" text color override — used instead of a raw color
// picker so choosing readable text over a photo stays a one-click, non-technical decision.
export const HERO_TEXT_THEME_CLASS: Record<'light' | 'dark', { headline: string; subheadline: string; eyebrow: string }> = {
  light: {
    headline: 'text-white',
    subheadline: 'text-white/80',
    eyebrow: 'text-white/70',
  },
  dark: {
    headline: 'text-[#111111]',
    subheadline: 'text-[#111111]/70',
    eyebrow: 'text-[#111111]/60',
  },
}

export function getHeroTextColorClass(
  tokens: Required<ThemeConfig>,
  element: 'headline' | 'subheadline' | 'eyebrow',
  fallbackClass: string
): string {
  if (tokens.heroTextTheme === 'auto') return fallbackClass
  return HERO_TEXT_THEME_CLASS[tokens.heroTextTheme][element]
}

// Black scrim over a hero photo so custom text stays legible regardless of the image's own contrast.
export function getHeroOverlayStyle(tokens: Required<ThemeConfig>): CSSProperties | undefined {
  if (!tokens.heroImageUrl || tokens.heroOverlayOpacity <= 0) return undefined
  return { backgroundColor: `rgba(0,0,0,${Math.min(tokens.heroOverlayOpacity, 80) / 100})` }
}

// Every theme builds one per-slide "virtual tokens" object by spreading the store's base tokens
// and overriding the scalar hero* fields with the slide's own values (see each theme's Home.tsx
// heroSlideConfigs). This does the equivalent remap for the translations sidecar, so
// getThemeText(virtualTokens, 'heroHeadline', lang) resolves the SLIDE's own translation rather
// than the store's top-level (non-carousel) hero translation.
export function getHeroSlideTranslations(tokens: Required<ThemeConfig>, slide: HeroSlide): ThemeConfigTranslations {
  return {
    en: {
      ...tokens.translations.en,
      heroEyebrow: slide.translations?.en?.eyebrow,
      heroHeadline: slide.translations?.en?.headline,
      heroSubheadline: slide.translations?.en?.subheadline,
      heroCtaText: slide.translations?.en?.ctaText,
      heroSecondaryCtaText: slide.translations?.en?.secondaryCtaText,
    },
    ru: {
      ...tokens.translations.ru,
      heroEyebrow: slide.translations?.ru?.eyebrow,
      heroHeadline: slide.translations?.ru?.headline,
      heroSubheadline: slide.translations?.ru?.subheadline,
      heroCtaText: slide.translations?.ru?.ctaText,
      heroSecondaryCtaText: slide.translations?.ru?.secondaryCtaText,
    },
  }
}

export function getHeroCtaLabel(tokens: Required<ThemeConfig>, fallback: string, lang: StorefrontLanguage): string {
  return getThemeText(tokens, 'heroCtaText', lang).trim() || fallback
}

export function getHeroCtaHref(tokens: Required<ThemeConfig>, categories: CategoryResponse[]): string {
  if (tokens.heroCtaLinkType === 'category' && tokens.heroCtaCategoryId) {
    const category = categories.find(c => c.id === tokens.heroCtaCategoryId)
    if (category) return `/products/category/${category.slug}`
  }
  if (tokens.heroCtaLinkType === 'custom' && tokens.heroCtaCustomUrl.trim()) {
    return tokens.heroCtaCustomUrl.trim()
  }
  return '/products'
}

export function getHeroSecondaryCtaLabel(tokens: Required<ThemeConfig>, fallback: string, lang: StorefrontLanguage): string {
  return getThemeText(tokens, 'heroSecondaryCtaText', lang).trim() || fallback
}

export function getHeroSecondaryCtaHref(tokens: Required<ThemeConfig>, categories: CategoryResponse[]): string {
  if (tokens.heroSecondaryCtaLinkType === 'category' && tokens.heroSecondaryCtaCategoryId) {
    const category = categories.find(c => c.id === tokens.heroSecondaryCtaCategoryId)
    if (category) return `/products/category/${category.slug}`
  }
  if (tokens.heroSecondaryCtaLinkType === 'custom' && tokens.heroSecondaryCtaCustomUrl.trim()) {
    return tokens.heroSecondaryCtaCustomUrl.trim()
  }
  return '/products'
}

export const HERO_TEXT_POSITIONS: Required<ThemeConfig>['heroTextPosition'][] = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'middle-center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

export const BANNER_PATTERNS: { value: Required<ThemeConfig>['bannerPattern']; label: string }[] = [
  { value: 'dots', label: 'წერტილები' },
  { value: 'stripes', label: 'ზოლები' },
  { value: 'grid', label: 'ბადე' },
  { value: 'checkers', label: 'ჭადრაკული' },
]

export function hasBanner(tokens: Required<ThemeConfig>): boolean {
  if (tokens.bannerType === 'pattern') return true
  if (tokens.bannerType === 'color') return !!tokens.bannerColor
  return !!tokens.bannerUrl
}

export function getBannerPatternStyle(
  pattern: Required<ThemeConfig>['bannerPattern'],
  tintHex: string
): CSSProperties {
  const clean = /^#[0-9a-fA-F]{6}$/.test(tintHex) ? tintHex : '#111111'
  const tint = (alpha: string) => `${clean}${alpha}`

  switch (pattern) {
    case 'stripes':
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${tint('26')}, ${tint('26')} 10px, transparent 10px, transparent 20px)`,
      }
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${tint('26')} 1px, transparent 1px), linear-gradient(90deg, ${tint('26')} 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }
    case 'checkers':
      return {
        backgroundImage: [
          `linear-gradient(45deg, ${tint('26')} 25%, transparent 25%)`,
          `linear-gradient(-45deg, ${tint('26')} 25%, transparent 25%)`,
          `linear-gradient(45deg, transparent 75%, ${tint('26')} 75%)`,
          `linear-gradient(-45deg, transparent 75%, ${tint('26')} 75%)`,
        ].join(', '),
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
      }
    case 'dots':
    default:
      return {
        backgroundImage: `radial-gradient(${tint('44')} 2px, transparent 2px)`,
        backgroundSize: '18px 18px',
      }
  }
}

export function getBannerBackgroundStyle(tokens: Required<ThemeConfig>): CSSProperties {
  if (tokens.bannerType === 'image' && tokens.bannerUrl) {
    return { backgroundImage: `url(${tokens.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  if (tokens.bannerType === 'color' && tokens.bannerColor) {
    return { backgroundColor: tokens.bannerColor }
  }
  if (tokens.bannerType === 'pattern') {
    return getBannerPatternStyle(tokens.bannerPattern, tokens.bannerColor || tokens.accentColor)
  }
  return {}
}

export const FONT_STACKS: Record<Required<ThemeConfig>['font'], string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
}

export interface ProductBadge {
  text: string
  color: string
}

// A single badge per card — sale takes priority over "new" so the two never stack and clutter the image.
export function getProductBadge(
  tokens: Required<ThemeConfig>,
  product: Pick<ProductSummaryResponse, 'salePrice' | 'createdAt'>,
  lang: StorefrontLanguage
): ProductBadge | null {
  if (product.salePrice !== null && tokens.badgeSaleEnabled) {
    return { text: getThemeText(tokens, 'badgeSaleText', lang).trim() || 'ფასდაკლება', color: tokens.badgeSaleColor }
  }
  if (tokens.badgeNewEnabled) {
    const ageMs = Date.now() - new Date(product.createdAt).getTime()
    const thresholdMs = tokens.badgeNewDays * 24 * 60 * 60 * 1000
    if (ageMs >= 0 && ageMs <= thresholdMs) {
      return { text: getThemeText(tokens, 'badgeNewText', lang).trim() || 'ახალი', color: tokens.badgeNewColor || tokens.accentColor }
    }
  }
  return null
}

export function hasContentBlock(tokens: Required<ThemeConfig>): boolean {
  return !!(tokens.contentHeading.trim() || tokens.contentBody.trim() || tokens.contentImageUrl)
}

export function shadeColor(hex: string, percent: number): string {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return hex
  const num = parseInt(clean, 16)
  const amt = Math.round(2.55 * percent)
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  const r = clamp((num >> 16) + amt)
  const g = clamp(((num >> 8) & 0x00ff) + amt)
  const b = clamp((num & 0x0000ff) + amt)
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)
}

// Picks readable black/white text for an arbitrary merchant-chosen background color
// (e.g. the announcement bar) so there's no separate text-color decision to make.
export function getContrastTextColor(hex: string): string {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return '#ffffff'
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#111111' : '#ffffff'
}

export function glowShadow(hex: string, alphaHex = '55'): string {
  const clean = hex.replace('#', '')
  return /^[0-9a-fA-F]{6}$/.test(clean) ? `0 0 32px 0 #${clean}${alphaHex}` : 'none'
}
