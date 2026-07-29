import type { StorefrontLanguage } from '@/lib/storefront-i18n'

export type PaymentMethod = 'CashOnDelivery' | 'BankTransfer' | 'Flitt' | 'Tbc' | 'Bog' | 'CityPay'

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'

export type ThemeId = 'minimal' | 'bold' | 'classic' | 'luxury' | 'vibrant' | 'commerce' | 'editorial' | 'flower' | 'kids' | 'sports' | 'chocolate' | 'athletic' | 'handmade' | 'furniture' | 'varsity' | 'wooden' | 'industrial'

export type SocialsPosition = 'top' | 'bottom' | 'both' | 'footer'

export type SearchBarLocation = 'productsPage' | 'header' | 'both'

export type HeroLayout = 'center' | 'imageLeft' | 'imageRight' | 'background'

export type HeroHeight = 'small' | 'medium' | 'large'

export type BannerType = 'image' | 'color' | 'pattern'

export type BannerPattern = 'dots' | 'stripes' | 'grid' | 'checkers'

export type BannerPlacement = 'section' | 'behindImage'

export type HeroTextPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'

export type HeroMobileImageVisibility = 'show' | 'hide'

export type HeroMobileImagePosition = 'inherit' | 'top' | 'bottom'

export type HeroMobileTextAlign = 'inherit' | 'left' | 'center' | 'right'

export type HeroImageFit = 'contain' | 'cover'

export type HeroImagePosition = 'center' | 'top' | 'bottom' | 'left' | 'right'

export type HeroTextSize = 'sm' | 'md' | 'lg' | 'xl'

export type HeroTextTheme = 'auto' | 'light' | 'dark'

export type HeroCtaLinkType = 'products' | 'category' | 'custom'

export type CategoryMenuMode = 'flat' | 'dropdown'

export type CategoryMenuScope = 'all' | 'selected'

export type FooterContactFormPosition = 'off' | 'above' | 'below'

export type LandingCategoryColumns = 2 | 3 | 4 | 6

export type HomeSectionKey = 'hero' | 'categories' | 'products' | 'collections' | 'faq' | 'content'

/** A homepage section slot — either one of the fixed built-in sections, or a merchant-created custom section referenced by id. */
export type HomeSectionOrderEntry = HomeSectionKey | `custom:${string}`

export type CustomSectionImageLayout = 'left' | 'right' | 'background'

export type FeaturedProductsMode = 'latest' | 'curated'

export type ContentImagePosition = 'left' | 'right'

/** 'none' keeps a plain color/opacity transition only (no transform/filter). */
export type ButtonHoverAnimation = 'scale' | 'lift' | 'brighten' | 'darken' | 'none'

