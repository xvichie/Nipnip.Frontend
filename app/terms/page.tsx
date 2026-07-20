import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import Link from 'next/link'

export const metadata = { title: 'Terms of Service — NipNip' }

export default function TermsPage() {
  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      <SiteHeader />

      <main className="flex-1 pt-[60px]">
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">Legal</p>
            <h1 className="font-display text-4xl font-black tracking-tight mb-3">Terms of Service</h1>
            <p className="text-white/30 text-sm mb-12">Last updated: July 2026</p>

            <div className="flex flex-col gap-8 text-white/60 text-sm leading-relaxed">
              <div>
                <h2 className="text-white font-bold text-base mb-2">1. What NipNip is</h2>
                <p>
                  NipNip is an affiliate marketing platform connecting creators, merchants, and their customers in
                  Georgia. Merchants run online stores through NipNip; creators share tracking links and discount
                  codes to earn commissions on sales they drive. By creating an account or using a NipNip storefront,
                  you agree to these Terms.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">2. Accounts</h2>
                <p>
                  Creators sign up directly and are responsible for the accuracy of the information on their profile
                  and for the content they share when promoting merchants. Merchant accounts are created by NipNip
                  after direct agreement with the merchant. You&apos;re responsible for keeping your account
                  credentials secure and for all activity under your account.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">3. Creator responsibilities</h2>
                <p>
                  Creators must accurately represent the merchants and products they promote, and must not use
                  misleading, spammy, or deceptive means to generate clicks, discount code usage, or conversions.
                  Commissions are calculated based on conversions attributed through NipNip&apos;s tracking links and
                  discount codes, and are only payable once the underlying order is confirmed by the merchant.
                  NipNip may withhold or reverse commissions found to result from fraudulent or abusive activity.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">4. Merchant responsibilities</h2>
                <p>
                  Merchants are responsible for the accuracy of their store, product listings, pricing, and order
                  fulfillment, and for reporting sales in good faith when using manual sale reporting. Merchants
                  connecting third-party accounts (Facebook, TikTok, QuickShipper, payment providers) are
                  responsible for having the rights to connect those accounts and for the content published or
                  actions taken through those connections.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">5. Payments and commissions</h2>
                <p>
                  NipNip facilitates commission tracking and payout calculations between merchants and creators, and
                  may charge a platform fee on conversions as agreed with each party. Payment processing for
                  storefront orders is handled either manually by the merchant or through a connected payment
                  provider; NipNip is not a party to the underlying sale between merchant and customer.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">6. Third-party integrations</h2>
                <p>
                  NipNip lets merchants optionally connect third-party services (including Facebook, Instagram,
                  TikTok, QuickShipper, and payment providers) to import or publish content and fulfill orders. Use
                  of each connected service is also subject to that provider&apos;s own terms. See our{' '}
                  <Link href="/privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</Link> for
                  details on what data each integration accesses.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">7. Prohibited use</h2>
                <p>
                  You may not use NipNip to sell illegal goods or services, infringe on intellectual property,
                  commit fraud, or attempt to circumvent commission attribution. NipNip may suspend or terminate
                  accounts that violate these Terms.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">8. Disclaimer and liability</h2>
                <p>
                  NipNip is provided &quot;as is&quot; without warranties of any kind. NipNip is not liable for
                  disputes between merchants and customers, indirect or consequential damages, or losses arising
                  from third-party service outages beyond our control.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">9. Changes to these Terms</h2>
                <p>
                  We may update these Terms from time to time. Continued use of NipNip after changes take effect
                  means you accept the updated Terms.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">10. Contact</h2>
                <p>
                  Questions about these Terms can be sent via our{' '}
                  <Link href="/contact" className="text-violet-400 hover:text-violet-300">contact page</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
