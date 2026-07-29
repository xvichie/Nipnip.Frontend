'use client'

import { useState } from 'react'
import { FlagIcon } from '@/components/ui/FlagIcon'

export interface TranslatedFieldValue {
  ka: string
  en: string
  ru: string
}

type LangKey = keyof TranslatedFieldValue

const TABS: { key: LangKey; short: string }[] = [
  { key: 'ka', short: 'ქართ' },
  { key: 'en', short: 'ENG' },
  { key: 'ru', short: 'РУС' },
]

// Generic {ka,en,ru} shape shared by every per-language admin field (product/option names,
// descriptions, option values...) — parallel to categories' TranslatedNameInput but not tied to
// a name-specific value shape or a single-line input, so the same widget covers textareas too.
// "Required overall" (at least one filled) is validated by the caller via hasAnyTranslatedValue,
// not enforced here, since some fields (e.g. product description) are entirely optional.
export function TranslatedField({
  value,
  onChange,
  placeholders,
  multiline = false,
  rows = 3,
  className,
  autoFocus = false,
}: {
  value: TranslatedFieldValue
  onChange: (value: TranslatedFieldValue) => void
  placeholders?: Partial<Record<LangKey, string>>
  multiline?: boolean
  rows?: number
  className?: string
  autoFocus?: boolean
}) {
  const [activeTab, setActiveTab] = useState<LangKey>('ka')
  const fieldClassName = className ?? (multiline
    ? 'textarea w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 resize-none'
    : 'input input-sm w-full bg-neutral-900 border-white/10 focus:border-fuchsia-500/60')

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        {TABS.map(tab => {
          const filled = value[tab.key].trim().length > 0
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors',
                activeTab === tab.key ? 'bg-fuchsia-500/15 text-fuchsia-300' : 'text-white/40 hover:text-white/70 hover:bg-white/6',
              ].join(' ')}
            >
              <FlagIcon code={tab.key} className="w-4 h-3" />
              <span>{tab.short}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${filled ? 'bg-emerald-400' : 'bg-white/15'}`} />
            </button>
          )
        })}
      </div>
      {multiline ? (
        <textarea
          autoFocus={autoFocus}
          value={value[activeTab]}
          onChange={e => onChange({ ...value, [activeTab]: e.target.value })}
          placeholder={placeholders?.[activeTab]}
          rows={rows}
          className={fieldClassName}
        />
      ) : (
        <input
          autoFocus={autoFocus}
          type="text"
          value={value[activeTab]}
          onChange={e => onChange({ ...value, [activeTab]: e.target.value })}
          placeholder={placeholders?.[activeTab]}
          className={fieldClassName}
        />
      )}
    </div>
  )
}

export function hasAnyTranslatedValue(value: TranslatedFieldValue): boolean {
  return !!(value.ka.trim() || value.en.trim() || value.ru.trim())
}