export interface ThemeConfig {
  /** What a first-time shopper (no nn_store_lang cookie yet) sees the storefront in. */
  defaultLanguage?: StorefrontLanguage
  accentColor?: string
  /** Text/icon color on filled accent-colored buttons. */
  buttonTextColor?: string
  /** A second brand color, independent of accentColor — used for the hero secondary button and other "secondary" accents. */
  secondaryColor?: string
  buttonHoverAnimation?: ButtonHoverAnimation
  /** Empty means "auto" — a darkened/lightened shade of accentColor, computed by autoShade. */
  buttonHoverColor?: string
  buttonHoverDurationMs?: number
  /** Key into FONT_OPTIONS (lib/storefront-fonts.ts) — 'sans'/'serif'/'mono' are generic-stack defaults, everything else is a real webfont. */
  font?: string
  /**
   * Overrides the theme's own default corner rounding — but only for the shared, non-themed
   * components (Cart, Checkout, Bundle list, Contact page), which already compute their radius
   * dynamically. Every other themed component (Header/Home/ProductCard/etc.) hardcodes its own
   * rounded-* classes per theme and is unaffected. 'theme' keeps the theme's own default.
   */
  cornerRadius?: 'theme' | 'none' | 'md' | '2xl'
  /** Per home-page section background color override. Empty/missing keys inherit the theme's default. 'hero' is intentionally unused — it already has its own bannerColor/heroVideoUrl. */
  sectionBackgroundColors?: Partial<Record<HomeSectionKey, string>>
  /** 'full' (default) is today's edge-to-edge layout. 'boxed' constrains the whole site to boxedMaxWidth, centered on boxedBackgroundColor. */
  layoutWidth?: 'full' | 'boxed'
  boxedMaxWidth?: number
  boxedBackgroundColor?: string
  logoUrl?: string
  showStoreName?: boolean
  heroImageUrl?: string
  heroImageFit?: HeroImageFit
  heroImagePosition?: HeroImagePosition
  /** Only used when heroLayout is 'background'. heroImageUrl still serves as the poster frame and the mobile fallback. */
  heroVideoUrl?: string
  /** Off by default — most stores skip autoplaying video on mobile to save the visitor's data. */
  heroVideoMobileEnabled?: boolean
  bannerType?: BannerType
  bannerUrl?: string
  bannerColor?: string
  bannerPattern?: BannerPattern
  bannerPlacement?: BannerPlacement
  heroLayout?: HeroLayout
  heroHeight?: HeroHeight
  heroTextPosition?: HeroTextPosition
  heroMobileImage?: HeroMobileImageVisibility
  heroMobileImagePosition?: HeroMobileImagePosition
  heroMobileTextAlign?: HeroMobileTextAlign
  heroEyebrow?: string
  heroEyebrowSize?: HeroTextSize
  heroHeadline?: string
  heroHeadlineSize?: HeroTextSize
  heroSubheadline?: string
  heroSubheadlineSize?: HeroTextSize
  heroOverlayOpacity?: number
  heroTextTheme?: HeroTextTheme
  heroCtaEnabled?: boolean
  heroCtaText?: string
  heroCtaLinkType?: HeroCtaLinkType
  heroCtaCategoryId?: string
  heroCtaCustomUrl?: string
  /** A second, lower-emphasis button next to the main hero CTA. */
  heroSecondaryCtaEnabled?: boolean
  heroSecondaryCtaText?: string
  heroSecondaryCtaLinkType?: HeroCtaLinkType
  heroSecondaryCtaCategoryId?: string
  heroSecondaryCtaCustomUrl?: string
  heroKenBurnsEnabled?: boolean
  heroScrollIndicatorEnabled?: boolean
  seoTagline?: string
  seoDescription?: string
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
  contactLatitude?: number | null
  contactLongitude?: number | null
  socialInstagram?: string
  socialFacebook?: string
  socialTiktok?: string
  socialYoutube?: string
  socialsPosition?: SocialsPosition
  showSaleCategory?: boolean
  showSaleCategoryIcon?: boolean
  navPageIds?: string[]
  searchBarLocation?: SearchBarLocation
  categoryMenuMode?: CategoryMenuMode
  categoryMenuScope?: CategoryMenuScope
  categoryMenuSelectedIds?: string[]
  showLandingCategories?: boolean
  landingCategoryScope?: CategoryMenuScope
  landingCategorySelectedIds?: string[]
  landingCategoryColumns?: LandingCategoryColumns
  showLandingCollections?: boolean
  landingCollectionScope?: CategoryMenuScope
  landingCollectionSelectedIds?: string[]
  /** Display order among selected/visible collections — same "absence filtered out" idiom as homeSectionOrder. */
  landingCollectionOrder?: string[]
  /** Optional per-collection heading override; falls back to the collection's own name. */
  landingCollectionTitleOverrides?: Record<string, CollectionTitleOverride>
  landingCollectionProductLimit?: number
  footerContactForm?: FooterContactFormPosition
  showContactInNav?: boolean
  contactLabel?: string
  /** Which home-page sections show and in what order — sections not listed are hidden. */
  homeSectionOrder?: HomeSectionOrderEntry[]
  /** Merchant-created homepage sections, referenced from homeSectionOrder as `custom:${id}`. */
  customSections?: CustomSection[]
  featuredProductsMode?: FeaturedProductsMode
  featuredProductIds?: string[]
  contentHeading?: string
  contentBody?: string
  contentImageUrl?: string
  contentImagePosition?: ContentImagePosition
  contentButtonText?: string
  contentButtonLink?: string
  announcementEnabled?: boolean
  announcementText?: string
  announcementColor?: string
  announcementLink?: string
  announcementDismissible?: boolean
  badgeSaleEnabled?: boolean
  badgeSaleText?: string
  badgeSaleColor?: string
  badgeNewEnabled?: boolean
  badgeNewText?: string
  badgeNewColor?: string
  badgeNewDays?: number
  codEnabled?: boolean
  codNotes?: string
  bankTransferEnabled?: boolean
  bankTransferNotes?: string
  flittEnabled?: boolean
  tbcEnabled?: boolean
  bogEnabled?: boolean
  cityPayEnabled?: boolean
  shippingZones?: ShippingZone[]
  freeShippingThreshold?: number | null
  /** Empty means keep the auto "© {year} {storeName}" line. */
  footerCopyrightText?: string
  showPlatformAttribution?: boolean
  footerShowPaymentIcons?: boolean
  footerShowLogo?: boolean
  faviconUrl?: string
  socialImageUrl?: string
  footerLinkColumns?: FooterLinkColumn[]
  /** null disables the low-stock message entirely. */
  lowStockThreshold?: number | null
  /** Supports a {n} placeholder for the actual stock count. */
  lowStockMessage?: string
  showRelatedProducts?: boolean
  /** Empty falls back to the theme's default heading. */
  relatedProductsHeading?: string
  deliveryEstimateText?: string
  trustBadges?: TrustBadge[]
  sizeGuideContent?: string
  offlineMode?: OfflineMode
  offlineMessage?: string
  offlineReopenDate?: string | null
  checkoutNotesEnabled?: boolean
  checkoutTosEnabled?: boolean
  checkoutTosPageId?: string
  checkoutThankYouHeading?: string
  checkoutThankYouMessage?: string
  headerSticky?: boolean
  headerBackgroundColor?: string
  showFaqSection?: boolean
  faqHeading?: string
  faqItems?: FaqItem[]
  showStickyMobileCta?: boolean
  storeHoursEnabled?: boolean
  storeHours?: StoreHoursDay[]
  heroSlides?: HeroSlide[]
  facebookPixelId?: string
  googleAnalyticsId?: string
  tiktokPixelId?: string
  saleCountdownEnabled?: boolean
  /** ISO datetime string — the bar hides itself once this passes. */
  saleCountdownEndsAt?: string | null
  /** Empty falls back to the theme's default "Sale ends in" copy. */
  saleCountdownText?: string
  /** null disables the floor entirely. Distinct from freeShippingThreshold, which only affects the shipping fee. */
  minOrderAmount?: number | null
  whatsappNumber?: string
  viberNumber?: string
  pickupEnabled?: boolean
  pickupAddress?: string
  pickupInstructions?: string
  /** en/ru overrides for the free-text fields below — the base field itself (e.g. heroHeadline)
   * stays whatever the merchant originally typed (default language) and needs no migration. */
  translations?: ThemeConfigTranslations
}

