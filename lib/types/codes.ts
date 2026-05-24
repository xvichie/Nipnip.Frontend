export interface ClaimCodeRequest {
  merchantId: string
  code: string
}

export interface CheckCodeResponse {
  available: boolean
}

export interface CodeResponse {
  id: string
  creatorId: string
  merchantId: string
  code: string
  createdAt: string
}
