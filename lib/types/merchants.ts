export interface RegisterMerchantRequest {
  name: string
  slug: string
  commissionPercent: number
  websiteUrl?: string | null
  instagramHandle?: string | null
  description?: string | null
  logoUrl?: string | null
}

export interface UpdateMerchantRequest {
  name?: string | null
  websiteUrl?: string | null
  instagramHandle?: string | null
  description?: string | null
  logoUrl?: string | null
  commissionPercent?: number | null
  notificationEmail?: string | null
}

export interface MerchantResponse {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  websiteUrl: string | null
  instagramHandle: string | null
  description: string | null
  commissionPercent: number
  balance: number
  apiKey: string
  notificationEmail: string | null
  isActive: boolean
  isHighlighted: boolean
  createdAt: string
}

export interface TopCreatorEntry {
  creatorId: string
  creatorName: string
  creatorSlug: string
  clicks: number
  conversions: number
  commissionEarned: number
}

export interface MerchantSnippetResponse {
  apiKey: string
  snippet1: string
  snippet2: string
}

export interface MerchantDashboardResponse {
  totalClicks: number
  totalConversions: number
  totalCommissionPaid: number
  currentBalance: number
  topCreators: TopCreatorEntry[]
  from: string | null
  to: string | null
}
