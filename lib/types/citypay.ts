export interface CityPayStatusResponse {
  isConnected: boolean
  customerId: string | null
  connectedAt: string | null
}

export interface ConnectCityPayRequest {
  customerId: string
  accessToken: string
}