/** One optional override per language for each translatable scalar text field in ThemeConfig.
 * Keys mirror ThemeConfig's own field names exactly. */
export interface TranslatableThemeText {
  heroEyebrow?: string
  heroHeadline?: string
  heroSubheadline?: string
  heroCtaText?: string
  heroSecondaryCtaText?: string
  contentHeading?: string
  contentBody?: string
  contentButtonText?: string
  announcementText?: string
  faqHeading?: string
  badgeSaleText?: string
  badgeNewText?: string
  footerCopyrightText?: string
  lowStockMessage?: string
  relatedProductsHeading?: string
  deliveryEstimateText?: string
  sizeGuideContent?: string
  offlineMessage?: string
  checkoutThankYouHeading?: string
  checkoutThankYouMessage?: string
  saleCountdownText?: string
  contactLabel?: string
  seoTagline?: string
  seoDescription?: string
  pickupInstructions?: string
  codNotes?: string
  bankTransferNotes?: string
}

export interface ThemeConfigTranslations {
  en?: TranslatableThemeText
  ru?: TranslatableThemeText
}

export type OfflineMode = 'closed' | 'comingSoon'

export interface FaqItem {
  question: string
  answer: string
  translations?: { en?: { question?: string; answer?: string }; ru?: { question?: string; answer?: string } }
}

