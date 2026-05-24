import type { PayoutStatus } from './shared'

export interface RequestPayoutRequest {
  amount: number
  currency?: string
}

export interface MarkPayoutSentRequest {
  amountSent: number
  notes?: string | null
}

export interface PayoutResponse {
  id: string
  creatorId: string
  creatorName: string
  creatorSlug: string
  requestedAmount: number
  amountSent: number | null
  currency: string
  status: PayoutStatus
  notes: string | null
  createdAt: string
  paidAt: string | null
}

export interface AvailableBalanceResponse {
  availableBalance: number
}
