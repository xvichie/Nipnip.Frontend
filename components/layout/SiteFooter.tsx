'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'
import { NipNipLogo } from '@/components/NipNipLogo'
import { CImg } from '@/components/ui/CImg'
import { WebsiteInquiryForm } from '@/components/layout/WebsiteInquiryForm'

export function SiteFooter() {
  const { t } = useLanguage()

  const PLATFORM_LINKS = [
    { href: '/about', label: t.footer.about },
    { href: '/how-it-works', label: t.footer.howItWorks },
    { href: '/faq', label: t.footer.faq },
    { href: '/contact', label: t.footer.contact },
  ]

  const CREATOR_LINKS = [
    { href: '/sign-up', label: t.footer.signUp },
    { href: '/merchants', label: t.footer.merchants },
    { href: '/dashboard/creator', label: t.footer.creatorDashboard },
  ]

  const MERCHANT_LINKS = [
    { href: '/how-it-works#merchants', label: t.footer.joinAsMerchant },
    { href: '/creators', label: t.footer.creators },
    { href: '/dashboard/merchant', label: t.footer.merchantDashboard },
    { href: '/contact', label: t.footer.contact },
  ]

  return (
    <footer className="border-t border-white/5 bg-[#08080d] pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="pb-10 mb-10 border-b border-white/5">
          <WebsiteInquiryForm />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="hover:opacity-80 transition-opacity select-none inline-block" aria-label="NipNip">
              <NipNipLogo className="h-6" />
            </Link>
            <p className="text-white/30 text-sm mt-3 leading-relaxed max-w-50">
              {t.footer.tagline}
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">{t.footer.platform}</p>
            <ul className="flex flex-col gap-2.5">
              {PLATFORM_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Creators */}
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">{t.footer.forCreators}</p>
            <ul className="flex flex-col gap-2.5">
              {CREATOR_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Merchants */}
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">{t.footer.forMerchants}</p>
            <ul className="flex flex-col gap-2.5">
              {MERCHANT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="text-white/25 hover:text-white/60 text-sm transition-colors">
              {t.footer.privacy}
            </Link>
            <Link href="/terms" className="text-white/25 hover:text-white/60 text-sm transition-colors">
              {t.footer.terms}
            </Link>
            <Link href="/data-deletion" className="text-white/25 hover:text-white/60 text-sm transition-colors">
              {t.footer.dataDeletion}
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/20 text-sm">
              © {new Date().getFullYear()} NipNip · {t.footer.copyright}
            </p>
            <div className="flex items-center gap-6">
              <a
                href="mailto:nipnipge@gmail.com"
                className="text-white/25 hover:text-white/60 text-sm transition-colors"
              >
                nipnipge@gmail.com
              </a>
              <a
                href="tel:+995555350063"
                className="text-white/25 hover:text-white/60 text-sm transition-colors"
              >
                +995 555 35 00 63
              </a>
              <a
                href="https://tally.ge"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 opacity-30 hover:opacity-70 transition-opacity"
              >
                <span className="text-white/60 text-sm">{t.footer.poweredBy}</span>
                <CImg
                  src="https://www.tally.ge/images/logos/tally-logo-white.png"
                  alt="Tally"
                  className="h-5 w-auto"
                />
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
