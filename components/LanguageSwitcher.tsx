'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage, type Language } from '@/lib/i18n'

const LANGS: { code: Language; flag: string; short: string; label: string }[] = [
  { code: 'ka', flag: '🇬🇪', short: 'ქარ', label: 'ქართული' },
  { code: 'en', flag: '🇬🇧', short: 'ENG', label: 'English' },
  { code: 'ru', flag: '🇷🇺', short: 'РУС', label: 'Русский' },
]

// A dropdown works fine on desktop, but inside a scrollable mobile menu panel an
// absolutely-positioned popover is one more thing that can end up mispositioned
// relative to the scroll offset. Three always-visible, always-in-flow buttons sidestep
// that entirely — no positioning math, nothing that can render "somewhere else."
export function LanguageButtonGroup() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 p-1">
      {LANGS.map(({ code, flag, short }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={[
            'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-colors',
            lang === code
              ? 'bg-violet-500/15 text-violet-300'
              : 'text-white/60 hover:text-white hover:bg-white/6',
          ].join(' ')}
        >
          <span className="text-sm leading-none">{flag}</span>
          <span>{short}</span>
        </button>
      ))}
    </div>
  )
}

export function LanguageSwitcher({ placement = 'bottom-end' }: { placement?: 'bottom-end' | 'top-start' | 'top-end' }) {
  const { lang, setLang } = useLanguage()
  const current = LANGS.find(l => l.code === lang) ?? LANGS[0]
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Explicit open state + conditional rendering instead of DaisyUI's CSS-only
  // (:focus-within) dropdown — that variant only hides the panel visually
  // (opacity/scale), so the "closed" <ul> stays in the DOM, absolutely
  // positioned, and can still intercept taps meant for whatever sits after it
  // (e.g. the sign-in/sign-up buttons right below it in the mobile menu).
  // Not rendering it at all when closed removes that risk entirely.
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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/8 hover:border-white/15 transition-all text-xs font-semibold cursor-pointer select-none"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span>{current.short}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden className={`opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <ul className={`absolute z-50 p-1 rounded-xl border border-white/10 bg-[#0f0f18] shadow-xl shadow-black/40 min-w-36 flex flex-col gap-0.5 ${positionClass}`}>
          {LANGS.map(({ code, flag, label }) => (
            <li key={code}>
              <button
                type="button"
                onClick={() => { setLang(code); setOpen(false) }}
                className={[
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                  lang === code
                    ? 'bg-violet-500/15 text-violet-300'
                    : 'text-white/60 hover:text-white hover:bg-white/6',
                ].join(' ')}
              >
                <span className="text-base leading-none">{flag}</span>
                <span className="font-medium">{label}</span>
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
