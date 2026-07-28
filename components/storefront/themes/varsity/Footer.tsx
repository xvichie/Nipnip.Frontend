import Link from 'next/link'
import { SocialLinks } from '@/components/storefront/shared/SocialLinks'
import { ContactForm } from '@/components/storefront/shared/ContactForm'
import { getEnabledPaymentLabels } from '@/lib/store/payment-methods'
import type { StorePageResponse, ThemeConfig } from '@/lib/types/storefront'
import type { StorefrontStrings } from '@/lib/storefront-i18n'
import { CImg } from '@/components/ui/CImg'

export function Footer({
  slug,
  storeName,
  tokens,
  pages,
  t,
}: {
  slug: string
  storeName: string
  tokens: Required<ThemeConfig>
  pages: StorePageResponse[]
  t: StorefrontStrings
}) {
  const hasContactInfo = tokens.contactEmail || tokens.contactPhone || tokens.contactAddress
  const showSocials = tokens.socialsPosition === 'footer' || tokens.socialsPosition === 'both'
  const paymentLabels = tokens.footerShowPaymentIcons ? getEnabledPaymentLabels(tokens) : []

  const contactFormSection = tokens.footerContactForm !== 'off' && (
    <div className="border-t border-b border-[#e3e7ec]">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <ContactForm slug={slug} tokens={tokens} variant="light" radiusClass="" heading={tokens.contactLabel} />
      </div>
    </div>
  )

  return (
    <footer className="bg-white border-t border-[#e3e7ec] mt-auto">
      {tokens.footerContactForm === 'above' && contactFormSection}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
        {tokens.footerShowLogo && tokens.logoUrl && (
          <CImg src={tokens.logoUrl} alt={storeName} className="h-7 w-auto object-contain" />
        )}

        {hasContactInfo && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-6 border-b border-[#e3e7ec] text-sm text-[#7d8a9a]">
            {tokens.contactEmail && (
              <a href={`mailto:${tokens.contactEmail}`} className="hover:text-[#1d3557] transition-colors">
                {tokens.contactEmail}
              </a>
            )}
            {tokens.contactPhone && (
              <a href={`tel:${tokens.contactPhone}`} className="hover:text-[#1d3557] transition-colors">
                {tokens.contactPhone}
              </a>
            )}
            {tokens.contactAddress && <span>{tokens.contactAddress}</span>}
          </div>
        )}

        {pages.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#7d8a9a]">
            {pages.map(page => (
              <Link key={page.id} href={`/pages/${page.slug}`} className="hover:text-[#1d3557] transition-colors">
                {page.title}
              </Link>
            ))}
          </div>
        )}

        {tokens.footerLinkColumns.length > 0 && (
          <div className="flex flex-wrap gap-x-10 gap-y-6 pb-6 border-b border-[#e3e7ec]">
            {tokens.footerLinkColumns.map((column, i) => (
              <div key={i} className="flex flex-col gap-2 min-w-[100px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7d8a9a]">{column.title}</p>
                {column.links.map((link, j) => (
                  <a key={j} href={link.url} className="text-sm text-[#7d8a9a] hover:text-[#1d3557] transition-colors">{link.label}</a>
                ))}
              </div>
            ))}
          </div>
        )}

        {paymentLabels.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {paymentLabels.map(label => (
              <span key={label} className="bg-[#eef2f6] px-3 py-1 text-[10px] font-medium text-[#7d8a9a]">{label}</span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#7d8a9a] text-sm font-medium">{tokens.footerCopyrightText || `© ${new Date().getFullYear()} ${storeName}`}</p>
          <div className="flex items-center gap-4">
            {showSocials && <SocialLinks tokens={tokens} />}
            <Link href={`/contact`} className="text-[#7d8a9a] text-sm font-medium hover:text-[#1d3557] transition-colors underline underline-offset-2">
              {tokens.contactLabel}
            </Link>
            {tokens.showPlatformAttribution && <p className="text-[#7d8a9a] text-sm font-medium">{t.footer.poweredBy}</p>}
          </div>
        </div>
      </div>
      {tokens.footerContactForm === 'below' && contactFormSection}
    </footer>
  )
}