/** A merchant-created homepage section — like the built-in "content" block, but there can be any number of these, each independently placeable via homeSectionOrder. */
export interface CustomSection {
  /** Stable client-generated id (crypto.randomUUID()) — referenced from homeSectionOrder as `custom:${id}`, so it must survive reordering/renaming untouched. */
  id: string
  heading?: string
  body?: string
  buttonText?: string
  buttonLink?: string
  imageUrl?: string
  /** Only matters once imageUrl is set. */
  imageLayout?: CustomSectionImageLayout
  /** Same reused hero mobile-override shape — image shown/hidden, image position (left/right layouts only), and text alignment can each differ from desktop. */
  mobileImage?: HeroMobileImageVisibility
  mobileImagePosition?: HeroMobileImagePosition
  mobileTextAlign?: HeroMobileTextAlign
  backgroundColor?: string
  translations?: {
    en?: { heading?: string; body?: string; buttonText?: string }
    ru?: { heading?: string; body?: string; buttonText?: string }
  }
}

export interface StoreHoursDay {
  day: number
  open: string
  close: string
  closed: boolean
}

export interface HeroSlide {
  imageUrl: string
  videoUrl: string
  eyebrow: string
  headline: string
  subheadline: string
  ctaEnabled: boolean
  ctaText: string
  ctaLinkType: HeroCtaLinkType
  ctaCategoryId: string
  ctaCustomUrl: string
  secondaryCtaEnabled: boolean
  secondaryCtaText: string
  secondaryCtaLinkType: HeroCtaLinkType
  secondaryCtaCategoryId: string
  secondaryCtaCustomUrl: string
  translations?: {
    en?: { eyebrow?: string; headline?: string; subheadline?: string; ctaText?: string; secondaryCtaText?: string }
    ru?: { eyebrow?: string; headline?: string; subheadline?: string; ctaText?: string; secondaryCtaText?: string }
  }
}

export interface FooterLinkColumn {
  title: string
  links: { label: string; url: string; translations?: { en?: string; ru?: string } }[]
  translations?: { en?: string; ru?: string }
}

export interface ShippingZone {
  id: string
  name: string
  price: number
  translations?: { en?: string; ru?: string }
}

/** trustBadges item — normalized on read from legacy plain-string arrays (see parseThemeConfig). */
export interface TrustBadge {
  text: string
  translations?: { en?: string; ru?: string }
}

/** landingCollectionTitleOverrides value — normalized on read from legacy plain strings (see parseThemeConfig). */
export interface CollectionTitleOverride {
  value: string
  translations?: { en?: string; ru?: string }
}

export interface StoreResponse {
  id: string
  slug: string
  name: string
  themeId: string
  themeConfig: string
  isActive: boolean
  affiliateEnabled: boolean
  createdAt: string
  customDomain: string | null
  /** Admin-authored JSON overlay layered on top of the theme — see AdminThemeOverride. Null if none set. */
  themeOverride: string | null
  /** Merchant-controlled — whether the admin's overlay (if any) is currently applied. */
  themeOverrideEnabled: boolean
  /** Admin sales-demo store, not a real customer yet — see /preview/{slug} and the admin Prospects panel. */
  isProspect: boolean
}

export interface UpdateStoreRequest {
  name?: string | null
  themeId?: string | null
  themeConfig?: string | null
  isActive?: boolean | null
  affiliateEnabled?: boolean | null
  themeOverrideEnabled?: boolean | null
}

/** Shape of StoreResponse.themeOverride once parsed — admin-only, set via the admin panel. */
export interface AdminThemeOverride {
  customCss?: string
  announcementHtml?: string
  footerExtraHtml?: string
}

export interface DomainDnsRecordResponse {
  type: string
  name: string
  value: string
}

export interface StoreDomainResponse {
  domain: string | null
  verified: boolean
  verifiedAt: string | null
  instructions: DomainDnsRecordResponse[]
}

export interface SetStoreDomainRequest {
  domain: string
}

export interface CategoryResponse {
  id: string
  parentCategoryId: string | null
  /** Resolved ka -> en -> ru fallback — for consumers that just want "the" name. */
  name: string
  nameKa: string | null
  nameEn: string | null
  nameRu: string | null
  slug: string
  iconUrl: string | null
  iconKey: string | null
  iconEmoji: string | null
  /** JSON array of {name, values[]} — option groups pre-filled onto new products created in this category. */
  defaultOptions: string
}

