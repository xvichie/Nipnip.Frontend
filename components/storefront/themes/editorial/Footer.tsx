import Link from 'next/link'
import { SocialLinks } from '@/components/storefront/shared/SocialLinks'
import { ContactForm } from '@/components/storefront/shared/ContactForm'
import { getEnabledPaymentLabels } from '@/lib/store/payment-methods'
import type { StorePageResponse, ThemeConfig } from '@/lib/types/storefront'
import type { StorefrontStrings } from '@/lib/storefront-i18n'
import { CImg } from '@/components/ui/CImg'

function Divider() {
  return <span className="w-px h-3 bg-black/15" aria-hidden />
}

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
  const footerLinks = tokens.footerLinkColumns.flatMap(column => column.links)

  const contactFormSection = tokens.footerContactForm !== 'off' && (
    <div className="border-t border-b border-black/10">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <ContactForm slug={slug} tokens={tokens} variant="light" radiusClass="" heading={tokens.contactLabel} />
      </div>
    </div>
  )

  return (
    <footer className="bg-white border-t border-black/10 mt-auto">
      {tokens.footerContactForm === 'above' && contactFormSection}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 flex flex-col items-center gap-6 text-center">
        {tokens.footerShowLogo && tokens.logoUrl ? (
          <CImg src={tokens.logoUrl} alt={storeName} className="h-8 w-auto object-contain" />
        ) : (
          <span className="font-serif text-xl font-bold tracking-tight text-[#111111]">{storeName}</span>
        )}

        {hasContactInfo && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs uppercase tracking-widest text-[#767676]">
            {tokens.contactEmail && <a href={`mailto:${tokens.contactEmail}`} className="hover:text-[#111111] transition-colors">{tokens.contactEmail}</a>}
            {tokens.contactEmail && (tokens.contactPhone || tokens.contactAddress) && <Divider />}
            {tokens.contactPhone && <a href={`tel:${tokens.contactPhone}`} className="hover:text-[#111111] transition-colors">{tokens.contactPhone}</a>}
            {tokens.contactPhone && tokens.contactAddress && <Divider />}
            {tokens.contactAddress && <span>{tokens.contactAddress}</span>}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs uppercase tracking-widest text-[#767676]">
          <Link href={`/products`} className="hover:text-[#111111] transition-colors">
            {t.header.allProducts}
          </Link>
          {pages.map(page => (
            <span key={page.id} className="flex items-center gap-4">
              <Divider />
              <Link href={`/pages/${page.slug}`} className="hover:text-[#111111] transition-colors">
                {page.title}
              </Link>
            </span>
          ))}
          {footerLinks.map((link, i) => (
            <span key={i} className="flex items-center gap-4">
              <Divider />
              <a href={link.url} className="hover:text-[#111111] transition-colors">{link.label}</a>
            </span>
          ))}
          <span className="flex items-center gap-4">
            <Divider />
            <Link href={`/contact`} className="hover:text-[#111111] transition-colors">
              {tokens.contactLabel}
            </Link>
          </span>
        </div>

        {showSocials && <SocialLinks tokens={tokens} />}

        {paymentLabels.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {paymentLabels.map(label => (
              <span key={label} className="border border-black/10 px-3 py-1 text-[10px] uppercase tracking-widest text-[#767676]">{label}</span>
            ))}
          </div>
        )}

        <div className="pt-6 border-t border-black/10 w-full flex flex-col items-center gap-1">
          <p className="text-[#767676] text-[11px]">{tokens.footerCopyrightText || `© ${new Date().getFullYear()} ${storeName}`}</p>
          {tokens.showPlatformAttribution && <p className="text-[#767676] text-[11px]">{t.footer.poweredBy}</p>}
        </div>
      </div>

      {tokens.footerContactForm === 'below' && contactFormSection}
    </footer>
  )
}
