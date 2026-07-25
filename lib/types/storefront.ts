export type PaymentMethod = 'CashOnDelivery' | 'BankTransfer' | 'Flitt' | 'Tbc' | 'Bog' | 'CityPay'

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'

export type ThemeId = 'minimal' | 'bold' | 'classic' | 'luxury' | 'vibrant' | 'commerce' | 'editorial' | 'flower' | 'kids' | 'sports' | 'chocolate' | 'athletic' | 'handmade' | 'furniture' | 'varsity' | 'wooden' | 'industrial'

export type SocialsPosition = 'top' | 'bottom' | 'both' | 'footer'

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

export type FeaturedProductsMode = 'latest' | 'curated'

export type ContentImagePosition = 'left' | 'right'

export interface ThemeConfig {
  accentColor?: string
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
  landingCollectionTitleOverrides?: Record<string, string>
  landingCollectionProductLimit?: number
  footerContactForm?: FooterContactFormPosition
  showContactInNav?: boolean
  contactLabel?: string
  /** Which home-page sections show and in what order — sections not listed are hidden. */
  homeSectionOrder?: HomeSectionKey[]
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
  trustBadges?: string[]
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
}

export type OfflineMode = 'closed' | 'comingSoon'

export interface FaqItem {
  question: string
  answer: string
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
}

export interface FooterLinkColumn {
  title: string
  links: { label: string; url: string }[]
}

export interface ShippingZone {
  id: string
  name: string
  price: number
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
  name: string
  slug: string
  iconUrl: string | null
  iconKey: string | null
  iconEmoji: string | null
  /** JSON array of {name, values[]} — option groups pre-filled onto new products created in this category. */
  defaultOptions: string
}

export interface CreateCategoryRequest {
  name: string
  parentCategoryId?: string | null
  iconUrl?: string | null
  iconKey?: string | null
  iconEmoji?: string | null
  defaultOptions?: string | null
}

export interface UpdateCategoryRequest {
  name?: string | null
  parentCategoryId?: string | null
  iconUrl?: string | null
  iconKey?: string | null
  iconEmoji?: string | null
  defaultOptions?: string | null
}

export interface CollectionResponse {
  id: string
  name: string
  slug: string
}

export interface CreateCollectionRequest {
  name: string
}

export interface UpdateCollectionRequest {
  name?: string | null
}

export interface BundleItemResponse {
  productId: string
  productName: string
  productSlug: string
  imageUrl: string | null
  productPrice: number
  quantity: number
}

export interface ProductBundleResponse {
  id: string
  name: string
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
  name: string
  bundlePrice: number
  imageUrl?: string | null
  items: BundleItemInput[]
}

export interface UpdateProductBundleRequest {
  name?: string | null
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
  title: string
  slug: string
  content: string
  updatedAt: string
}

export interface CreateStorePageRequest {
  title: string
  content: string
}

export interface UpdateStorePageRequest {
  title?: string | null
  content?: string | null
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
  name: string
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

export interface ProductFacetResponse {
  name: string
  values: string[]
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
  value: string
}

export interface ProductOptionResponse {
  id: string
  name: string
  values: ProductOptionValueResponse[]
}

export interface CreateProductOptionRequest {
  name: string
}

export interface CreateProductOptionValueRequest {
  value: string
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
  name: string
  description: string | null
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

export interface CreateProductRequest {
  name: string
  description?: string | null
  videoUrl?: string | null
  basePrice: number
  salePrice?: number | null
  categoryId?: string | null
  collectionIds?: string[] | null
}

export interface UpdateProductRequest {
  name?: string | null
  description?: string | null
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
  optionName: string
  value: string
}

export interface CartItemResponse {
  id: string
  variantId: string
  productName: string
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
  bundleName: string
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