export interface CreateCategoryRequest {
  parentCategoryId?: string | null
  /** At least one of the three is required. */
  nameKa?: string | null
  nameEn?: string | null
  nameRu?: string | null
  iconUrl?: string | null
  iconKey?: string | null
  iconEmoji?: string | null
  defaultOptions?: string | null
}

export interface UpdateCategoryRequest {
  parentCategoryId?: string | null
  nameKa?: string | null
  nameEn?: string | null
  nameRu?: string | null
  iconUrl?: string | null
  iconKey?: string | null
  iconEmoji?: string | null
  defaultOptions?: string | null
}

export interface CollectionResponse {
  id: string
  /** Resolved ka -> en -> ru fallback — for consumers that just want "the" name. */
  name: string
  nameKa: string | null
  nameEn: string | null
  nameRu: string | null
  slug: string
}

export interface CreateCollectionRequest {
  nameKa?: string | null
  nameEn?: string | null
  nameRu?: string | null
}

export interface UpdateCollectionRequest {
  nameKa?: string | null
  nameEn?: string | null
  nameRu?: string | null
}

export interface BundleItemResponse {
  productId: string
  /** Resolved ka -> en -> ru fallback. */
  productName: string
  productNameKa: string | null
  productNameEn: string | null
  productNameRu: string | null
  productSlug: string
  imageUrl: string | null
  productPrice: number
  quantity: number
}

export interface ProductBundleResponse {
  id: string
  /** Resolved ka -> en -> ru fallback. */
  name: string
  nameKa: string | null
  nameEn: string | null
  nameRu: string | null
  slug: string
  bundlePrice: number
  imageUrl: string | null
  isActive: boolean
  /** Sum of each item's current effective price × quantity — for a "you save ₾X" display. */
  regularTotal: number
  items: BundleItemResponse[]
}

export interface BundleItemInput {
  productId: string
  quantity: number
}

export interface CreateProductBundleRequest {
  nameKa?: string | null
  nameEn?: string | null
  nameRu?: string | null
  bundlePrice: number
  imageUrl?: string | null
  items: BundleItemInput[]
}

export interface UpdateProductBundleRequest {
  nameKa?: string | null
  nameEn?: string | null
  nameRu?: string | null
  bundlePrice?: number | null
  imageUrl?: string | null
  isActive?: boolean | null
  items?: BundleItemInput[] | null
}

export interface ProductImportRowResult {
  rowNumber: number
  name: string
  action: 'created' | 'updated' | 'skipped' | 'warning'
  message: string | null
}

export interface ProductImportResult {
  created: number
  updated: number
  skipped: number
  rows: ProductImportRowResult[]
}

/** Full ordered replace of a collection's product membership — mirrors SetRelatedProductsRequest. */
export interface SetCollectionProductsRequest {
  productIds: string[]
}

export interface StorePageResponse {
  id: string
  title: string // resolved ka -> en -> ru fallback
  titleKa: string | null
  titleEn: string | null
  titleRu: string | null
  slug: string
  content: string // resolved ka -> en -> ru fallback
  contentKa: string | null
  contentEn: string | null
  contentRu: string | null
  updatedAt: string
}

export interface CreateStorePageRequest {
  titleKa?: string | null
  titleEn?: string | null
  titleRu?: string | null
  contentKa?: string | null
  contentEn?: string | null
  contentRu?: string | null
}

export interface UpdateStorePageRequest {
  titleKa?: string | null
  titleEn?: string | null
  titleRu?: string | null
  contentKa?: string | null
  contentEn?: string | null
  contentRu?: string | null
}

export interface ContactMessageResponse {
  id: string
  name: string
  email: string | null
  phone: string | null
  message: string
  isRead: boolean
  createdAt: string
}

export interface CreateContactMessageRequest {
  name: string
  email?: string | null
  phone?: string | null
  message: string
}

export interface UnreadContactMessageCountResponse {
  count: number
}

export interface ProductSummaryResponse {
  id: string
  slug: string
  categoryId: string | null
  name: string // resolved ka->en->ru fallback
  nameKa: string | null
  nameEn: string | null
  nameRu: string | null
  basePrice: number
  salePrice: number | null
  isActive: boolean
  thumbnailUrl: string | null
  secondImageUrl?: string | null
  createdAt: string
  collectionIds: string[]
}

export interface ProductPriceRangeResponse {
  min: number
  max: number
}

