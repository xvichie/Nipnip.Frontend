import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import Link from 'next/link'

export const metadata = { title: 'Data Deletion Instructions — NipNip' }

export default function DataDeletionPage() {
  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      <SiteHeader />

      <main className="flex-1 pt-[60px]">
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">Legal</p>
            <h1 className="font-display text-4xl font-black tracking-tight mb-3">Data Deletion Instructions</h1>
            <p className="text-white/30 text-sm mb-12">Last updated: July 2026</p>

            <div className="flex flex-col gap-8 text-white/60 text-sm leading-relaxed">
              <div>
                <h2 className="text-white font-bold text-base mb-2">Disconnecting your Facebook Page</h2>
                <p>
                  If you connected a Facebook Page to NipNip to import product posts, you can remove that
                  connection at any time from your store dashboard under <span className="text-white/80">Products
                  → Import from Facebook</span>. Disconnecting immediately and permanently deletes the stored
                  Page access token from our database — nothing is retained after disconnection, and no further
                  requests are made to Facebook on your behalf.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">Requesting full account deletion</h2>
                <p>
                  To delete your NipNip account and associated data (including any Facebook connection, store, or
                  product data), contact us via our <Link href="/contact" className="text-violet-400 hover:text-violet-300">contact page</Link> with
                  your account email and a request to delete your data. We will confirm and process deletion
                  requests within a reasonable time, except where we&apos;re required to retain certain records
                  (e.g. completed order/transaction history) for legal or accounting purposes.
                </p>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">What gets deleted</h2>
                <ul className="list-disc list-inside flex flex-col gap-1.5">
                  <li>Your account and profile information.</li>
                  <li>Any connected Facebook Page access token (deleted immediately on disconnect, or as part of account deletion).</li>
                  <li>Store and product data you created, where applicable.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-2">More information</h2>
                <p>
                  See our full <Link href="/privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</Link> for
                  details on what data we collect and how it&apos;s used.
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
