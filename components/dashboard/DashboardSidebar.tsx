'use client'

import { useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useLanguage } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { NipNipLogo } from '@/components/NipNipLogo'
import { STORE_NAV_ITEMS } from '@/lib/dashboard/store-nav'
import { AI_AGENT_NAV_ITEMS } from '@/lib/dashboard/ai-agent-nav'
import { SIDEBAR_COLLAPSED_EVENT, SIDEBAR_COLLAPSED_KEY } from '@/lib/dashboard/sidebar-state'

const GRID_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)
const SETTINGS_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M13.657 6.343A6.5 6.5 0 0 0 13.1 5l.8-1.4-1.5-1.5L11 2.9A6.5 6.5 0 0 0 9.657 2.343L9.3 1H6.7l-.357 1.343A6.5 6.5 0 0 0 5 2.9L3.6 2.1 2.1 3.6 2.9 5A6.5 6.5 0 0 0 2.343 6.343L1 6.7v2.6l1.343.357A6.5 6.5 0 0 0 2.9 11l-.8 1.4 1.5 1.5L5 13.1a6.5 6.5 0 0 0 1.343.557L6.7 15h2.6l.357-1.343A6.5 6.5 0 0 0 11 13.1l1.4.8 1.5-1.5-.8-1.4a6.5 6.5 0 0 0 .557-1.343L15 9.3V6.7l-1.343-.357Z" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
)
const BROWSE_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8S8 14.5 8 14.5M1.5 8h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const LINK_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M6.5 9.5a3.536 3.536 0 0 0 5 0l2-2a3.536 3.536 0 0 0-5-5l-1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.5 6.5a3.536 3.536 0 0 0-5 0l-2 2a3.536 3.536 0 0 0 5 5l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const LINK_TREE_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M8 1.5v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 5.5H4.5a1.5 1.5 0 0 0-1.5 1.5v1M8 9H4.5a1.5 1.5 0 0 0-1.5 1.5v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="3" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="3" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
)
const EARNINGS_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 7.5h14" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="11.5" cy="10.5" r="1" fill="currentColor"/>
    <path d="M3.5 2.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const CONVERSIONS_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const PLUS_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
)
const CODE_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M5.5 5L2 8l3.5 3M10.5 5L14 8l-3.5 3M9.5 4.5l-3 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const STORE_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M2 6l.7-3.5A1 1 0 0 1 3.68 1.7h8.64a1 1 0 0 1 .98.8L14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 6a2 2 0 1 0 4 0 2 2 0 1 0 4 0 2 2 0 1 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6.5V14h10V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 14v-4h3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const PAYOUT_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1" y="5" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 8.5h14" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="11.5" cy="11" r="1" fill="currentColor"/>
    <path d="M4 3h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const BAG_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M4.5 5V3.5a3.5 3.5 0 1 1 7 0V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="2" y="5" width="12" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)
