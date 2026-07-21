export interface MyMarketStatusResponse {
  isConnected: boolean
  shopId: string | null
  connectedAt: string | null
}

export interface ConnectMyMarketRequest {
  shopId: string
}
