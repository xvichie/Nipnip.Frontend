export interface RegisterCreatorRequest {
  name: string
  slug: string
  avatarUrl?: string | null
  instagramHandle?: string | null
  tiktokHandle?: string | null
}

export interface UpdateCreatorRequest {
  name?: string | null
  avatarUrl?: string | null
  instagramHandle?: string | null
  instagramFollowers?: number | null
  tiktokHandle?: string | null
  tiktokFollowers?: number | null
  youtubeHandle?: string | null
  youtubeFollowers?: number | null
  facebookHandle?: string | null
  facebookFollowers?: number | null
  xHandle?: string | null
  xFollowers?: number | null
  linkedinHandle?: string | null
  linkedinFollowers?: number | null
}

export interface CreatorResponse {
  id: string
  name: string
  slug: string
  avatarUrl: string | null
  instagramHandle: string | null
  instagramFollowers: number | null
  tiktokHandle: string | null
  tiktokFollowers: number | null
  youtubeHandle: string | null
  youtubeFollowers: number | null
  facebookHandle: string | null
  facebookFollowers: number | null
  xHandle: string | null
  xFollowers: number | null
  linkedinHandle: string | null
  linkedinFollowers: number | null
  isActive: boolean
  isHighlighted: boolean
  createdAt: string
}

export interface TopMerchantEntry {
  merchantId: string
  merchantName: string
  merchantSlug: string
  clicks: number
  conversions: number
  commissionEarned: number
}

export interface CreatorDashboardResponse {
  totalClicks: number
  totalConversions: number
  totalEarned: number
  topMerchants: TopMerchantEntry[]
  from: string | null
  to: string | null
}
