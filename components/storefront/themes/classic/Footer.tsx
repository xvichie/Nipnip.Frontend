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
              <Link key={page.id} href={`/store/${slug}/pages/${page.slug}`} className="hover:text-gray-900 transition-colors">
                {page.title}
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-xs">© {new Date().getFullYear()} {storeName}</p>
          <div className="flex items-center gap-4">
            {showSocials && <SocialLinks tokens={tokens} />}
            <Link href={`/store/${slug}/contact`} className="text-gray-400 text-xs hover:text-gray-900 transition-colors underline underline-offset-2">
              {tokens.contactLabel}
            </Link>
            <p className="text-gray-400 text-xs">შექმნილია NipNip-ის მიერ</p>
          </div>
        </div>
      </div>
      {tokens.footerContactForm === 'below' && contactFormSection}
    </footer>
  )
}
