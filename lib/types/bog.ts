export interface BogStatusResponse {
  isConnected: boolean
  clientId: string | null
  connectedAt: string | null
}

export interface ConnectBogRequest {
  clientId: string
  clientSecret: string
}
