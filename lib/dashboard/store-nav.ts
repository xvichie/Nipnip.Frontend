import type { Strings } from '@/lib/i18n'

export interface StoreNavItem {
  href: string
  exact: boolean
  labelKey: keyof Strings['sidebar']
}

// Single source of truth for the merchant store's sub-navigation — both the
// store layout's tab bar and the dashboard sidebar's "Online Store" group
// render from this list, so adding an entry here surfaces it in both places.
export const STORE_NAV_ITEMS: StoreNavItem[] = [
  { href: '/dashboard/merchant/store', exact: true, labelKey: 'storeOverview' },
  { href: '/dashboard/merchant/store/design', exact: false, labelKey: 'storeDesign' },
  { href: '/dashboard/merchant/store/categories', exact: false, labelKey: 'storeCategories' },
  { href: '/dashboard/merchant/store/products', exact: false, labelKey: 'storeProducts' },
  { href: '/dashboard/merchant/store/orders', exact: false, labelKey: 'storeOrders' },
  { href: '/dashboard/merchant/store/payments', exact: false, labelKey: 'storePayments' },
  { href: '/dashboard/merchant/store/delivery', exact: false, labelKey: 'storeDelivery' },
  { href: '/dashboard/merchant/store/domain', exact: false, labelKey: 'storeDomain' },
  { href: '/dashboard/merchant/store/pages', exact: false, labelKey: 'storePages' },
  { href: '/dashboard/merchant/store/contact', exact: false, labelKey: 'storeContact' },
  { href: '/dashboard/merchant/store/messages', exact: false, labelKey: 'storeMessages' },
]
