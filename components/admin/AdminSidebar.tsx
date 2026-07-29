'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { NipNipLogo } from '@/components/NipNipLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useLanguage } from '@/lib/i18n'
import {
  getCollapsedServerSnapshot,
  getCollapsedSnapshot,
  subscribeToCollapsed,
  toggleSidebarCollapsed,
} from '@/lib/dashboard/sidebar-state'
import { CollapsedTooltip, SIDEBAR_COLLAPSE_ICON, SIDEBAR_EXPAND_ICON } from '@/components/dashboard/CollapsedTooltip'

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/admin': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  '/admin/merchants': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 6.5h12M3 2h10l1 4.5H2L3 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M2 6.5v7h12v-7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  ),
  '/admin/creators': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 14c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  '/admin/conversions': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  '/admin/payouts': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11.5" cy="10.5" r="1" fill="currentColor"/>
      <path d="M4 2h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  '/admin/prospects': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 1.5l1.6 3.6 3.9.4-2.9 2.7.8 3.9L8 10.2l-3.4 2 .8-3.9-2.9-2.7 3.9-.4L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  ),
  '/admin/website-inquiries': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.5" y="3" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1.5 4.5l6.5 4.5 6.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  '/demo-login': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 2H3.5a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 3.5 14H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10.5 11l3-3-3-3M13.3 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

function AdminNavRow({
  href, label, icon, active, collapsed,
}: {
  href: string
  label: string
  icon: React.ReactNode
  active: boolean
  collapsed: boolean
}) {
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null)

  return (
    <>
      <Link
        href={href}
        onMouseEnter={e => { if (collapsed) setTooltipRect(e.currentTarget.getBoundingClientRect()) }}
        onMouseLeave={() => setTooltipRect(null)}
        className={[
          'flex items-center rounded-xl text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
          active
            ? 'bg-amber-500/15 text-amber-300'
            : 'text-white/50 hover:text-white hover:bg-white/5',
        ].join(' ')}
      >
        {icon}
        {!collapsed && label}
      </Link>
      {collapsed && tooltipRect && <CollapsedTooltip label={label} rect={tooltipRect} />}
    </>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const collapsed = useSyncExternalStore(subscribeToCollapsed, getCollapsedSnapshot, getCollapsedServerSnapshot)

  function toggleCollapsed() {
    toggleSidebarCollapsed(collapsed)
  }

  const NAV = [
    { href: '/admin', label: t.admin.overview, exact: true },
    { href: '/admin/merchants', label: t.admin.merchants, exact: false },
    { href: '/admin/creators', label: t.admin.creators, exact: false },
    { href: '/admin/conversions', label: t.admin.conversions, exact: false },
    { href: '/admin/payouts', label: t.admin.payouts, exact: false },
    { href: '/admin/prospects', label: t.admin.prospects, exact: false },
    { href: '/admin/website-inquiries', label: t.admin.websiteInquiries, exact: false },
    { href: '/demo-login', label: t.admin.demoLogin, exact: false },
  ]

  return (
    <aside className={[
      'h-full bg-[#08080d] border-r border-white/6 flex flex-col shrink-0 transition-[width] duration-200',
      collapsed ? 'w-[68px]' : 'w-56',
    ].join(' ')}>

      {/* Logo + collapse toggle */}
      <div className={[
        'h-16 flex items-center border-b border-white/6 shrink-0',
        collapsed ? 'justify-center px-2' : 'justify-between px-5',
      ].join(' ')}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity select-none min-w-0" aria-label="NipNip">
            <NipNipLogo className="h-7 shrink-0" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-amber-400 uppercase tracking-wider select-none shrink-0">
              {t.admin.badge}
            </span>
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

      {/* Nav */}
      <nav className={['flex-1 flex flex-col gap-0.5 overflow-y-auto', collapsed ? 'p-2' : 'p-3'].join(' ')}>
        {NAV.map(({ href, label, exact }) => (
          <AdminNavRow
            key={href}
            href={href}
            label={label}
            icon={NAV_ICONS[href]}
            active={exact ? pathname === href : pathname.startsWith(href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

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
