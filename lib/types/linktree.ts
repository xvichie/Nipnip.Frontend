export interface LinkTreeItemResponse {
  id: string
  merchantId: string
  merchantName: string
  merchantSlug: string
  merchantLogoUrl: string | null
  label: string | null
  position: number
}

export interface LinkTreeSummaryResponse {
  id: string
  name: string
  slug: string
  isDefault: boolean
  position: number
  itemCount: number
}

export interface LinkTreeDetailResponse {
  id: string
  name: string
  slug: string
  isDefault: boolean
  items: LinkTreeItemResponse[]
}

export interface PublicLinkTreeResponse {
  creatorName: string
  creatorSlug: string
  creatorAvatarUrl: string | null
  treeName: string
  items: LinkTreeItemResponse[]
}

export interface CreateLinkTreeRequest {
  name: string
  slug: string
}

export interface UpdateLinkTreeRequest {
  name?: string | null
  slug?: string | null
}

export interface AddLinkTreeItemRequest {
  merchantId: string
  label?: string | null
}

export interface UpdateLinkTreeItemRequest {
  label?: string | null
}

export interface ReorderLinkTreeItemsRequest {
  orderedItemIds: string[]
}
