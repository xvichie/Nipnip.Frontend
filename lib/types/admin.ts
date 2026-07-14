export interface AdminStatsResponse {
  totalMerchants: number
  totalCreators: number
  totalConversions: number
  totalCommissionVolume: number
  totalPlatformEarnings: number
  pendingCreatorPayouts: number
}

export interface AdminCreateMerchantRequest {
  clerkUserId: string
  name: string
  slug: string
  commissionPercent: number
  websiteUrl?: string | null
  instagramHandle?: string | null
  description?: string | null
  logoUrl?: string | null
}

export interface AdminCreateStoreRequest {
  slug: string
  name: string
  themeId?: string | null
  themeConfig?: string | null
}

export interface CreatorPayoutEntry {
  creatorId: string
  creatorName: string
  creatorSlug: string
  conversions: number
  totalEarnings: number
  currency: string
}

export interface AdminPayoutSummaryResponse {
  totalOwedToCreators: number
  creators: CreatorPayoutEntry[]
}
