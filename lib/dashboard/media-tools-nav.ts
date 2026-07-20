import type { Strings } from '@/lib/i18n'

export interface MediaToolNavItem {
  href: string
  exact: boolean
  labelKey: keyof Strings['sidebar']
}

// Mirrors STORE_NAV_ITEMS / AI_AGENT_NAV_ITEMS's pattern — single source of truth for
// the "Media Tools" sidebar group, currently just the one Background Remover page.
export const MEDIA_TOOL_NAV_ITEMS: MediaToolNavItem[] = [
  { href: '/dashboard/merchant/media/background-remover', exact: false, labelKey: 'backgroundRemover' },
]
