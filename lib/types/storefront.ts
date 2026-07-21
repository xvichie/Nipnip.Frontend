export type PaymentMethod = 'CashOnDelivery' | 'BankTransfer' | 'Flitt'

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'

export type ThemeId = 'minimal' | 'bold' | 'classic' | 'luxury' | 'vibrant' | 'commerce' | 'editorial'

export type SocialsPosition = 'top' | 'bottom' | 'both' | 'footer'

export type HeroLayout = 'center' | 'imageLeft' | 'imageRight'

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

export type CategoryMenuMode = 'flat' | 'dropdown'

export type CategoryMenuScope = 'all' | 'selected'

export type FooterContactFormPosition = 'off' | 'above' | 'below'

export type LandingCategoryColumns = 2 | 3 | 4 | 6

export interface ThemeConfig {
  accentColor?: string
  font?: 'sans' | 'serif' | 'mono'
  logoUrl?: string
  showStoreName?: boolean
  heroImageUrl?: string
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
  heroHeadline?: string
  heroSubheadline?: string
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
  footerContactForm?: FooterContactFormPosition
  showContactInNav?: boolean
  contactLabel?: string
  codEnabled?: boolean
  codNotes?: string
  bankTransferEnabled?: boolean
  bankTransferNotes?: string
  flittEnabled?: boolean
  shippingZones?: ShippingZone[]
  freeShippingThreshold?: number | null
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
}

export interface UpdateStoreRequest {
  name?: string | null
  themeId?: string | null
  themeConfig?: string | null
  isActive?: boolean | null
  affiliateEnabled?: boolean | null
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
}

export interface CreateCategoryRequest {
  name: string
  parentCategoryId?: string | null
  iconUrl?: string | null
  iconKey?: string | null
  iconEmoji?: string | null
}

export interface UpdateCategoryRequest {
  name?: string | null
  parentCategoryId?: string | null
  iconUrl?: string | null
  iconKey?: string | null
  iconEmoji?: string | null
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
}

export interface ProductPriceRangeResponse {
  min: number
  max: number
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

export interface CartResponse {
  id: string
  sessionId: string
  items: CartItemResponse[]
  total: number
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
  notes: OrderNoteResponse[]
  quickShipperOrderId: number | null
  quickShipperStatus: string | null
  quickShipperTrackingUrl: string | null
  quickShipperDeliveryFee: number | null
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
