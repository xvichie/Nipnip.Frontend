'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { NavbarAuth } from '@/components/NavbarAuth'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useLanguage } from '@/lib/i18n'
import { NipNipLogo } from '@/components/NipNipLogo'

// Store-front icon used inside the dropdown
function StoreIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M1 6l1-3h12l1 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 6v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M1 6c0 1.1.9 2 2 2s2-.9 2-2m0 0c0 1.1.9 2 2 2s2-.9 2-2m0 0c0 1.1.9 2 2 2s2-.9 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6 13v-3h4v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CreateStoreDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={[
          'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
          open ? 'text-white bg-white/8' : 'text-white/50 hover:text-white hover:bg-white/5',
        ].join(' ')}
      >
        <StoreIcon className="text-current shrink-0" />
        შექმენი მაღაზია
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden
          className={['transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[310px] bg-[#0f0f18] border border-white/8 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">

          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-white/6">
            <p className="text-white font-semibold text-sm">მაღაზიის პლატფორმა</p>
            <p className="text-white/40 text-xs mt-0.5 leading-relaxed">
              შექმენი ონლაინ მაღაზია და გაყიდე პროდუქტები NipNip-ის ქსელში.
            </p>
          </div>

          {/* Example store card */}
          <div className="p-3">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-2 px-1">
              სადემო მაღაზია
            </p>
            <Link
              href="/example-store"
              target='_blank'
              onClick={() => setOpen(false)}
              className="group flex items-center gap-3 rounded-xl p-3 hover:bg-white/5 transition-colors"
            >
              {/* Store thumbnail */}
              <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] border border-white/8 overflow-hidden shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=80&q=80"
                  alt="NipNip Shoes"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white font-semibold text-sm truncate">NipNip Shoes</p>
                  <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/20 uppercase tracking-wide">
                    მაგალითი
                  </span>
                </div>
                <p className="text-white/40 text-xs truncate">ფეხსაცმლის ონლაინ მაღაზია</p>
              </div>

              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden
                className="text-white/25 group-hover:text-white/60 transition-colors shrink-0">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* Divider + Coming soon */}
          <div className="border-t border-white/6 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs font-medium">მეტი ინდუსტრია მალე</p>
                <p className="text-white/25 text-[10px] mt-0.5">ტანსაცმელი, ელექტრონიკა, საკვები…</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-1 rounded-full border border-white/10 text-white/30 uppercase tracking-wide">
                მალე
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

function HelpDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { t } = useLanguage()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isActive = pathname === '/how-it-works' || pathname === '/faq'

  const ITEMS = [
    {
      href: '/how-it-works',
      label: t.nav.howItWorks,
      sub: 'გაიგე როგორ მუშაობს პლატფორმა',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M6 6c0-1.1.9-2 2-2s2 .9 2 2c0 .8-.5 1.5-1.2 1.8L8 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <circle cx="8" cy="12" r="0.7" fill="currentColor"/>
        </svg>
      ),
    },
    {
      href: '/faq',
      label: t.nav.faq,
      sub: 'ხშირად დასმული კითხვები',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6l-4 3V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={[
          'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
          open || isActive ? 'text-white bg-white/8' : 'text-white/50 hover:text-white hover:bg-white/5',
        ].join(' ')}
      >
        ინფორმაცია
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden
          className={['transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-60 bg-[#0f0f18] border border-white/8 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50 p-1.5">
          {ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={[
                'group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors',
                pathname === item.href ? 'bg-white/8' : 'hover:bg-white/5',
              ].join(' ')}
            >
              <span className={['mt-0.5 shrink-0', pathname === item.href ? 'text-violet-400' : 'text-white/30 group-hover:text-white/60'].join(' ')}>
                {item.icon}
              </span>
              <div>
                <p className={['text-sm font-medium', pathname === item.href ? 'text-white' : 'text-white/70 group-hover:text-white'].join(' ')}>
                  {item.label}
                </p>
                <p className="text-white/35 text-xs mt-0.5">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const NAV_LINKS = [
    { href: '/merchants', label: t.nav.brands },
    { href: '/creators', label: t.nav.creators },
  ]

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/6 bg-[#08080d]/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-15 flex items-center justify-between gap-6">

        <Link href="/" className="shrink-0 hover:opacity-80 transition-opacity select-none" aria-label="NipNip">
          <NipNipLogo className="h-7" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                pathname === href
                  ? 'text-white bg-white/6'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              {label}
            </Link>
          ))}
          <HelpDropdown />
          <CreateStoreDropdown />
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <NavbarAuth />
        </div>

      </div>
    </header>
  )
}
