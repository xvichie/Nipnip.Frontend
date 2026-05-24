'use client'

import { SignUpButton } from '@clerk/nextjs'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { FeaturedMerchantsCarousel } from '@/components/FeaturedMerchantsCarousel'
import { useLanguage } from '@/lib/i18n'

export default function LandingPage() {
  const { t } = useLanguage()

  const STEPS = [
    { n: '01', icon: '✦', title: t.landing.step1Title, body: t.landing.step1Body },
    { n: '02', icon: '⬡', title: t.landing.step2Title, body: t.landing.step2Body },
    { n: '03', icon: '◈', title: t.landing.step3Title, body: t.landing.step3Body },
  ]

  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">

      <SiteHeader />

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-15 text-center overflow-hidden">

        <div
          className="dot-grid absolute inset-0 pointer-events-none"
          style={{ maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)' }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[-55%] w-175 h-125 rounded-full pointer-events-none bg-violet-600/20 blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[-55%] w-75 h-62.5 rounded-full pointer-events-none bg-fuchsia-500/15 blur-[80px]" />

        <div className="relative z-10 flex flex-col items-center gap-7 max-w-4xl animate-fade-up">

          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/4 rounded-full px-4 py-1.5 text-xs font-medium text-white/60 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            {t.landing.badge}
          </div>

          <h1 className="font-display text-[clamp(2.8rem,8vw,6rem)] font-black tracking-[-0.02em] leading-[1.02]">
            <span className="block text-white">{t.landing.headline1}</span>
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-violet-400 via-fuchsia-400 to-rose-400 animate-gradient-shift">
              {t.landing.headline2}
            </span>
          </h1>

          <p className="text-white/45 text-lg lg:text-xl max-w-xl leading-relaxed font-light">
            {t.landing.tagline}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
            <SignUpButton>
              <button className="inline-flex items-center gap-2 bg-white text-black font-semibold text-base px-7 py-3 rounded-xl hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-lg shadow-black/30">
                {t.landing.ctaSignUp}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </SignUpButton>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors px-4 py-3"
            >
              {t.landing.ctaHowItWorks}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-[#08080d] to-transparent pointer-events-none" />
      </section>

      {/* ── Featured Brands ────────────────────────────────────────── */}
      <section className="py-20 px-0 bg-[#08080d] border-t border-white/5">
        <div className="max-w-6xl mx-auto mb-8 px-6">
          <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-3">
            {t.landing.featuredBrandsLabel}
          </p>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl lg:text-3xl font-black tracking-tight">
              {t.landing.partnerShops}
            </h2>
            <a
              href="/merchants"
              className="text-white/40 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
            >
              {t.landing.viewAll}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
        <FeaturedMerchantsCarousel />
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section id="how-it-works" className="relative py-32 px-6 bg-[#0c0c12] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
              {t.landing.howItWorksBadge}
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {t.landing.howItWorksTitle}<br />
              <span className="text-white/30">{t.landing.howItWorksAccent}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="group relative p-6 lg:p-8 rounded-2xl border border-white/7 bg-white/2 hover:bg-white/4 hover:border-violet-500/25 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="text-2xl leading-none text-white/80">{step.icon}</span>
                  <span className="font-black text-6xl leading-none text-white/5 font-mono tabular-nums select-none group-hover:text-white/8 transition-colors">
                    {step.n}
                  </span>
                </div>
                <h3 className="font-display text-white font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.body}</p>
                <div className="absolute bottom-0 left-8 right-8 h-px bg-linear-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 bg-[#08080d] border-t border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 bg-violet-700/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="font-display text-4xl lg:text-5xl font-black tracking-tight leading-tight whitespace-pre-line">
            {t.landing.ctaTitle}
          </h2>
          <p className="text-white/40 text-lg max-w-md leading-relaxed">
            {t.landing.ctaBody}
          </p>
          <SignUpButton>
            <button className="inline-flex items-center gap-2 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-base px-8 py-3.5 rounded-xl active:scale-[0.98] transition-all shadow-xl shadow-violet-900/30">
              {t.landing.ctaFree}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </SignUpButton>
        </div>
      </section>

      <SiteFooter />

    </div>
  )
}