const TAG_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M8.7 1.7H3.7a1 1 0 0 0-1 1v5l6.6 6.6a1 1 0 0 0 1.4 0l4-4a1 1 0 0 0 0-1.4L8.7 1.7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <circle cx="5.2" cy="5.2" r="1" fill="currentColor"/>
  </svg>
)
const DOC_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M4 1.5h5.5L12.5 4.5V14a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M9.5 1.5V4.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M5.5 8h5M5.5 10.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)
const PALETTE_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M8 1.5a6.5 6.5 0 1 0 0 13c.8 0 1.3-.7.9-1.4-.2-.4-.1-.9.3-1.1.3-.2.7-.2 1 0 .6.4 1.4.1 1.6-.6.6-2 .2-4.3-1.3-6C9.4 4.2 8 3.8 8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <circle cx="5.2" cy="7" r="0.9" fill="currentColor"/>
    <circle cx="6.8" cy="4.5" r="0.9" fill="currentColor"/>
    <circle cx="5" cy="10" r="0.9" fill="currentColor"/>
  </svg>
)
const BOX_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M1.5 4.8 8 1.5l6.5 3.3v6.4L8 14.5l-6.5-3.3V4.8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M1.5 4.8 8 8m0 0 6.5-3.2M8 8v6.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
)
const MAIL_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const CONTACT_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M3 2h2.3l1.4 3.3-1.4 1.1a7.6 7.6 0 0 0 4.1 4.1l1.1-1.4L14 10.7v2.3a1.3 1.3 0 0 1-1.3 1.3C6.7 14.3 1.7 9.3 1.7 3.3A1.3 1.3 0 0 1 3 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
)
const PAYMENT_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M4 9.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const DELIVERY_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M1.5 4h7v7h-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M8.5 6.5h3l2.5 2.5v2h-5.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <circle cx="4" cy="12.5" r="1.3" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="11.5" cy="12.5" r="1.3" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
)
const DOMAIN_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M1.5 8h13M8 1.5c1.8 1.8 2.8 4.1 2.8 6.5S9.8 12.7 8 14.5C6.2 12.7 5.2 10.4 5.2 8S6.2 3.3 8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
)
const PLUG_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M5.5 1.5v3.7M10.5 1.5v3.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M3.3 5.2h9.4v2.3a4.7 4.7 0 0 1-4.7 4.7 4.7 4.7 0 0 1-4.7-4.7V5.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M8 12.2v2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const CHAT_AGENT_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M1.5 3.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v5.5a2 2 0 0 1-2 2H8l-3.5 3v-3H3.5a2 2 0 0 1-2-2V3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M5.5 6.2c.5-1 1.3-1.5 2.5-1.5s2 .8 2 1.7c0 1.3-1.8 1.3-2 2.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8" cy="11" r="0.9" fill="currentColor"/>
  </svg>
)

// Classic "panel" sidebar-toggle glyph (Notion/Linear/VS Code style) — the shaded
// segment mirrors sides between states, so the icon itself communicates the action.
const SIDEBAR_COLLAPSE_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M6.25 3v10" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2.5 3.6h3v8.8h-3a1 1 0 0 1-1-1V4.6a1 1 0 0 1 1-1Z" fill="currentColor" fillOpacity="0.35"/>
    <path d="M9 6.25 7.25 8 9 9.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const SIDEBAR_EXPAND_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M9.75 3v10" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M10.5 3.6h3a1 1 0 0 1 1 1v6.8a1 1 0 0 1-1 1h-3V3.6Z" fill="currentColor" fillOpacity="0.35"/>
    <path d="M6 6.25 7.75 8 6 9.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// useSyncExternalStore instead of useState+useEffect — localStorage isn't available
// during SSR, and this avoids both a hydration mismatch and an extra post-mount render.
//
// The collapsed-to-icon-rail state is a desktop-only affordance for reclaiming width
// from the always-visible rail — it means nothing inside the mobile slide-out drawer,
// which already overlays the page and closes on outside click. Without this guard, a
// merchant who ever collapsed the desktop rail would open the mobile menu to a useless
// icon-only strip with no labels. Below the `lg` breakpoint (matches Tailwind's `lg:`),
// force it false regardless of what's in localStorage, and re-check on resize so it
// updates live if the viewport crosses the breakpoint.
const LG_BREAKPOINT_PX = 1024

function subscribeToCollapsed(callback: () => void) {
  window.addEventListener(SIDEBAR_COLLAPSED_EVENT, callback)
  window.addEventListener('resize', callback)
  return () => {
    window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, callback)
    window.removeEventListener('resize', callback)
  }
}
function getCollapsedSnapshot() {
  if (window.innerWidth < LG_BREAKPOINT_PX) return false
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
}
function getCollapsedServerSnapshot() {
  return false
}

const STORE_NAV_ICONS: Record<string, React.ReactNode> = {
  '/dashboard/merchant/store': STORE_ICON,
  '/dashboard/merchant/store/design': PALETTE_ICON,
  '/dashboard/merchant/store/categories': TAG_ICON,
  '/dashboard/merchant/store/products': BOX_ICON,
  '/dashboard/merchant/store/orders': BAG_ICON,
  '/dashboard/merchant/store/payments': PAYMENT_ICON,
  '/dashboard/merchant/store/delivery': DELIVERY_ICON,
  '/dashboard/merchant/store/domain': DOMAIN_ICON,
  '/dashboard/merchant/store/pages': DOC_ICON,
  '/dashboard/merchant/store/contact': CONTACT_ICON,
  '/dashboard/merchant/store/messages': MAIL_ICON,
  '/dashboard/merchant/store/integrations': PLUG_ICON,
}

