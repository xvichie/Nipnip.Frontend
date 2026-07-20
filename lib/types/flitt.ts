export interface FlittStatusResponse {
  isConnected: boolean
  merchantId: string | null
  connectedAt: string | null
}

export interface ConnectFlittRequest {
  merchantId: string
  secretKey: string
}
