export interface TbcStatusResponse {
  isConnected: boolean
  clientId: string | null
  connectedAt: string | null
}

export interface ConnectTbcRequest {
  clientId: string
  clientSecret: string
}
