import Link from 'next/link'
import { SocialLinks } from '@/components/storefront/shared/SocialLinks'
import { ContactForm } from '@/components/storefront/shared/ContactForm'
import { getEnabledPaymentLabels } from '@/lib/store/payment-methods'
import { getPageTitle, getThemeText, resolveThemeText } from '@/lib/store/translations'
import type { StorePageResponse, ThemeConfig } from '@/lib/types/storefront'
import type { StorefrontLanguage, StorefrontStrings } from '@/lib/storefront-i18n'
import { CImg } from '@/components/ui/CImg'

export function Footer({
  slug,
  storeName,
  tokens,
  pages,
  t,
  lang,
}: {
  slug: string
  storeName: string
  tokens: Required<ThemeConfig>
  pages: StorePageResponse[]
  t: StorefrontStrings
  lang: StorefrontLanguage
}) {
  const hasContactInfo = tokens.contactEmail || tokens.contactPhone || tokens.contactAddress
  const showSocials = tokens.socialsPosition === 'footer' || tokens.socialsPosition === 'both'
  const paymentLabels = tokens.footerShowPaymentIcons ? getEnabledPaymentLabels(tokens) : []
  const contactLabel = getThemeText(tokens, 'contactLabel', lang)

  const contactFormSection = tokens.footerContactForm !== 'off' && (
    <div className="border-t border-b border-[#e8e8e8]">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-6">
        <ContactForm slug={slug} tokens={tokens} variant="light" radiusClass="" heading={contactLabel} />
      </div>
    </div>
  )

  return (
    <footer className="bg-white border-t border-[#e8e8e8] mt-auto">
      {tokens.footerContactForm === 'above' && contactFormSection}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
        {tokens.footerShowLogo && tokens.logoUrl && (
          <CImg src={tokens.logoUrl} alt={storeName} className="h-6 w-auto object-contain" />
        )}

        {hasContactInfo && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 pb-4 border-b border-[#e8e8e8] text-xs text-[#8a8a8a]">
            {tokens.contactEmail && <a href={`mailto:${tokens.contactEmail}`} className="hover:text-[#0f0f0f] transition-colors">{tokens.contactEmail}</a>}
            {tokens.contactPhone && <a href={`tel:${tokens.contactPhone}`} className="hover:text-[#0f0f0f] transition-colors">{tokens.contactPhone}</a>}
            {tokens.contactAddress && <span>{tokens.contactAddress}</span>}
          </div>
        )}

        {pages.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-[#8a8a8a]">
            {pages.map(page => (
              <Link key={page.id} href={`/pages/${page.slug}`} className="hover:text-[#0f0f0f] transition-colors">
                {getPageTitle(page, lang)}
              </Link>
            ))}
          </div>
        )}

        {tokens.footerLinkColumns.length > 0 && (
          <div className="flex flex-wrap gap-x-10 gap-y-4 pb-4 border-b border-[#e8e8e8]">
            {tokens.footerLinkColumns.map((column, i) => (
              <div key={i} className="flex flex-col gap-1.5 min-w-[100px]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a8a8a]">{resolveThemeText(column.title, column.translations?.en, column.translations?.ru, lang)}</p>
                {column.links.map((link, j) => (
                  <a key={j} href={link.url} className="text-xs text-[#8a8a8a] hover:text-[#0f0f0f] transition-colors">{resolveThemeText(link.label, link.translations?.en, link.translations?.ru, lang)}</a>
                ))}
              </div>
            ))}
          </div>
        )}

        {paymentLabels.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {paymentLabels.map(label => (
              <span key={label} className="border border-[#e8e8e8] px-2.5 py-1 text-[10px] text-[#8a8a8a]">{label}</span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="text-[#8a8a8a] text-xs">{getThemeText(tokens, 'footerCopyrightText', lang) || `© ${new Date().getFullYear()} ${storeName}`}</p>
          <div className="flex items-center gap-4">
            {showSocials && <SocialLinks tokens={tokens} />}
            <Link href={`/contact`} className="text-[#8a8a8a] text-xs hover:text-[#0f0f0f] transition-colors underline underline-offset-2">
              {contactLabel}
            </Link>
            {tokens.showPlatformAttribution && <p className="text-[#8a8a8a] text-xs">{t.footer.poweredBy}</p>}
          </div>
        </div>
      </div>
      {tokens.footerContactForm === 'below' && contactFormSection}
    </footer>
  )
}
