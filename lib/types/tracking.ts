import type { ConversionSource, ConversionStatus } from './shared'

export interface AdminConversionEntry {
  id: string
  merchantId: string
  merchantName: string
  merchantSlug: string
  creatorId: string
  creatorName: string
  creatorSlug: string
  orderId: string
  orderAmount: number
  commissionAmount: number
  creatorFeeAmount: number
  merchantFeeAmount: number
  creatorEarnings: number
  currency: string
  source: ConversionSource
  status: ConversionStatus
  createdAt: string
}

export interface MerchantConversionEntry {
  id: string
  creatorName: string
  creatorSlug: string
  orderId: string
  orderAmount: number
  commissionAmount: number
  merchantFeeAmount: number
  totalOwed: number
  currency: string
  source: ConversionSource
  status: ConversionStatus
  createdAt: string
}

export interface CreatorEarningEntry {
  id: string
  merchantName: string
  merchantSlug: string
  orderId: string
  orderAmount: number
  commissionAmount: number
  creatorFeeAmount: number
  creatorEarnings: number
  currency: string
  status: ConversionStatus
  createdAt: string
}

export interface TrackConversionRequest {
  ref: string
  orderId: string
  amount: number
  currency?: string | null
}

export interface ManualConversionRequest {
  creatorSlug: string
  orderAmount: number
  orderId?: string | null
  currency?: string | null
}

export interface MonthlyCreatorSummary {
  year: number
  month: number
  totalEarnings: number
  totalCommission: number
  count: number
}

export interface MonthlyMerchantSummary {
  year: number
  month: number
  totalOwed: number
  totalCommission: number
  count: number
}

export interface ConversionResponse {
  id: string
  merchantId: string
  creatorId: string
  clickId: string | null
  orderId: string
  orderAmount: number
  commissionAmount: number
  creatorFeeAmount: number
  merchantFeeAmount: number
  creatorEarnings: number
  currency: string
  source: ConversionSource
  status: ConversionStatus
  createdAt: string
}
