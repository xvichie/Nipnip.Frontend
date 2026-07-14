'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMyNewOrderCount, useMyStore, useMyUnreadContactMessageCount } from '@/lib/queries/storefront-admin'
import { useLanguage } from '@/lib/i18n'
import { STORE_NAV_ITEMS } from '@/lib/dashboard/store-nav'

export default function MerchantStoreLayout({ children }: { children: React.ReactNode }) {
  const { data: store } = useMyStore()
  const { data: unread } = useMyUnreadContactMessageCount()
  const { data: newOrders } = useMyNewOrderCount()
  const pathname = usePathname()
  const { t } = useLanguage()

  const badgeCounts: Record<string, number> = {
    '/dashboard/merchant/store/orders': newOrders?.count ?? 0,
    '/dashboard/merchant/store/messages': unread?.count ?? 0,
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">მაღაზია</h1>
          {store && <p className="text-white/40 text-sm mt-1">{store.slug}.nipnip.ge</p>}
        </div>
        {store && (
          <a
            href={`https://${store.slug}.nipnip.ge`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm gap-1.5 bg-fuchsia-600/15 border-fuchsia-500/25 text-fuchsia-300 hover:bg-fuchsia-600/25 shrink-0"
          >
            ვებგვერდის ნახვა
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M5 9l4-4M5.5 3H11v5.5M3 5.5V11h5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        )}
      </div>

      <div className="flex gap-1 border-b border-white/7 overflow-x-auto">
        {STORE_NAV_ITEMS.map(tab => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
          const badgeCount = badgeCounts[tab.href] ?? 0
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors flex items-center gap-1.5',
                active ? 'border-fuchsia-500 text-white' : 'border-transparent text-white/40 hover:text-white/70',
              ].join(' ')}
            >
              {t.sidebar[tab.labelKey]}
              {badgeCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-fuchsia-500 text-white text-[10px] font-bold leading-none">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
