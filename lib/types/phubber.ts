export interface PhubberStatusResponse {
  isConnected: boolean
  sellerId: string | null
  connectedAt: string | null
}

export interface ConnectPhubberRequest {
  sellerId: string
}

export interface PhubberProductSummary {
  id: string
  title: string
  price: number | null
  thumbnailUrl: string | null
}

export interface PhubberProductsListResponse {
  products: PhubberProductSummary[]
  currentPage: number
  totalPages: number
}
