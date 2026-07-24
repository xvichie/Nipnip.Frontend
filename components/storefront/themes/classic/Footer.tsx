import Link from 'next/link'
import { SocialLinks } from '@/components/storefront/shared/SocialLinks'
import { ContactForm } from '@/components/storefront/shared/ContactForm'
import { getEnabledPaymentLabels } from '@/lib/store/payment-methods'
import type { StorePageResponse, ThemeConfig } from '@/lib/types/storefront'
import { CImg } from '@/components/ui/CImg'

export function Footer({
  slug,
  storeName,
  tokens,
  pages,
}: {
  slug: string
  storeName: string
  tokens: Required<ThemeConfig>
  pages: StorePageResponse[]
}) {
  const hasContactInfo = tokens.contactEmail || tokens.contactPhone || tokens.contactAddress
  const showSocials = tokens.socialsPosition === 'footer' || tokens.socialsPosition === 'both'
  const paymentLabels = tokens.footerShowPaymentIcons ? getEnabledPaymentLabels(tokens) : []

  const contactFormSection = tokens.footerContactForm !== 'off' && (
    <div className="border-t border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-8">
        <ContactForm slug={slug} tokens={tokens} variant="light" radiusClass="rounded-md" heading={tokens.contactLabel} />
      </div>
    </div>
  )

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {tokens.footerContactForm === 'above' && contactFormSection}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5">
        {tokens.footerShowLogo && tokens.logoUrl && (
          <CImg src={tokens.logoUrl} alt={storeName} className="h-7 w-auto object-contain" />
        )}

        {hasContactInfo && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-5 border-b border-gray-200 text-xs text-gray-500">
            {tokens.contactEmail && <a href={`mailto:${tokens.contactEmail}`} className="hover:text-gray-900 transition-colors">{tokens.contactEmail}</a>}
            {tokens.contactPhone && <a href={`tel:${tokens.contactPhone}`} className="hover:text-gray-900 transition-colors">{tokens.contactPhone}</a>}
            {tokens.contactAddress && <span>{tokens.contactAddress}</span>}
          </div>
        )}

        {pages.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
            {pages.map(page => (
              <Link key={page.id} href={`/pages/${page.slug}`} className="hover:text-gray-900 transition-colors">
                {page.title}
              </Link>
            ))}
          </div>
        )}

        {tokens.footerLinkColumns.length > 0 && (
          <div className="flex flex-wrap gap-x-10 gap-y-6 pb-5 border-b border-gray-200">
            {tokens.footerLinkColumns.map((column, i) => (
              <div key={i} className="flex flex-col gap-2 min-w-[100px]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{column.title}</p>
                {column.links.map((link, j) => (
                  <a key={j} href={link.url} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">{link.label}</a>
                ))}
              </div>
            ))}
          </div>
        )}

        {paymentLabels.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {paymentLabels.map(label => (
              <span key={label} className="rounded-full border border-gray-200 px-3 py-1 text-[10px] text-gray-500">{label}</span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-xs">{tokens.footerCopyrightText || `© ${new Date().getFullYear()} ${storeName}`}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {showSocials && <SocialLinks tokens={tokens} />}
            <Link href={`/contact`} className="text-gray-400 text-xs hover:text-gray-900 transition-colors underline underline-offset-2">
              {tokens.contactLabel}
            </Link>
            {tokens.showPlatformAttribution && <p className="text-gray-400 text-xs">შექმნილია NipNip-ის მიერ</p>}
          </div>
        </div>
      </div>
      {tokens.footerContactForm === 'below' && contactFormSection}
    </footer>
  )
}
