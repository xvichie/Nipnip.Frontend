import type { Strings } from '@/lib/i18n'

export interface AiAgentNavItem {
  href: string
  exact: boolean
  labelKey: keyof Strings['sidebar']
}

// Mirrors STORE_NAV_ITEMS's pattern — single source of truth for the "AI Agents"
// sidebar group, currently just the one Messaging Agent page.
export const AI_AGENT_NAV_ITEMS: AiAgentNavItem[] = [
  { href: '/dashboard/merchant/ai-agents/messaging-agent', exact: false, labelKey: 'messagingAgent' },
]
