export interface QuickShipperStatusResponse {
  isConnected: boolean
  connectedAt: string | null
  hasPickupLocation: boolean
}

export interface ConnectQuickShipperRequest {
  username: string
  password: string
}

export interface PickupLocationResponse {
  address: string | null
  latitude: number | null
  longitude: number | null
  contactName: string | null
  phone: string | null
}

export interface SavePickupLocationRequest {
  address: string
  latitude: number
  longitude: number
  contactName: string
  phone: string
}

export interface QuickShipperCustomFieldResponse {
  id: number
  name: string | null
  isOptional: boolean
  description: string | null
  placeholder: string | null
  listValues: string[] | null
  type: string | null
  valueType: string | null
}

export interface QuickShipperFeeOptionResponse {
  providerId: number
  providerName: string | null
  providerLogoUrl: string | null
  price: number
  currency: string | null
  deliverySpeedName: string | null
  priceId: string | null
  hasCashOnDelivery: boolean
  isActive: boolean
}

export interface QuickShipperFeesResponse {
  options: QuickShipperFeeOptionResponse[]
  distance: number
}

export interface QuickShipperCustomFieldValueRequest {
  id: number
  value: string
  type?: string | null
}

export interface CreateQuickShipperOrderRequest {
  providerId: number
  priceId?: string | null
  customFieldValues?: QuickShipperCustomFieldValueRequest[]
}
