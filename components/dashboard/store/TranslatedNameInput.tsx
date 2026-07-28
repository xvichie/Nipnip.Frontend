'use client'

import { useState } from 'react'

export interface TranslatedNameValue {
  nameKa: string
  nameEn: string
  nameRu: string
}

const TABS: { key: keyof TranslatedNameValue; flag: string; short: string }[] = [
  { key: 'nameKa', flag: '🇬🇪', short: 'ქარ' },
  { key: 'nameEn', flag: '🇬🇧', short: 'ENG' },
  { key: 'nameRu', flag: '🇷🇺', short: 'РУС' },
]

// At least one of the three must be filled — validated by whoever calls this (via
// hasAnyTranslatedName), not enforced here, since "required" only applies to the whole set.
export function TranslatedNameInput({
  value,
  onChange,
  placeholder,
  className = 'input input-sm bg-neutral-900 border-white/10 focus:border-fuchsia-500/60 flex-1',
  autoFocus = false,
}: {
  value: TranslatedNameValue
  onChange: (value: TranslatedNameValue) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}) {
  const [activeTab, setActiveTab] = useState<keyof TranslatedNameValue>('nameKa')

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <div className="flex items-center gap-1">
        {TABS.map(tab => {
          const filled = value[tab.key].trim().length > 0
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors',
                activeTab === tab.key ? 'bg-fuchsia-500/15 text-fuchsia-300' : 'text-white/40 hover:text-white/70 hover:bg-white/6',
              ].join(' ')}
            >
              <span className="text-xs leading-none">{tab.flag}</span>
              <span>{tab.short}</span>
              <span className={`w-1 h-1 rounded-full ${filled ? 'bg-emerald-400' : 'bg-white/15'}`} />
            </button>
          )
        })}
      </div>
      <input
        autoFocus={autoFocus}
        type="text"
        value={value[activeTab]}
        onChange={e => onChange({ ...value, [activeTab]: e.target.value })}
        placeholder={placeholder}
        className={className}
      />
    </div>
  )
}

export function hasAnyTranslatedName(value: TranslatedNameValue): boolean {
  return !!(value.nameKa.trim() || value.nameEn.trim() || value.nameRu.trim())
}
