'use client'

import { useEffect, useRef, useState } from 'react'
import { useStorefrontLanguage } from './StorefrontLanguageProvider'
import type { StorefrontLanguage } from '@/lib/storefront-i18n'

const LANGS: { code: StorefrontLanguage; flag: string; short: string; label: string }[] = [
  { code: 'ka', flag: '🇬🇪', short: 'ქარ', label: 'ქართული' },
  { code: 'en', flag: '🇬🇧', short: 'ENG', label: 'English' },
  { code: 'ru', flag: '🇷🇺', short: 'РУС', label: 'Русский' },
]

// Mirrors components/LanguageSwitcher.tsx's dropdown variant (same proven pattern: explicit
// open state + conditional rendering instead of a CSS-only dropdown, so the closed menu can't
// linger in the DOM and intercept taps meant for whatever sits next to it in a theme's header).
export function StorefrontLanguageSwitcher({ placement = 'bottom-end' }: { placement?: 'bottom-end' | 'top-start' | 'top-end' }) {
  const { lang, setLang } = useStorefrontLanguage()
  const current = LANGS.find(l => l.code === lang) ?? LANGS[0]
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const positionClass = placement === 'bottom-end'
    ? 'top-full right-0 mt-1'
    : placement === 'top-end'
    ? 'bottom-full right-0 mb-1'
    : 'bottom-full left-0 mb-1'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-current text-xs font-semibold cursor-pointer select-none transition-colors"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span>{current.short}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden className={`opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <ul className={`absolute z-50 p-1 rounded-xl border border-black/10 bg-white text-black shadow-xl shadow-black/10 min-w-36 flex flex-col gap-0.5 ${positionClass}`}>
          {LANGS.map(({ code, flag, label }) => (
            <li key={code}>
              <button
                type="button"
                onClick={() => { setLang(code); setOpen(false) }}
                className={[
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                  lang === code ? 'bg-black/8 font-medium' : 'hover:bg-black/5',
                ].join(' ')}
              >
                <span className="text-base leading-none">{flag}</span>
                <span>{label}</span>
                {lang === code && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="ml-auto shrink-0">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
