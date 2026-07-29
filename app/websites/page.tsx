'use client'

import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { useFeaturedStores } from '@/lib/queries/merchants'
import { getStoreOrigin, getStoreUrl } from '@/lib/store/seo'
import { StoreLogo } from '@/components/FeaturedStoresGrid'

// The admin-curated showcase of real stores built on NipNip (IsFeaturedStore) — separate from
// /merchants, which lists every affiliate-program partner for creators to get tracking links
// from. This page has nothing to do with affiliate discovery: just a link straight to each real
// live storefront.
export default function WebsitesPage() {
  const { data: merchants, isLoading } = useFeaturedStores()
  const items = merchants ?? []

  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">
      <SiteHeader />

      <main className="flex-1 pt-[60px]">

        {/* Hero */}
        <section className="relative py-24 px-6 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative max-w-xl mx-auto">
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">✦ ნამდვილი მაღაზიები</p>
            <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-6">
              მაღაზიები, შექმნილი<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">
                NipNip-ზე.
              </span>
            </h1>
            <p className="text-white/45 text-lg leading-relaxed">
              ნახეთ როგორ გამოიყურება რეალური მაღაზიები ჩვენს პლატფორმაზე — თითოეული ლინკი მიდის
              პირდაპირ ცოცხალ საიტზე.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="pb-24 px-6">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-44 skeleton rounded-2xl" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-white/7 bg-white/2 p-10 text-center text-white/30 text-sm">
                მაღაზიები მალე გამოჩნდება აქ.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map(m => (
                  <a
                    key={m.id}
                    href={m.storeSlug ? getStoreUrl(m.storeSlug, '', m.storeCustomDomain) : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-4 p-6 rounded-2xl border border-white/7 bg-white/2 hover:border-violet-500/30 hover:bg-violet-500/4 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <StoreLogo m={m} />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-base truncate">{m.name}</p>
                        {m.storeSlug && (
                          <p className="text-white/30 text-xs truncate">
                            {getStoreOrigin(m.storeSlug, m.storeCustomDomain).replace(/^https?:\/\//, '')}
                          </p>
                        )}
                      </div>
                    </div>
                    {m.description && (
                      <p className="text-white/35 text-sm leading-relaxed line-clamp-3">{m.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-sm font-semibold text-violet-400">ნახე მაღაზია</span>
                      <span className="text-sm font-semibold text-violet-400">↗</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  )
}
