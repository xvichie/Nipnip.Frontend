import type { MerchantResponse } from './merchants'
import type { StoreResponse } from './storefront'

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

export interface CreateProspectRequest {
  name: string
  slug: string
}

export interface ProspectResponse {
  merchant: MerchantResponse
  store: StoreResponse
}

/** Omit clerkUserId to just unflag the prospect; pass it to also hand ownership to the real customer's Clerk account. */
export interface PromoteProspectRequest {
  clerkUserId?: string | null
}

/** Provide exactly one of url or html. */
export interface ImportFacebookRequest {
  url?: string | null
  html?: string | null
}

export interface ImportFacebookResponse {
  name: string | null
  description: string | null
  /** A data: URI ready to convert to a File and upload — not a Facebook-hosted link. */
  imageDataUri: string | null
}
