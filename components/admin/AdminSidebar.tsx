'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { NipNipLogo } from '@/components/NipNipLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const NAV = [
  {
    href: '/admin',
    label: 'Overview',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: '/admin/merchants',
    label: 'Merchants',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M2 6.5h12M3 2h10l1 4.5H2L3 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M2 6.5v7h12v-7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/admin/creators',
    label: 'Creators',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 14c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/admin/conversions',
    label: 'Conversions',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/admin/payouts',
    label: 'Payouts',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="11.5" cy="10.5" r="1" fill="currentColor"/>
        <path d="M4 2h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/demo-login',
    label: 'Demo Login',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M6 2H3.5a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 3.5 14H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10.5 11l3-3-3-3M13.3 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-full bg-[#08080d] border-r border-white/6 flex flex-col shrink-0">

      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/6 shrink-0">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity select-none" aria-label="NipNip">
          <NipNipLogo className="h-7" />
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-amber-400 uppercase tracking-wider select-none">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-amber-500/15 text-amber-300'
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
