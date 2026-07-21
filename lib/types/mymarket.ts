export interface MyMarketStatusResponse {
  isConnected: boolean
  shopId: string | null
  connectedAt: string | null
}

export interface ConnectMyMarketRequest {
  shopId: string
}

export interface MyMarketProductSummary {
  id: string
  title: string
  price: number | null
  thumbnailUrl: string | null
}

export interface MyMarketProductsListResponse {
  products: MyMarketProductSummary[]
  currentPage: number
  totalPages: number
}
