export interface LinkTreeItemResponse {
  id: string
  merchantId: string
  merchantName: string
  merchantSlug: string
  merchantLogoUrl: string | null
  label: string | null
  position: number
}

export interface LinkTreeResponse {
  creatorName: string
  creatorSlug: string
  creatorAvatarUrl: string | null
  items: LinkTreeItemResponse[]
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
