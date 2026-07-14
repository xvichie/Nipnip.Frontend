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
    <div className="border-t border-b border-[#f0e4da]">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <ContactForm slug={slug} tokens={tokens} variant="light" radiusClass="rounded-2xl" heading={tokens.contactLabel} />
      </div>
    </div>
  )

  return (
    <footer className="bg-white border-t border-[#f0e4da] mt-auto">
      {tokens.footerContactForm === 'above' && contactFormSection}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
        {hasContactInfo && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-6 border-b border-[#f0e4da] text-sm text-[#a89a90]">
            {tokens.contactEmail && (
              <a href={`mailto:${tokens.contactEmail}`} className="rounded-full px-3 py-1 hover:bg-[#fff2ec] hover:text-[#1a1a1a] transition-colors">
                {tokens.contactEmail}
              </a>
            )}
            {tokens.contactPhone && (
              <a href={`tel:${tokens.contactPhone}`} className="rounded-full px-3 py-1 hover:bg-[#fff2ec] hover:text-[#1a1a1a] transition-colors">
                {tokens.contactPhone}
              </a>
            )}
            {tokens.contactAddress && <span className="px-3 py-1">{tokens.contactAddress}</span>}
          </div>
        )}

        {pages.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#a89a90]">
            {pages.map(page => (
              <Link key={page.id} href={`/store/${slug}/pages/${page.slug}`} className="rounded-full px-3 py-1 hover:bg-[#fff2ec] hover:text-[#1a1a1a] transition-colors">
                {page.title}
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#a89a90] text-sm font-medium">© {new Date().getFullYear()} {storeName}</p>
          <div className="flex items-center gap-4">
            {showSocials && <SocialLinks tokens={tokens} />}
            <Link href={`/store/${slug}/contact`} className="text-[#a89a90] text-sm font-medium hover:text-[#1a1a1a] transition-colors underline underline-offset-2">
              {tokens.contactLabel}
            </Link>
            <p className="text-[#a89a90] text-sm font-medium">შექმნილია NipNip-ის მიერ</p>
          </div>
        </div>
      </div>
      {tokens.footerContactForm === 'below' && contactFormSection}
    </footer>
  )
}
