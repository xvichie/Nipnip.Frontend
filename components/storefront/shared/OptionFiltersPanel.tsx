'use client'

import type { OptionFilterInput, ProductFacetResponse } from '@/lib/types/storefront'
import { getOptionName, getOptionValueName } from '@/lib/store/translations'
import { useStorefrontLanguage } from '@/components/storefront/shared/StorefrontLanguageProvider'

// Renders one collapsible-free chip group per distinct product option (e.g. "ზომა", "ფერი")
// found in the current category. Selecting multiple values within the same group OR's them
// together; selecting values across different groups AND's the groups — matching how the
// listing query itself combines `optionFilters`. Filter matching always keys off the facet's
// canonical Name/Value (the fallback-resolved `name`/`value.value`, never the translations),
// same identity the backend groups facets by — only the displayed label is language-aware.
export function OptionFiltersPanel({
  facets,
  selected,
  onChange,
  accentColor,
  labelClassName = '',
  chipClassName = '',
}: {
  facets: ProductFacetResponse[]
  selected: OptionFilterInput[]
  onChange: (next: OptionFilterInput[]) => void
  accentColor: string
  labelClassName?: string
  chipClassName?: string
}) {
  const { lang } = useStorefrontLanguage()

  if (facets.length === 0) return null

  function isSelected(name: string, value: string): boolean {
    return selected.some(g => g.name === name && g.values.includes(value))
  }

  function toggle(name: string, value: string) {
    const group = selected.find(g => g.name === name)
    if (!group) {
      onChange([...selected, { name, values: [value] }])
      return
    }
    const nextValues = group.values.includes(value)
      ? group.values.filter(v => v !== value)
      : [...group.values, value]
    onChange(
      nextValues.length > 0
        ? selected.map(g => (g.name === name ? { ...g, values: nextValues } : g))
        : selected.filter(g => g.name !== name)
    )
  }

  return (
    <>
      {facets.map(facet => (
        <div key={facet.name}>
          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${labelClassName}`}>{getOptionName(facet, lang)}</p>
          <div className="flex flex-wrap gap-1.5">
            {facet.values.map(value => {
              const active = isSelected(facet.name, value.value)
              return (
                <button
                  key={value.value}
                  type="button"
                  onClick={() => toggle(facet.name, value.value)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${chipClassName}`}
                  style={active ? { backgroundColor: accentColor, borderColor: accentColor, color: '#fff' } : undefined}
                >
                  {getOptionValueName(value, lang)}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
