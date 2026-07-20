import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — NipNip' }

export default function PrivacyPage() {
  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      <SiteHeader />

      <main className="flex-1 pt-[60px]">
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">Legal</p>
            <h1 className="font-display text-4xl font-black tracking-tight mb-3">Privacy Policy</h1>
            <p className="text-white/30 text-sm mb-12">Last updated: July 2026</p>

            <div className="flex flex-col gap-8 text-white/60 text-sm leading-relaxed">
              <div>
                <h2 className="text-white font-bold text-base mb-2">What NipNip is</h2>
                <p>
                  NipNip is an affiliate marketing platform connecting creators, merchants, and their customers in
                  Georgia. Merchants run online stores through NipNip; creators share tracking links and discount
                  codes to earn commissions on sales they drive.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">Information we collect</h2>
                <p className="mb-2">Depending on how you use NipNip, we collect:</p>
                <ul className="list-disc list-inside flex flex-col gap-1.5">
                  <li>Account information (name, email, social handles) you provide when signing up as a creator or that we set up for you as a merchant.</li>
                  <li>Store and product information merchants add to their storefront (names, descriptions, prices, images, videos).</li>
                  <li>Order and customer information (name, contact details, delivery address) submitted at checkout on a merchant&apos;s storefront.</li>
                  <li>Click and conversion data used to attribute sales to the creator who referred them.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">Facebook Page data</h2>
                <p>
                  If a merchant chooses to connect a Facebook Page they manage, we request read-only access
                  (<code className="text-violet-300">pages_show_list</code>, <code className="text-violet-300">pages_read_engagement</code>)
                  to list that Page&apos;s recent posts and let the merchant import a post&apos;s text, photos, and
                  video directly into a new product listing. We do not post to the Page, do not access posts from
                  any other Page or account, and do not use this data for advertising or share it with third parties
                  beyond the infrastructure providers described below. The Page access token is stored encrypted and
                  used only to serve that merchant&apos;s own import requests. A merchant can disconnect their Page
                  at any time from their store dashboard, which immediately deletes the stored token.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">TikTok account data</h2>
                <p>
                  If a merchant chooses to connect their TikTok account, we request basic profile access
                  (<code className="text-violet-300">user.info.basic</code>) to show which account is connected,
                  and content-publishing access (<code className="text-violet-300">video.publish</code>) so the
                  merchant can post their own product photos to TikTok as a photo post directly from their store
                  dashboard. We do not read, import, or otherwise access any of the merchant&apos;s existing TikTok
                  posts, videos, followers, or analytics — the connection is used only to publish new posts the
                  merchant explicitly initiates. Access and refresh tokens are stored encrypted and used solely to
                  serve that merchant&apos;s own publish requests. A merchant can disconnect their TikTok account at
                  any time from their store dashboard, which immediately deletes the stored tokens.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">How we use information</h2>
                <p>
                  We use collected information to operate the marketplace: displaying storefronts, processing
                  orders, attributing and calculating affiliate commissions, and communicating with users about
                  their account or orders. We do not sell personal data.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">Third-party services</h2>
                <p>
                  We use Clerk for authentication, Cloudinary for image and video hosting, and — where a merchant
                  opts in — the Facebook Graph API for the import feature and the TikTok API for the publishing
                  feature described above. Each provider processes data only as needed to provide their respective
                  service to NipNip.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">Data deletion</h2>
                <p>
                  See our <Link href="/data-deletion" className="text-violet-400 hover:text-violet-300">Data Deletion Instructions</Link> page
                  for how to request deletion of your data, including any connected Facebook Page or TikTok account.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">Contact</h2>
                <p>
                  Questions about this policy or your data can be sent via our{' '}
                  <Link href="/contact" className="text-violet-400 hover:text-violet-300">contact page</Link>.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">Terms of Service</h2>
                <p>
                  Use of NipNip is also governed by our{' '}
                  <Link href="/terms" className="text-violet-400 hover:text-violet-300">Terms of Service</Link>.
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