/** One filterable value within a facet group — value is the canonical string used in filter
 * query params; the 3 translation fields are display-only overlays. */
export interface ProductFacetValueResponse {
  value: string
  valueKa: string | null
  valueEn: string | null
  valueRu: string | null
}

export interface ProductFacetResponse {
  name: string // resolved ka->en->ru fallback
  nameKa: string | null
  nameEn: string | null
  nameRu: string | null
  values: ProductFacetValueResponse[]
}

/** One filter group sent to the listing endpoint — values within a group are OR'd, groups are AND'd. */
export interface OptionFilterInput {
  name: string
  values: string[]
}

export interface ProductImageResponse {
  id: string
  url: string
  sortOrder: number
}

export interface CreateProductImageRequest {
  url: string
}

export interface ReorderProductImagesRequest {
  imageIds: string[]
}

export interface ProductOptionValueResponse {
  id: string
  value: string // canonical — used for filter/facet matching, never affected by translation edits
  valueKa: string | null
  valueEn: string | null
  valueRu: string | null
}

export interface ProductOptionResponse {
  id: string
  name: string // resolved ka->en->ru fallback
  nameKa: string | null
  nameEn: string | null
  nameRu: string | null
  values: ProductOptionValueResponse[]
}

export interface CreateProductOptionRequest {
  nameKa?: string | null
  nameEn?: string | null
  nameRu?: string | null
}

/** Unconditionally overwrites all three name fields, same convention as categories/products. */
export interface UpdateProductOptionRequest {
  nameKa?: string | null
  nameEn?: string | null
  nameRu?: string | null
}

export interface CreateProductOptionValueRequest {
  value: string
  valueKa?: string | null
  valueEn?: string | null
  valueRu?: string | null
}

/** Translation-only update — the canonical value is immutable once created. */
export interface UpdateProductOptionValueRequest {
  valueKa?: string | null
  valueEn?: string | null
  valueRu?: string | null
}

export interface ProductVariantResponse {
  id: string
  sku: string
  price: number
  salePrice: number | null
  /** null means unlimited stock */
  stock: number | null
  optionValueIds: string[]
}

export interface CreateProductVariantRequest {
  sku: string
  price: number
  salePrice?: number | null
  /** Omit or null for unlimited stock */
  stock?: number | null
  optionValueIds: string[]
}

export interface UpdateProductVariantRequest {
  sku?: string | null
  price?: number | null
  salePrice?: number | null
  /** Only applied when set — pair with clearStock to explicitly reset to unlimited */
  stock?: number | null
  /** Set true to explicitly clear stock back to unlimited (stock field is ignored when true) */
  clearStock?: boolean
}

export interface ProductDetailResponse {
  id: string
  slug: string
  categoryId: string | null
  name: string // resolved ka->en->ru fallback
  nameKa: string | null
  nameEn: string | null
  nameRu: string | null
  description: string | null // resolved ka->en->ru fallback
  descriptionKa: string | null
  descriptionEn: string | null
  descriptionRu: string | null
  videoUrl: string | null
  basePrice: number
  salePrice: number | null
  isActive: boolean
  images: ProductImageResponse[]
  options: ProductOptionResponse[]
  variants: ProductVariantResponse[]
  relatedProducts: ProductSummaryResponse[]
  collectionIds: string[]
}

export interface SetRelatedProductsRequest {
  productIds: string[]
}

/** At least one of nameKa/nameEn/nameRu is required. */
export interface CreateProductRequest {
  nameKa?: string | null
  nameEn?: string | null
  nameRu?: string | null
  descriptionKa?: string | null
  descriptionEn?: string | null
  descriptionRu?: string | null
  videoUrl?: string | null
  basePrice: number
  salePrice?: number | null
  categoryId?: string | null
  collectionIds?: string[] | null
}

/** nameKa/nameEn/nameRu and descriptionKa/descriptionEn/descriptionRu are always sent together
 * and unconditionally overwrite the existing values (same convention as categories). */
