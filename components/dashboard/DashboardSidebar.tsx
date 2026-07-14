'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useLanguage } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { NipNipLogo } from '@/components/NipNipLogo'
import { STORE_NAV_ITEMS } from '@/lib/dashboard/store-nav'

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
const CHEVRON_ICON = (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
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
}

type NavLink = { href: string; label: string; exact: boolean; icon: React.ReactNode }
type NavDivider = { divider: true }
type NavGroup = { group: string; icon: React.ReactNode; items: NavLink[] }
type NavItem = NavLink | NavDivider | NavGroup

export function DashboardSidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const isMerchant = pathname.startsWith('/dashboard/merchant')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const CREATOR_NAV: NavItem[] = [
    { href: '/dashboard/creator', label: t.sidebar.dashboard, exact: true, icon: GRID_ICON },
    { href: '/dashboard/creator/my-links', label: t.sidebar.myLinks, exact: false, icon: LINK_ICON },
    { href: '/dashboard/creator/earnings', label: t.sidebar.earnings, exact: false, icon: EARNINGS_ICON },
    { href: '/dashboard/creator/payouts', label: t.sidebar.payouts, exact: false, icon: PAYOUT_ICON },
    { href: '/dashboard/creator/settings', label: t.sidebar.settings, exact: false, icon: SETTINGS_ICON },
    { divider: true as const },
    { href: '/merchants', label: t.sidebar.browseMarketplace, exact: false, icon: BROWSE_ICON },
  ]

  const MERCHANT_NAV: NavItem[] = [
    { href: '/dashboard/merchant', label: t.sidebar.dashboard, exact: true, icon: GRID_ICON },
    {
      group: t.sidebar.affiliateGroup,
      icon: CONVERSIONS_ICON,
      items: [
        { href: '/dashboard/merchant/conversions', label: t.sidebar.conversions, exact: false, icon: CONVERSIONS_ICON },
        { href: '/dashboard/merchant/report-sale', label: t.sidebar.reportSale, exact: false, icon: PLUS_ICON },
        { href: '/dashboard/merchant/integration', label: t.sidebar.integration, exact: false, icon: CODE_ICON },
      ],
    },
    {
      group: t.sidebar.onlineStoreGroup,
      icon: STORE_ICON,
      items: STORE_NAV_ITEMS.map(item => ({
        href: item.href,
        label: t.sidebar[item.labelKey],
        exact: item.exact,
        icon: STORE_NAV_ICONS[item.href] ?? STORE_ICON,
      })),
    },
    { href: '/dashboard/merchant/settings', label: t.sidebar.settings, exact: false, icon: SETTINGS_ICON },
    { divider: true as const },
    { href: '/merchants', label: t.sidebar.marketplace, exact: false, icon: BROWSE_ICON },
  ]

  const nav = isMerchant ? MERCHANT_NAV : CREATOR_NAV

  return (
    <aside className="w-60 min-h-full bg-[#08080d] border-r border-white/6 flex flex-col">

      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/6 shrink-0">
        <Link href="/" className="hover:opacity-80 transition-opacity select-none" aria-label="NipNip">
          <NipNipLogo className="h-7" />
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
          if ('group' in item) {
            const groupActive = item.items.some(sub => sub.exact ? pathname === sub.href : pathname.startsWith(sub.href))
            const isOpen = openGroups[item.group] ?? groupActive
            return (
              <details
                key={item.group}
                open={isOpen}
                onToggle={e => {
                  const nowOpen = (e.target as HTMLDetailsElement).open
                  setOpenGroups(prev => ({ ...prev, [item.group]: nowOpen }))
                }}
                className="group/nav"
              >
                <summary
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden',
                    groupActive ? 'text-violet-300' : 'text-white/50 hover:text-white hover:bg-white/5',
                  ].join(' ')}
                >
                  {item.icon}
                  <span className="flex-1">{item.group}</span>
                  <span className="transition-transform group-open/nav:rotate-180">{CHEVRON_ICON}</span>
                </summary>
                <div className="flex flex-col gap-0.5 pl-4 mt-0.5">
                  {item.items.map(sub => {
                    const subActive = sub.exact ? pathname === sub.href : pathname.startsWith(sub.href)
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={[
                          'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                          subActive
                            ? 'bg-violet-500/15 text-violet-300'
                            : 'text-white/40 hover:text-white hover:bg-white/5',
                        ].join(' ')}
                      >
                        {sub.icon}
                        {sub.label}
                      </Link>
                    )
                  })}
                </div>
              </details>
            )
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