type NavLink = { href: string; label: string; exact: boolean; icon: React.ReactNode }
type NavDivider = { divider: true }
type NavItem = NavLink | NavDivider

type MerchantSection = 'affiliate' | 'store' | 'ai-agents'

// Portal-rendered instead of a plain absolutely-positioned popover — the sidebar's
// drawer wrapper clips overflow-x unconditionally (see the dropdown-direction attempt
// earlier), so anything meant to escape the ~68px collapsed rail has to render outside
// that DOM subtree entirely to avoid getting clipped. The anchor rect is captured in
// the hover handler (not read from a ref during render) to satisfy react-hooks/refs.
function CollapsedTooltip({ label, rect }: { label: string; rect: DOMRect }) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      role="tooltip"
      className="fixed z-[200] px-2.5 py-1.5 rounded-lg bg-[#14141c] border border-white/10 text-white text-xs font-medium shadow-xl shadow-black/50 pointer-events-none whitespace-nowrap"
      style={{ top: rect.top + rect.height / 2, left: rect.right + 8, transform: 'translateY(-50%)' }}
    >
      {label}
    </div>,
    document.body
  )
}

function NavRow({ item, active, collapsed }: { item: NavLink; active: boolean; collapsed?: boolean }) {
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null)

  return (
    <>
      <Link
        href={item.href}
        onMouseEnter={e => { if (collapsed) setTooltipRect(e.currentTarget.getBoundingClientRect()) }}
        onMouseLeave={() => setTooltipRect(null)}
        className={[
          'flex items-center rounded-xl text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
          active ? 'bg-violet-500/15 text-violet-300' : 'text-white/50 hover:text-white hover:bg-white/5',
        ].join(' ')}
      >
        {item.icon}
        {!collapsed && item.label}
      </Link>
      {collapsed && tooltipRect && <CollapsedTooltip label={item.label} rect={tooltipRect} />}
    </>
  )
}

type MerchantSectionMeta = Record<MerchantSection, { label: string; icon: React.ReactNode }>

