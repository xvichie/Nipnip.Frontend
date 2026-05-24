'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useLanguage } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

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
const PAYOUT_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1" y="5" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 8.5h14" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="11.5" cy="11" r="1" fill="currentColor"/>
    <path d="M4 3h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export function DashboardSidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const isMerchant = pathname.startsWith('/dashboard/merchant')

  const CREATOR_NAV = [
    { href: '/dashboard/creator', label: t.sidebar.dashboard, exact: true, icon: GRID_ICON },
    { href: '/dashboard/creator/my-links', label: t.sidebar.myLinks, exact: false, icon: LINK_ICON },
    { href: '/dashboard/creator/earnings', label: t.sidebar.earnings, exact: false, icon: EARNINGS_ICON },
    { href: '/dashboard/creator/payouts', label: t.sidebar.payouts, exact: false, icon: PAYOUT_ICON },
    { href: '/dashboard/creator/settings', label: t.sidebar.settings, exact: false, icon: SETTINGS_ICON },
    { divider: true as const },
    { href: '/merchants', label: t.sidebar.browseMarketplace, exact: false, icon: BROWSE_ICON },
  ]

  const MERCHANT_NAV = [
    { href: '/dashboard/merchant', label: t.sidebar.dashboard, exact: true, icon: GRID_ICON },
    { href: '/dashboard/merchant/conversions', label: t.sidebar.conversions, exact: false, icon: CONVERSIONS_ICON },
    { href: '/dashboard/merchant/report-sale', label: t.sidebar.reportSale, exact: false, icon: PLUS_ICON },
    { href: '/dashboard/merchant/integration', label: t.sidebar.integration, exact: false, icon: CODE_ICON },
    { href: '/dashboard/merchant/settings', label: t.sidebar.settings, exact: false, icon: SETTINGS_ICON },
    { divider: true as const },
    { href: '/merchants', label: t.sidebar.marketplace, exact: false, icon: BROWSE_ICON },
  ]

  const nav = isMerchant ? MERCHANT_NAV : CREATOR_NAV

  return (
    <aside className="w-60 min-h-full bg-[#08080d] border-r border-white/6 flex flex-col">

      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/6 shrink-0">
        <Link href="/" className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400 select-none hover:opacity-80 transition-opacity">
          NipNip
        </Link>
      </div>

      {/* Role badge */}
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

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {nav.map((item, i) => {
          if ('divider' in item) {
            return <div key={`divider-${i}`} className="my-2 border-t border-white/6" />
          }
          const { href, label, icon, exact } = item
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-500/15 text-violet-300'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + Language */}
      <div className="p-4 border-t border-white/6 shrink-0 flex items-center justify-between gap-2">
        <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
        <LanguageSwitcher placement="top-end" />
      </div>

    </aside>
  )
}
