export type ConversionStatus = 'Pending' | 'Confirmed' | 'Rejected' | 'Paid'

export type PayoutStatus = 'Requested' | 'Sent' | 'Rejected'

export type ConversionSource =
  | 'JsSnippet'
  | 'WooCommercePlugin'
  | 'ManualReport'
  | 'Api'

export interface PaginatedRequest {
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
