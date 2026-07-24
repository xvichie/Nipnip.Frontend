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
    <div className="border-t border-b border-[#1c1a17]/10">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
        <ContactForm slug={slug} tokens={tokens} variant="light" heading={tokens.contactLabel} />
      </div>
    </div>
  )

  return (
    <footer className="bg-[#faf7f2] border-t border-[#1c1a17]/10 mt-auto">
      {tokens.footerContactForm === 'above' && contactFormSection}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-6">
        {tokens.footerShowLogo && tokens.logoUrl && (
          <CImg src={tokens.logoUrl} alt={storeName} className="h-7 w-auto object-contain" />
        )}

        {hasContactInfo && (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 pb-6 border-b border-[#1c1a17]/10 text-xs uppercase tracking-widest text-[#9c8f7e]">
            {tokens.contactEmail && <a href={`mailto:${tokens.contactEmail}`} className="hover:text-[#1c1a17] transition-colors">{tokens.contactEmail}</a>}
            {tokens.contactPhone && <a href={`tel:${tokens.contactPhone}`} className="hover:text-[#1c1a17] transition-colors">{tokens.contactPhone}</a>}
            {tokens.contactAddress && <span>{tokens.contactAddress}</span>}
          </div>
        )}

        {pages.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs uppercase tracking-widest text-[#9c8f7e]">
            {pages.map(page => (
              <Link key={page.id} href={`/pages/${page.slug}`} className="hover:text-[#1c1a17] transition-colors">
                {page.title}
              </Link>
            ))}
          </div>
        )}

        {tokens.footerLinkColumns.length > 0 && (
          <div className="flex flex-wrap gap-x-10 gap-y-6 pb-6 border-b border-[#1c1a17]/10">
            {tokens.footerLinkColumns.map((column, i) => (
              <div key={i} className="flex flex-col gap-2 min-w-[100px]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9c8f7e]">{column.title}</p>
                {column.links.map((link, j) => (
                  <a key={j} href={link.url} className="text-xs uppercase tracking-widest text-[#9c8f7e] hover:text-[#1c1a17] transition-colors">{link.label}</a>
                ))}
              </div>
            ))}
          </div>
        )}

        {paymentLabels.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {paymentLabels.map(label => (
              <span key={label} className="border border-[#1c1a17]/10 px-3 py-1 text-[10px] uppercase tracking-widest text-[#9c8f7e]">{label}</span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-[#9c8f7e] text-xs tracking-wide">{tokens.footerCopyrightText || `© ${new Date().getFullYear()} ${storeName}`}</p>
          <div className="flex items-center gap-5">
            {showSocials && <SocialLinks tokens={tokens} />}
            <Link href={`/contact`} className="text-[#9c8f7e] text-xs uppercase tracking-widest hover:text-[#1c1a17] transition-colors underline underline-offset-4">
              {tokens.contactLabel}
            </Link>
            {tokens.showPlatformAttribution && <p className="text-[#9c8f7e] text-xs tracking-wide">შექმნილია NipNip-ის მიერ</p>}
          </div>
        </div>
      </div>
      {tokens.footerContactForm === 'below' && contactFormSection}
    </footer>
  )
}