export interface UpdateProductRequest {
  nameKa?: string | null
  nameEn?: string | null
  nameRu?: string | null
  descriptionKa?: string | null
  descriptionEn?: string | null
  descriptionRu?: string | null
  /** Send "" to clear an existing video back to none; omit to leave untouched */
  videoUrl?: string
  basePrice?: number | null
  salePrice?: number | null
  categoryId?: string | null
  isActive?: boolean | null
  /** Omit to leave collection membership unchanged; pass a list (possibly empty) to replace it outright. */
  collectionIds?: string[] | null
}

export interface CartItemOptionResponse {
  /** Resolved ka -> en -> ru fallback. */
  optionName: string
  optionNameKa: string | null
  optionNameEn: string | null
  optionNameRu: string | null
  /** Resolved ka -> en -> ru fallback. */
  value: string
  valueKa: string | null
  valueEn: string | null
  valueRu: string | null
}

export interface CartItemResponse {
  id: string
  variantId: string
  /** Resolved ka -> en -> ru fallback. */
  productName: string
  productNameKa: string | null
  productNameEn: string | null
  productNameRu: string | null
  productSlug: string
  sku: string
  price: number
  quantity: number
  imageUrl: string | null
  /** null means unlimited stock */
  stock: number | null
  options: CartItemOptionResponse[]
}

export interface CartBundleItemResponse {
  id: string
  bundleId: string
  /** Resolved ka -> en -> ru fallback. */
  bundleName: string
  bundleNameKa: string | null
  bundleNameEn: string | null
  bundleNameRu: string | null
  bundleSlug: string
  imageUrl: string | null
  bundlePrice: number
  quantity: number
}

export interface CartResponse {
  id: string
  sessionId: string
  items: CartItemResponse[]
  total: number
  bundleItems: CartBundleItemResponse[]
}

