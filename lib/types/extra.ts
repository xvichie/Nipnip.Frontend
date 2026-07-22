export interface ExtraStatusResponse {
  isConnected: boolean
  sellerId: string | null
  connectedAt: string | null
}

export interface ConnectExtraRequest {
  sellerId: string
}

export interface ExtraProductSummary {
  offerSecondaryId: number
  productSecondaryId: number
  slug: string
  title: string
  price: number | null
  thumbnailUrl: string | null
}

export interface ExtraProductsListResponse {
  products: ExtraProductSummary[]
  currentPage: number
  totalPages: number
}
