'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavbarAuth } from '@/components/NavbarAuth'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useLanguage } from '@/lib/i18n'
import { NipNipLogo } from '@/components/NipNipLogo'

export function SiteHeader() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const NAV_LINKS = [
    { href: '/merchants', label: t.nav.brands },
    { href: '/creators', label: t.nav.creators },
    { href: '/how-it-works', label: t.nav.howItWorks },
    { href: '/faq', label: t.nav.faq },
  ]

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/6 bg-[#08080d]/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-15 flex items-center justify-between gap-6">

        <Link href="/" className="shrink-0 hover:opacity-80 transition-opacity select-none" aria-label="NipNip">
          <NipNipLogo className="h-7" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                pathname === href
                  ? 'text-white bg-white/6'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <NavbarAuth />
        </div>

      </div>
    </header>
  )
}