export interface AddCartItemRequest {
  productId: string
  /** One value per configured product option; empty for products with no options */
  optionValueIds: string[]
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface AddBundleToCartRequest {
  bundleId: string
  quantity: number
}

export interface UpdateCartBundleItemRequest {
  quantity: number
}

export interface CheckoutRequest {
  customerName: string
  email: string
  phone: string
  address: string
  latitude?: number | null
  longitude?: number | null
  paymentMethod: PaymentMethod
  shippingZoneId?: string | null
  ref?: string | null
  customerNote?: string | null
  discountCode?: string | null
  isPickup?: boolean
  /** Shopper's checkout-time language — resolves codNotes/bankTransferNotes/shippingZone name into the right variant, and freezes onto Order.ShippingZoneName. */
  lang?: StorefrontLanguage
}

export interface OrderResponse {
  id: string
  customerName: string
  email: string
  phone: string
  address: string
  latitude: number | null
  longitude: number | null
  paymentMethod: PaymentMethod
  status: OrderStatus
  total: number
  shippingFee: number
  shippingZoneName: string | null
  createdAt: string
  redirectUrl: string | null
  customerNote: string | null
  discountCode: string | null
  discountAmount: number
  isPickup: boolean
}

export interface OrderItemResponse {
  id: string
  variantId: string
  productId: string
  productName: string
  sku: string
  imageUrl: string | null
  options: CartItemOptionResponse[]
  quantity: number
  priceAtPurchase: number
}

export interface OrderNoteResponse {
  id: string
  content: string
  createdAt: string
}

export interface OrderBundleItemResponse {
  id: string
  bundleId: string
  bundleName: string
  quantity: number
  priceAtPurchase: number
}

export interface OrderDetailResponse {
  id: string
  customerName: string
  email: string
  phone: string
  address: string
  latitude: number | null
  longitude: number | null
  paymentMethod: PaymentMethod
  status: OrderStatus
  total: number
  shippingFee: number
  shippingZoneName: string | null
  createdAt: string
  paymentConfirmedAt: string | null
  items: OrderItemResponse[]
  bundleItems: OrderBundleItemResponse[]
  notes: OrderNoteResponse[]
  quickShipperOrderId: number | null
  quickShipperStatus: string | null
  quickShipperTrackingUrl: string | null
  quickShipperDeliveryFee: number | null
  customerNote: string | null
  discountCode: string | null
  discountAmount: number
  isPickup: boolean
}

export type DiscountCodeType = 'Percentage' | 'FixedAmount'

export interface StoreDiscountCodeResponse {
  id: string
  code: string
  type: DiscountCodeType
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  usesCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

export interface CreateStoreDiscountCodeRequest {
  code: string
  type: DiscountCodeType
  value: number
  minOrderAmount?: number | null
  maxUses?: number | null
  expiresAt?: string | null
}

export interface UpdateStoreDiscountCodeRequest {
  code: string
  type: DiscountCodeType
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  expiresAt: string | null
  isActive: boolean
}

export interface ValidateDiscountCodeRequest {
  code: string
  subtotal: number
}

export interface ValidateDiscountCodeResponse {
  valid: boolean
  discountAmount: number
  errorCode: 'not_found' | 'inactive' | 'expired' | 'max_uses' | 'min_order' | null
  minOrderAmount: number | null
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
}

export interface CreateOrderNoteRequest {
  content: string
}

export interface UpdatePaymentConfirmedRequest {
  confirmed: boolean
}

export interface NewOrderCountResponse {
  count: number
}

export interface MonthlyOrderSummary {
  year: number
  month: number
  revenue: number
  orderCount: number
  productsSold: number
  averageOrderValue: number
  averageItemPrice: number
}

export interface FacebookConnectUrlResponse {
  url: string
}

export interface FacebookStatusResponse {
  connected: boolean
  pageName: string | null
}

export interface FacebookPendingPageResponse {
  id: string
  name: string
}

export interface SelectFacebookPageRequest {
  pending: string
  pageId: string
}

export interface FacebookPostSummaryResponse {
  id: string
  message: string | null
  createdTime: string
  thumbnailUrl: string | null
  hasVideo: boolean
}

export interface FacebookPostDetailResponse {
  message: string | null
  imageUrls: string[]
  videoUrl: string | null
}

export interface FacebookProductPreviewResponse {
  message: string
  imageUrl: string | null
}

export interface FacebookPublishResponse {
  postUrl: string
}

export interface InstagramStatusResponse {
  connected: boolean
  username: string | null
}

export interface InstagramMediaSummaryResponse {
  id: string
  caption: string | null
  thumbnailUrl: string | null
  hasVideo: boolean
}

export interface InstagramMediaDetailResponse {
  caption: string | null
  imageUrls: string[]
  videoUrl: string | null
}

export interface InstagramProductPreviewResponse {
  message: string
  imageUrl: string | null
}

export interface InstagramPublishResponse {
  postUrl: string
}

export interface TikTokConnectUrlResponse {
  url: string
}

export interface TikTokStatusResponse {
  connected: boolean
  displayName: string | null
}

export interface TikTokProductPreviewResponse {
  imageUrls: string[]
  title: string
  description: string
}

export interface TikTokPublishRequest {
  title?: string
  description?: string
  hashtags?: string
  autoAddMusic?: boolean
}

export interface TikTokPublishImagesRequest {
  imageUrls: string[]
  title: string
  description: string
  autoAddMusic?: boolean
}

export interface TikTokPublishResponse {
  posted: boolean
  privacyLevel: string
}

export interface AiAgentSettingsResponse {
  enabledFacebook: boolean
  enabledInstagram: boolean
  instructions: string | null
}

export interface UpdateAiAgentSettingsRequest {
  enabledFacebook?: boolean
  enabledInstagram?: boolean
  instructions?: string
}

export interface KnowledgeBaseSectionResponse {
  id: string
  title: string
  content: string
  updatedAt: string
}

export interface CreateKnowledgeBaseSectionRequest {
  title: string
  content: string
}

export interface UpdateKnowledgeBaseSectionRequest {
  title?: string
  content?: string
}

export interface ConversationMessageResponse {
  id: string
  direction: 'Inbound' | 'Outbound'
  content: string
  createdAt: string
}

export interface ConversationSummaryResponse {
  id: string
  customerDisplayName: string | null
  externalUserId: string
  lastMessageAt: string
  createdAt: string
}

export interface ConversationDetailResponse extends ConversationSummaryResponse {
  messages: ConversationMessageResponse[]
}

export interface TrackPageViewRequest {
  path: string
  referrer?: string | null
  visitorId: string
}

export interface TopPageEntry {
  path: string
  views: number
}

export interface ReferrerEntry {
  source: string
  visits: number
}

export interface StoreAnalyticsSummaryResponse {
  visits: number
  pageViews: number
  productViews: number
  orders: number
  topPages: TopPageEntry[]
  sources: ReferrerEntry[]
}
