'use client'

import { useLanguage, type Language } from '@/lib/i18n'

const LANGS: { code: Language; flag: string; short: string; label: string }[] = [
  { code: 'ka', flag: '🇬🇪', short: 'ქარ', label: 'ქართული' },
  { code: 'en', flag: '🇬🇧', short: 'ENG', label: 'English' },
  { code: 'ru', flag: '🇷🇺', short: 'РУС', label: 'Русский' },
]

export function LanguageSwitcher({ placement = 'bottom-end' }: { placement?: 'bottom-end' | 'top-start' | 'top-end' }) {
  const { lang, setLang } = useLanguage()
  const current = LANGS.find(l => l.code === lang) ?? LANGS[0]

  const posClass = placement === 'bottom-end'
    ? 'dropdown-end'
    : placement === 'top-end'
    ? 'dropdown-top dropdown-end'
    : 'dropdown-top'

  return (
    <div className={`dropdown ${posClass}`}>
      <div
        tabIndex={0}
        role="button"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/8 hover:border-white/15 transition-all text-xs font-semibold cursor-pointer select-none"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span>{current.short}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden className="opacity-50">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-50 mt-1 p-1 rounded-xl border border-white/10 bg-[#0f0f18] shadow-xl shadow-black/40 min-w-36 flex flex-col gap-0.5"
      >
        {LANGS.map(({ code, flag, label }) => (
          <li key={code}>
            <button
              onClick={() => setLang(code)}
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
    </div>
  )
}
