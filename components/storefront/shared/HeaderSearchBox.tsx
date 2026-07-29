'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStorefrontLanguage } from './StorefrontLanguageProvider'

// A search icon that expands into a small dropdown panel with a text field — same interaction
// shape as StorefrontLanguageSwitcher (explicit open state + click-outside-to-close, not a
// CSS-only dropdown), so it drops into any theme's header row without needing extra layout
// space until the shopper actually opens it. Submitting navigates to the all-products page with
// `?search=` set, which useProductListUrlState already picks up as the initial search term —
// this component has no idea whether the products page is even mounted.
export function HeaderSearchBox({ placement = 'bottom-end' }: { placement?: 'bottom-end' | 'bottom-start' }) {
  const { t } = useStorefrontLanguage()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
    setOpen(false)
  }

  const positionClass = placement === 'bottom-end' ? 'top-full right-0 mt-1' : 'top-full left-0 mt-1'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label={t.header.searchAriaLabel}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10 text-current transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className={`absolute z-50 p-1.5 rounded-xl border border-black/10 bg-white text-black shadow-xl shadow-black/10 w-64 flex items-center gap-1.5 ${positionClass}`}
        >
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={t.grid.searchPlaceholder}
            className="flex-1 min-w-0 text-sm px-2.5 py-1.5 rounded-lg bg-black/4 focus:outline-none focus:bg-black/8 transition-colors"
          />
          <button
            type="submit"
            aria-label={t.header.searchAriaLabel}
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      )}
    </div>
  )
}
