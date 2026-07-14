'use client'

import type { ProductOptionResponse, ThemeConfig } from '@/lib/types/storefront'

function sortedValues(option: ProductOptionResponse) {
  return [...option.values].sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'base' }))
}

export function VariantSelector({
  options,
  selected,
  onChange,
  tokens,
  radiusClass = '',
}: {
  options: ProductOptionResponse[]
  selected: Record<string, string>
  onChange: (optionId: string, valueId: string) => void
  tokens: Required<ThemeConfig>
  radiusClass?: string
}) {
  if (options.length === 0) return null

  return (
    <div className="flex flex-col gap-6 mb-8">
      {options.map(option => (
        <div key={option.id}>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3">
            {option.name}
            {selected[option.id] && (
              <span className="normal-case ml-1 opacity-100">
                {option.values.find(v => v.id === selected[option.id])?.value}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sortedValues(option).map(value => {
              const isSelected = selected[option.id] === value.id
              return (
                <button
                  key={value.id}
                  type="button"
                  onClick={() => onChange(option.id, value.id)}
                  className={[
                    'min-w-11 h-9 px-3 text-sm font-medium border transition-colors',
                    radiusClass,
                    isSelected ? 'text-white' : 'opacity-70 hover:opacity-100',
                  ].join(' ')}
                  style={
                    isSelected
                      ? { backgroundColor: tokens.accentColor, borderColor: tokens.accentColor }
                      : { borderColor: 'currentColor' }
                  }
                >
                  {value.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