// Portal-based, same reasoning as CollapsedTooltip above — needs to work in both the
// full-width expanded row and the icon-only collapsed rail, and the collapsed case has
// to escape the ~68px rail without getting clipped by the sidebar's overflow-x:hidden.
function SectionSelector({
  activeSection,
  sectionMeta,
  collapsed,
  onSelect,
}: {
  activeSection: MerchantSection
  sectionMeta: MerchantSectionMeta
  collapsed: boolean
  onSelect: (next: MerchantSection) => void
}) {
  const [openRect, setOpenRect] = useState<DOMRect | null>(null)
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null)

  function handleTriggerClick(e: React.MouseEvent<HTMLElement>) {
    setTooltipRect(null)
    setOpenRect(openRect ? null : e.currentTarget.getBoundingClientRect())
  }

  function handleSelect(key: MerchantSection) {
    setOpenRect(null)
    onSelect(key)
  }

  const panelStyle = openRect
    ? collapsed
      ? { top: openRect.top, left: openRect.right + 8, width: 192 }
      : { top: openRect.bottom + 6, left: openRect.left, width: openRect.width }
    : null

  return (
    <>
      <button
        type="button"
        onClick={handleTriggerClick}
        onMouseEnter={e => { if (collapsed) setTooltipRect(e.currentTarget.getBoundingClientRect()) }}
        onMouseLeave={() => setTooltipRect(null)}
        title={collapsed ? sectionMeta[activeSection].label : undefined}
        className={[
          'flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 border border-white/10 text-white/85 hover:border-fuchsia-500/30 hover:from-fuchsia-500/15 hover:to-violet-500/15 transition-all text-sm font-semibold cursor-pointer select-none',
          collapsed ? 'w-full justify-center px-0 py-2.5' : 'w-full px-3 py-2.5',
        ].join(' ')}
      >
        <span className="text-fuchsia-400 shrink-0">{sectionMeta[activeSection].icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{sectionMeta[activeSection].label}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden className="opacity-50 shrink-0">
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </>
        )}
      </button>

      {collapsed && tooltipRect && !openRect && <CollapsedTooltip label={sectionMeta[activeSection].label} rect={tooltipRect} />}

      {openRect && panelStyle && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200]" onClick={() => setOpenRect(null)}>
          <ul
            className="fixed p-1 rounded-xl border border-white/10 bg-[#0a0a10] bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 shadow-xl shadow-black/60 flex flex-col gap-0.5"
            style={panelStyle}
            onClick={e => e.stopPropagation()}
          >
            {(Object.keys(sectionMeta) as MerchantSection[]).map(key => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => handleSelect(key)}
                  className={[
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                    activeSection === key
                      ? 'bg-violet-500/15 text-violet-300'
                      : 'text-white/60 hover:text-white hover:bg-white/6',
                  ].join(' ')}
                >
                  {sectionMeta[key].icon}
                  <span className="font-medium">{sectionMeta[key].label}</span>
                  {activeSection === key && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="ml-auto shrink-0">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>,
        document.body
      )}
    </>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const isMerchant = pathname.startsWith('/dashboard/merchant')

  const collapsed = useSyncExternalStore(subscribeToCollapsed, getCollapsedSnapshot, getCollapsedServerSnapshot)

  function toggleCollapsed() {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '0' : '1')
    window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_EVENT))
  }

  const CREATOR_NAV: NavItem[] = [
    { href: '/dashboard/creator', label: t.sidebar.dashboard, exact: true, icon: GRID_ICON },
    { href: '/dashboard/creator/my-links', label: t.sidebar.myLinks, exact: false, icon: LINK_ICON },
    { href: '/dashboard/creator/link-tree', label: t.sidebar.linkTree, exact: false, icon: LINK_TREE_ICON },
    { href: '/dashboard/creator/earnings', label: t.sidebar.earnings, exact: false, icon: EARNINGS_ICON },
    { href: '/dashboard/creator/payouts', label: t.sidebar.payouts, exact: false, icon: PAYOUT_ICON },
    { href: '/dashboard/creator/settings', label: t.sidebar.settings, exact: false, icon: SETTINGS_ICON },
    { divider: true as const },
    { href: '/merchants', label: t.sidebar.browseMarketplace, exact: false, icon: BROWSE_ICON },
  ]

  // Merchant sidebar is split into switchable sections (affiliate marketing / online
  // store / AI agents) picked via the dropdown below the badge — Settings stays pinned
  // outside the switch since it applies to the whole account either way. მთავარი lives
  // inside the affiliate section since that page is itself affiliate-specific stats.
  const MERCHANT_SECTIONS: Record<MerchantSection, NavLink[]> = {
    affiliate: [
      { href: '/dashboard/merchant/affiliate', label: t.sidebar.dashboard, exact: true, icon: GRID_ICON },
      { href: '/dashboard/merchant/affiliate/conversions', label: t.sidebar.conversions, exact: false, icon: CONVERSIONS_ICON },
      { href: '/dashboard/merchant/affiliate/report-sale', label: t.sidebar.reportSale, exact: false, icon: PLUS_ICON },
      { href: '/dashboard/merchant/affiliate/integration', label: t.sidebar.integration, exact: false, icon: CODE_ICON },
    ],
    store: STORE_NAV_ITEMS.map(item => ({
      href: item.href,
      label: t.sidebar[item.labelKey],
      exact: item.exact,
      icon: STORE_NAV_ICONS[item.href] ?? STORE_ICON,
    })),
    'ai-agents': AI_AGENT_NAV_ITEMS.map(item => ({
      href: item.href,
      label: t.sidebar[item.labelKey],
      exact: item.exact,
      icon: CHAT_AGENT_ICON,
    })),
  }

  const SECTION_META: Record<MerchantSection, { label: string; icon: React.ReactNode }> = {
    affiliate: { label: t.sidebar.affiliateGroup, icon: CONVERSIONS_ICON },
    store: { label: t.sidebar.onlineStoreGroup, icon: STORE_ICON },
    'ai-agents': { label: t.sidebar.aiAgentsGroup, icon: CHAT_AGENT_ICON },
  }

  const activeSection: MerchantSection = pathname.startsWith('/dashboard/merchant/ai-agents')
    ? 'ai-agents'
    : pathname.startsWith('/dashboard/merchant/store')
      ? 'store'
      : 'affiliate'

  function handleSectionChange(next: MerchantSection) {
    router.push(
      next === 'store'
        ? '/dashboard/merchant/store'
        : next === 'ai-agents'
          ? AI_AGENT_NAV_ITEMS[0].href
          : '/dashboard/merchant/affiliate'
    )
  }

  return (
    <aside className={[
      'min-h-full bg-[#08080d] border-r border-white/6 flex flex-col transition-[width] duration-200',
      collapsed ? 'w-[68px]' : 'w-60',
    ].join(' ')}>

      {/* Logo + collapse toggle */}
      <div className={[
        'h-16 flex items-center border-b border-white/6 shrink-0',
        collapsed ? 'justify-center px-2' : 'justify-between px-5',
      ].join(' ')}>
        {!collapsed && (
          <Link href="/" className="hover:opacity-80 transition-opacity select-none" aria-label="NipNip">
            <NipNipLogo className="h-7" />
          </Link>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors shrink-0"
        >
          {collapsed ? SIDEBAR_EXPAND_ICON : SIDEBAR_COLLAPSE_ICON}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-1 shrink-0">
          <span className={[
            'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border',
            isMerchant
              ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400'
              : 'bg-violet-500/10 border-violet-500/20 text-violet-400',
          ].join(' ')}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {isMerchant ? t.sidebar.merchantBadge : t.sidebar.creatorBadge}
          </span>
        </div>
      )}

      {isMerchant ? (
        <>
          {/* Section selector */}
          <div className={collapsed ? 'px-2 pt-3 pb-2 shrink-0' : 'px-3 pt-3 pb-2 shrink-0'}>
            <SectionSelector
              activeSection={activeSection}
              sectionMeta={SECTION_META}
              collapsed={collapsed}
              onSelect={handleSectionChange}
            />
          </div>
          <div className="mx-4 border-t border-white/6 shrink-0" />

          <nav className={['flex-1 flex flex-col gap-0.5 overflow-y-auto', collapsed ? 'p-2' : 'p-3'].join(' ')}>
            {MERCHANT_SECTIONS[activeSection].map(item => (
              <NavRow
                key={item.href}
                item={item}
                active={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
                collapsed={collapsed}
              />
            ))}

            <div className="my-2 border-t border-white/6" />

            <NavRow
              item={{ href: '/dashboard/merchant/settings', label: t.sidebar.settings, exact: false, icon: SETTINGS_ICON }}
              active={pathname.startsWith('/dashboard/merchant/settings')}
              collapsed={collapsed}
            />
          </nav>
        </>
      ) : (
        <nav className={['flex-1 flex flex-col gap-0.5 overflow-y-auto', collapsed ? 'p-2' : 'p-3'].join(' ')}>
          {CREATOR_NAV.map((item, i) => {
            if ('divider' in item) {
              return <div key={`divider-${i}`} className="my-2 border-t border-white/6" />
            }
            return (
              <NavRow
                key={item.href}
                item={item}
                active={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
                collapsed={collapsed}
              />
            )
          })}
        </nav>
      )}

      {/* User + Language */}
      <div className={[
        'p-4 border-t border-white/6 shrink-0 flex items-center gap-2',
        collapsed ? 'justify-center' : 'justify-between',
      ].join(' ')}>
        <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
        {!collapsed && <LanguageSwitcher placement="top-end" />}
      </div>

    </aside>
  )
}
