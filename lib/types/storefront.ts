export type PaymentMethod = 'CashOnDelivery' | 'BankTransfer'

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
  createdAt: string
}

export interface UpdateStoreRequest {
  name?: string | null
  themeId?: string | null
  themeConfig?: string | null
  isActive?: boolean | null
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
  stock: number
  optionValueIds: string[]
}

export interface CreateProductVariantRequest {
  sku: string
  price: number
  salePrice?: number | null
  stock: number
  optionValueIds: string[]
}

export interface UpdateProductVariantRequest {
  sku?: string | null
  price?: number | null
  salePrice?: number | null
  stock?: number | null
}

export interface ProductDetailResponse {
  id: string
  slug: string
  categoryId: string | null
  name: string
  description: string | null
  basePrice: number
  salePrice: number | null
  isActive: boolean
  images: ProductImageResponse[]
  options: ProductOptionResponse[]
  variants: ProductVariantResponse[]
}

export interface CreateProductRequest {
  name: string
  description?: string | null
  basePrice: number
  salePrice?: number | null
  categoryId?: string | null
}

export interface UpdateProductRequest {
  name?: string | null
  description?: string | null
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
  sku: string
  price: number
  quantity: number
  imageUrl: string | null
  stock: number
  options: CartItemOptionResponse[]
}

export interface CartResponse {
  id: string
  sessionId: string
  items: CartItemResponse[]
  total: number
}

export interface AddCartItemRequest {
  variantId: string
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
}

export interface OrderItemResponse {
  id: string
  variantId: string
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
