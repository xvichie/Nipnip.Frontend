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
    <div className="border-t border-b border-[#ffe9d2]">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <ContactForm slug={slug} tokens={tokens} variant="light" radiusClass="rounded-2xl" heading={contactLabel} />
      </div>
    </div>
  )

  return (
    <footer className="bg-white border-t border-[#ffe9d2] mt-auto">
      {tokens.footerContactForm === 'above' && contactFormSection}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
        {tokens.footerShowLogo && tokens.logoUrl && (
          <CImg src={tokens.logoUrl} alt={storeName} className="h-7 w-auto object-contain" />
        )}

        {hasContactInfo && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-6 border-b border-[#ffe9d2] text-sm text-[#9a9a9a]">
            {tokens.contactEmail && (
              <a href={`mailto:${tokens.contactEmail}`} className="rounded-full px-3 py-1 hover:bg-[#eaf7fc] hover:text-[#2b2b2b] transition-colors">
                {tokens.contactEmail}
              </a>
            )}
            {tokens.contactPhone && (
              <a href={`tel:${tokens.contactPhone}`} className="rounded-full px-3 py-1 hover:bg-[#eaf7fc] hover:text-[#2b2b2b] transition-colors">
                {tokens.contactPhone}
              </a>
            )}
            {tokens.contactAddress && <span className="px-3 py-1">{tokens.contactAddress}</span>}
          </div>
        )}

        {pages.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#9a9a9a]">
            {pages.map(page => (
              <Link key={page.id} href={`/pages/${page.slug}`} className="rounded-full px-3 py-1 hover:bg-[#eaf7fc] hover:text-[#2b2b2b] transition-colors">
                {getPageTitle(page, lang)}
              </Link>
            ))}
          </div>
        )}

        {tokens.footerLinkColumns.length > 0 && (
          <div className="flex flex-wrap gap-x-10 gap-y-6 pb-6 border-b border-[#ffe9d2]">
            {tokens.footerLinkColumns.map((column, i) => (
              <div key={i} className="flex flex-col gap-2 min-w-[100px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9a9a9a]">{resolveThemeText(column.title, column.translations?.en, column.translations?.ru, lang)}</p>
                {column.links.map((link, j) => (
                  <a key={j} href={link.url} className="text-sm text-[#9a9a9a] hover:text-[#2b2b2b] transition-colors">{resolveThemeText(link.label, link.translations?.en, link.translations?.ru, lang)}</a>
                ))}
              </div>
            ))}
          </div>
        )}

        {paymentLabels.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {paymentLabels.map(label => (
              <span key={label} className="rounded-full bg-[#eaf7fc] px-3 py-1 text-[10px] font-medium text-[#5a5a5a]">{label}</span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#9a9a9a] text-sm font-medium">{getThemeText(tokens, 'footerCopyrightText', lang) || `© ${new Date().getFullYear()} ${storeName}`}</p>
          <div className="flex items-center gap-4">
            {showSocials && <SocialLinks tokens={tokens} />}
            <Link href={`/contact`} className="text-[#9a9a9a] text-sm font-medium hover:text-[#2b2b2b] transition-colors underline underline-offset-2">
              {contactLabel}
            </Link>
            {tokens.showPlatformAttribution && <p className="text-[#9a9a9a] text-sm font-medium">{t.footer.poweredBy}</p>}
          </div>
        </div>
      </div>
      {tokens.footerContactForm === 'below' && contactFormSection}
    </footer>
  )
}
