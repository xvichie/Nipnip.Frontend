'use client'

import type { CSSProperties } from 'react'
import { SignUpButton } from '@clerk/nextjs'
import Link from 'next/link'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { FeaturedMerchantsCarousel } from '@/components/FeaturedMerchantsCarousel'
import { useLanguage } from '@/lib/i18n'
import { CImg } from '@/components/ui/CImg'

const STORE_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M2.5 7.5 3.4 3a1.2 1.2 0 0 1 1.18-1h10.85a1.2 1.2 0 0 1 1.17 1l.9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.5 7.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.75 8v7.75h12.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 15.75v-5h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const INVENTORY_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M2 5.75 10 2l8 3.75L10 9.5 2 5.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M2 5.75v8L10 17.5m0-8v8m0-8 8-3.75m0 0v8L10 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)
const INTEGRATIONS_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="6" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="14" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="14" cy="14.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8.6 8.8 11.7 6.6M8.6 11.2l3.1 2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const AI_AGENT_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h11A2.5 2.5 0 0 1 18 4.5v7A2.5 2.5 0 0 1 15.5 14H10l-4.5 3.5V14h-1A2.5 2.5 0 0 1 2 11.5v-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M6.8 7.7c.6-1.2 1.6-1.9 3.1-1.9s2.5 1 2.5 2.1c0 1.6-2.2 1.6-2.5 3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="13.4" r="1" fill="currentColor"/>
  </svg>
)
const AFFILIATE_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M8 12.2a4.4 4.4 0 0 0 6.2 0l2.5-2.5a4.4 4.4 0 0 0-6.2-6.2l-1.25 1.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7.8a4.4 4.4 0 0 0-6.2 0l-2.5 2.5a4.4 4.4 0 0 0 6.2 6.2l1.25-1.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Decorative twinkling dots scattered around the hero's floating cards — positions are
// hand-picked to sit in the empty space between cards, not on top of their content.
const SPARKLES = [
  { top: '2%', left: '56%', size: 6, color: 'bg-fuchsia-400', duration: '3s', delay: '0s' },
  { top: '18%', left: '94%', size: 4, color: 'bg-violet-300', duration: '2.4s', delay: '0.6s' },
  { top: '44%', left: '44%', size: 5, color: 'bg-white', duration: '3.4s', delay: '1.1s' },
  { top: '60%', left: '90%', size: 4, color: 'bg-fuchsia-300', duration: '2.8s', delay: '1.6s' },
  { top: '78%', left: '28%', size: 6, color: 'bg-violet-400', duration: '3.2s', delay: '0.3s' },
  { top: '92%', left: '66%', size: 4, color: 'bg-white', duration: '2.6s', delay: '2s' },
]

