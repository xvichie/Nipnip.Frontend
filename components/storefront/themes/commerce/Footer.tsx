import Link from 'next/link'
import { SocialLinks } from '@/components/storefront/shared/SocialLinks'
import { ContactForm } from '@/components/storefront/shared/ContactForm'
import type { StorePageResponse, ThemeConfig } from '@/lib/types/storefront'

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

  const contactFormSection = tokens.footerContactForm !== 'off' && (
    <div className="border-t border-b border-slate-200">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-6">
        <ContactForm slug={slug} tokens={tokens} variant="light" radiusClass="rounded-md" heading={tokens.contactLabel} />
      </div>
    </div>
  )

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      {tokens.footerContactForm === 'above' && contactFormSection}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
        {hasContactInfo && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 pb-4 border-b border-slate-200 text-xs text-slate-500">
            {tokens.contactEmail && <a href={`mailto:${tokens.contactEmail}`} className="hover:text-slate-900 transition-colors">{tokens.contactEmail}</a>}
            {tokens.contactPhone && <a href={`tel:${tokens.contactPhone}`} className="hover:text-slate-900 transition-colors">{tokens.contactPhone}</a>}
            {tokens.contactAddress && <span>{tokens.contactAddress}</span>}
          </div>
        )}

        {pages.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-500">
            {pages.map(page => (
              <Link key={page.id} href={`/pages/${page.slug}`} className="hover:text-slate-900 transition-colors">
                {page.title}
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="text-slate-400 text-xs">© {new Date().getFullYear()} {storeName}</p>
          <div className="flex items-center gap-4">
            {showSocials && <SocialLinks tokens={tokens} />}
            <Link href={`/contact`} className="text-slate-400 text-xs hover:text-slate-900 transition-colors underline underline-offset-2">
              {tokens.contactLabel}
            </Link>
            <p className="text-slate-400 text-xs">შექმნილია NipNip-ის მიერ</p>
          </div>
        </div>
      </div>
      {tokens.footerContactForm === 'below' && contactFormSection}
    </footer>
  )
}
