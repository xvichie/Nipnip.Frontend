import type { Strings } from '@/lib/i18n'

export type StoreNavGroup = 'overview' | 'design' | 'products' | 'orders' | 'promotions' | 'content' | 'settings'

export interface StoreNavItem {
  href: string
  exact: boolean
  labelKey: keyof Strings['sidebar']
  group: StoreNavGroup
}

// Single source of truth for the merchant store's sub-navigation — both the
// store layout's tab bar and the dashboard sidebar's "Online Store" group
// render from this list, so adding an entry here surfaces it in both places.
// `group` only drives the sidebar's grouped rendering; the flat tab bar ignores it.
export const STORE_NAV_ITEMS: StoreNavItem[] = [
  { href: '/dashboard/merchant/store', exact: true, labelKey: 'storeOverview', group: 'overview' },
  { href: '/dashboard/merchant/store/analytics', exact: false, labelKey: 'storeAnalytics', group: 'overview' },
  { href: '/dashboard/merchant/store/design', exact: false, labelKey: 'storeDesign', group: 'design' },
  { href: '/dashboard/merchant/store/layout', exact: false, labelKey: 'storeLayout', group: 'design' },
  { href: '/dashboard/merchant/store/categories', exact: false, labelKey: 'storeCategories', group: 'products' },
  { href: '/dashboard/merchant/store/collections', exact: false, labelKey: 'storeCollections', group: 'products' },
  { href: '/dashboard/merchant/store/bundles', exact: false, labelKey: 'storeBundles', group: 'products' },
  { href: '/dashboard/merchant/store/products', exact: false, labelKey: 'storeProducts', group: 'products' },
  { href: '/dashboard/merchant/store/orders', exact: false, labelKey: 'storeOrders', group: 'orders' },
  { href: '/dashboard/merchant/store/discount-codes', exact: false, labelKey: 'storeDiscountCodes', group: 'promotions' },
  { href: '/dashboard/merchant/store/faq', exact: false, labelKey: 'storeFaq', group: 'content' },
  { href: '/dashboard/merchant/store/pages', exact: false, labelKey: 'storePages', group: 'content' },
  { href: '/dashboard/merchant/store/payments', exact: false, labelKey: 'storePayments', group: 'settings' },
  { href: '/dashboard/merchant/store/delivery', exact: false, labelKey: 'storeDelivery', group: 'settings' },
  { href: '/dashboard/merchant/store/domain', exact: false, labelKey: 'storeDomain', group: 'settings' },
  { href: '/dashboard/merchant/store/contact', exact: false, labelKey: 'storeContact', group: 'settings' },
  { href: '/dashboard/merchant/store/messages', exact: false, labelKey: 'storeMessages', group: 'settings' },
  { href: '/dashboard/merchant/store/integrations', exact: false, labelKey: 'storeIntegrations', group: 'settings' },
]

export const STORE_NAV_GROUP_ORDER: StoreNavGroup[] = ['overview', 'design', 'products', 'orders', 'promotions', 'content', 'settings']

export const STORE_NAV_GROUP_LABEL_KEYS: Record<StoreNavGroup, keyof Strings['sidebar']> = {
  overview: 'navGroupOverview',
  design: 'navGroupDesign',
  products: 'navGroupProducts',
  orders: 'navGroupOrders',
  promotions: 'navGroupPromotions',
  content: 'navGroupContent',
  settings: 'navGroupSettings',
}