export default function LandingPage() {
  const { t } = useLanguage()

  const STEPS = [
    { n: '01', icon: '✦', title: t.landing.step1Title, body: t.landing.step1Body },
    { n: '02', icon: '⬡', title: t.landing.step2Title, body: t.landing.step2Body },
    { n: '03', icon: '◈', title: t.landing.step3Title, body: t.landing.step3Body },
  ]

  const MERCHANT_FEATURES = [
    { icon: STORE_ICON, title: t.landing.merchantFeature1Title, body: t.landing.merchantFeature1Body, accent: false },
    { icon: INVENTORY_ICON, title: t.landing.merchantFeature2Title, body: t.landing.merchantFeature2Body, accent: false },
    { icon: INTEGRATIONS_ICON, title: t.landing.merchantFeature3Title, body: t.landing.merchantFeature3Body, accent: false },
    { icon: AI_AGENT_ICON, title: t.landing.merchantFeature4Title, body: t.landing.merchantFeature4Body, accent: true },
    { icon: AFFILIATE_ICON, title: t.landing.merchantFeature5Title, body: t.landing.merchantFeature5Body, accent: false },
  ]

  return (
    <div className="bg-[#08080d] text-white min-h-screen flex flex-col selection:bg-violet-500/30">

      <SiteHeader />

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen px-6 pt-32 pb-20 lg:pt-15 lg:pb-0 overflow-hidden flex items-center">

        <div
          className="dot-grid absolute inset-0 pointer-events-none"
          style={{ maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)' }}
        />

        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 translate-y-[-55%] w-175 h-125 rounded-full pointer-events-none bg-violet-600/20 blur-[130px]" />
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 translate-y-[-55%] w-75 h-62.5 rounded-full pointer-events-none bg-fuchsia-500/15 blur-[80px]" />
        <div className="absolute top-1/3 right-0 w-100 h-100 rounded-full pointer-events-none bg-violet-500/10 blur-[110px]" />

        <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">

          {/* Left: copy */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-7 animate-fade-up">

            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/4 rounded-full px-4 py-1.5 text-xs font-medium text-white/60 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              {t.landing.badge}
            </div>

            <h1 className="font-display text-[clamp(2.6rem,6vw,4.75rem)] font-black tracking-[-0.02em] leading-[1.02]">
              <span className="block text-white">{t.landing.headline1}</span>
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-violet-400 via-fuchsia-400 to-rose-400 animate-gradient-shift">
                {t.landing.headline2}
              </span>
            </h1>

            <p className="text-white/45 text-base lg:text-lg max-w-lg leading-relaxed font-light">
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

          {/* Right: floating product/AI/affiliate mockup cards */}
          <div className="relative h-125 hidden lg:block">

            <div className="absolute top-8 right-10 w-56 h-56 rounded-full pointer-events-none bg-fuchsia-500/10 blur-[70px]" />
            <div className="absolute bottom-4 left-4 w-48 h-48 rounded-full pointer-events-none bg-violet-500/10 blur-[60px]" />

            {SPARKLES.map((s, i) => (
              <span
                key={i}
                className={`absolute rounded-full ${s.color} animate-twinkle pointer-events-none`}
                style={{
                  top: s.top, left: s.left, width: s.size, height: s.size,
                  '--twinkle-duration': s.duration, '--twinkle-delay': s.delay,
                } as CSSProperties}
              />
            ))}

            {/* Store preview card */}
            <div
              className="absolute top-2 left-2 w-52 rounded-2xl border border-white/10 bg-[#12121a]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-float-card"
              style={{ '--float-duration': '7s', '--float-delay': '0s', '--float-rotate': '-3deg' } as CSSProperties}
            >
              <div className="h-28 relative overflow-hidden">
                <CImg
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=200&q=80"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#12121a] via-[#12121a]/5 to-transparent" />
                <div className="absolute top-0 left-0 h-full w-1/3 bg-linear-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
                <div className="absolute top-2.5 left-2.5 flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/50" />
                  <span className="w-2 h-2 rounded-full bg-white/50" />
                  <span className="w-2 h-2 rounded-full bg-white/50" />
                </div>
              </div>
              <div className="p-3.5 flex flex-col gap-2">
                <div className="h-2.5 w-2/3 rounded-full bg-white/15" />
                <div className="h-2 w-1/2 rounded-full bg-white/8" />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-white font-bold text-sm">149 ₾</span>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {t.landing.heroAddToCart}
                  </span>
                </div>
              </div>
            </div>

            {/* Floating accent badge, orbiting between the store + AI cards */}
            <div
              className="absolute top-4 right-40 w-11 h-11 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 border border-white/20 shadow-xl shadow-violet-900/40 flex items-center justify-center animate-badge-orbit"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M9.5 1.5 3 10h5l-1 6.5L15 8h-5l1.5-6.5Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>

            {/* AI messaging agent card */}
            <div
              className="absolute top-40 right-0 w-64 rounded-2xl border border-fuchsia-500/20 bg-[#14141f]/95 backdrop-blur-xl shadow-2xl shadow-fuchsia-950/30 overflow-hidden animate-float-card"
              style={{ '--float-duration': '8s', '--float-delay': '1.2s', '--float-rotate': '2deg' } as CSSProperties}
            >
              <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-white/8">
                <span className="w-6 h-6 rounded-full bg-linear-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  AI
                </span>
                <span className="text-xs font-semibold text-white/80 truncate">{t.sidebar.messagingAgent}</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </div>
              <div className="p-3.5 flex flex-col gap-2">
                <div className="self-start max-w-[85%] rounded-xl rounded-bl-sm bg-white/8 px-3 py-1.5 text-[11px] text-white/70">
                  {t.landing.heroChatQuestion}
                </div>
                <div className="self-end max-w-[85%] rounded-xl rounded-br-sm bg-linear-to-br from-fuchsia-500/25 to-violet-500/25 border border-fuchsia-500/20 px-3 py-1.5 text-[11px] text-white">
                  {t.landing.heroChatAnswer}
                </div>
              </div>
            </div>

            {/* Affiliate commission card */}
            <div
              className="absolute bottom-2 left-10 w-52 rounded-2xl border border-white/10 bg-[#12121a]/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-3.5 animate-float-card"
              style={{ '--float-duration': '6.5s', '--float-delay': '2.4s', '--float-rotate': '-2deg' } as CSSProperties}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex -space-x-2 shrink-0">
                  <span className="w-6 h-6 rounded-full bg-violet-500/50 border-2 border-[#12121a]" />
                  <span className="w-6 h-6 rounded-full bg-fuchsia-500/50 border-2 border-[#12121a]" />
                  <span className="w-6 h-6 rounded-full bg-rose-500/50 border-2 border-[#12121a]" />
                </div>
                <span className="text-[10px] text-white/40 font-medium truncate">{t.landing.heroCreatorsSelling}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-lg font-black text-white">+340 ₾</span>
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M2 7l3-3 2 2 2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t.landing.heroCommissionLabel}
                </span>
              </div>
            </div>

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
            <Link
              href="/merchants"
              className="text-white/40 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
            >
              {t.landing.viewAll}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
        <FeaturedMerchantsCarousel />
      </section>

      {/* ── For Merchants ──────────────────────────────────────────── */}
      <section className="relative py-32 px-6 bg-[#0c0c12] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
              {t.landing.merchantsBadge}
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {t.landing.merchantsTitle}<br />
              <span className="text-white/30">{t.landing.merchantsAccent}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {MERCHANT_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={[
                  'group relative p-6 lg:p-8 rounded-2xl border transition-all duration-300',
                  feature.accent
                    ? 'border-fuchsia-500/25 bg-linear-to-br from-fuchsia-500/8 via-violet-500/5 to-transparent hover:border-fuchsia-500/40'
                    : 'border-white/7 bg-white/2 hover:bg-white/4 hover:border-violet-500/25',
                ].join(' ')}
              >
                <div
                  className={[
                    'w-11 h-11 rounded-xl flex items-center justify-center mb-6 border',
                    feature.accent
                      ? 'bg-linear-to-br from-fuchsia-500/20 to-violet-500/20 border-fuchsia-500/30 text-fuchsia-300'
                      : 'bg-violet-500/10 border-violet-500/20 text-violet-300',
                  ].join(' ')}
                >
                  {feature.icon}
                </div>
                <h3 className="font-display text-white font-bold text-xl mb-2 flex items-center gap-2">
                  {feature.title}
                  {feature.accent && (
                    <span className="inline-flex items-center rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                      AI
                    </span>
                  )}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.body}</p>
                <div className="absolute bottom-0 left-8 right-8 h-px bg-linear-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section id="how-it-works" className="relative py-32 px-6 bg-[#08080d] border-t border-white/5">
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

      {/* ── Pricing preview ────────────────────────────────────────── */}
      <section className="relative py-32 px-6 bg-[#0c0c12] border-t border-white/5 overflow-hidden">
        <div className="absolute top-10 right-0 w-100 h-100 rounded-full pointer-events-none bg-violet-600/10 blur-[130px]" />
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full pointer-events-none bg-fuchsia-500/10 blur-[110px]" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
                {t.landing.pricingBadge}
              </p>
              <h2 className="font-display text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {t.landing.pricingTitle}<br />
                <span className="text-white/30">{t.landing.pricingAccent}</span>
              </h2>
            </div>
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors shrink-0"
            >
              {t.landing.pricingViewAll}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="transition-transform group-hover:translate-x-1">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
            {/* Starter */}
            <div className="group relative flex flex-col p-7 lg:p-8 rounded-2xl border border-white/7 bg-white/2 hover:bg-white/4 hover:border-violet-500/25 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-7">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-violet-500/10 border border-violet-500/20 text-violet-300 shrink-0">
                  {STORE_ICON}
                </div>
                <h3 className="font-display text-white font-bold text-lg">Starter</h3>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-emerald-400">
                  1 ₾
                </span>
                <span className="text-white/40 text-sm">/{t.landing.pricingPerMonth}</span>
              </div>
              <p className="text-emerald-400 text-xs font-semibold mt-2">{t.landing.pricingTrial}</p>

              <div className="h-px bg-white/7 my-5" />

              <p className="text-white/45 text-sm leading-relaxed mt-auto">
                {t.landing.pricingThen}{' '}
                <span className="text-white/30 line-through">69.99 ₾</span>{' '}
                <span className="text-white font-semibold">49.99 ₾</span>
                /{t.landing.pricingPerMonth}
              </p>
            </div>

            {/* Growth — highlighted */}
            <div className="group relative flex flex-col p-7 lg:p-8 rounded-2xl border border-fuchsia-500/25 bg-linear-to-br from-fuchsia-500/8 via-violet-500/5 to-transparent hover:border-fuchsia-500/40 hover:-translate-y-1 transition-all duration-300">
              <span className="absolute -top-3 left-7 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-linear-to-r from-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-900/30">
                {t.landing.pricingPopular}
              </span>

              <div className="flex items-center gap-2.5 mb-7 mt-1">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-linear-to-br from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/30 text-fuchsia-300 shrink-0">
                  {AI_AGENT_ICON}
                </div>
                <h3 className="font-display text-white font-bold text-lg">Growth</h3>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-emerald-400">
                  1 ₾
                </span>
                <span className="text-white/40 text-sm">/{t.landing.pricingPerMonth}</span>
              </div>
              <p className="text-emerald-400 text-xs font-semibold mt-2">{t.landing.pricingTrial}</p>

              <div className="h-px bg-white/7 my-5" />

              <p className="text-white/45 text-sm leading-relaxed mt-auto">
                {t.landing.pricingThen}{' '}
                <span className="text-white/30 line-through">119.99 ₾</span>{' '}
                <span className="text-white font-semibold">89.99 ₾</span>
                /{t.landing.pricingPerMonth}
              </p>
            </div>

            {/* Affiliate commission */}
            <div className="group relative flex flex-col p-7 lg:p-8 rounded-2xl border border-white/7 bg-white/2 hover:bg-white/4 hover:border-violet-500/25 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-7">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-violet-500/10 border border-violet-500/20 text-violet-300 shrink-0">
                  {AFFILIATE_ICON}
                </div>
                <h3 className="font-display text-white font-bold text-lg">{t.landing.pricingAffiliateTitle}</h3>
              </div>

              <div className="flex items-center gap-5 mt-auto">
                <div>
                  <p className="font-display text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">2%</p>
                  <p className="text-white/40 text-xs mt-1">{t.landing.pricingAffiliateMerchant}</p>
                </div>
                <div className="w-px h-10 bg-white/8" />
                <div>
                  <p className="font-display text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">1%</p>
                  <p className="text-white/40 text-xs mt-1">{t.landing.pricingAffiliateCreator}</p>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/pricing"
            className="sm:hidden mt-8 flex text-white/40 hover:text-white text-sm font-medium transition-colors items-center justify-center gap-1"
          >
            {t.landing.pricingViewAll}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
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
