'use client'

import type { OptionFilterInput, ProductFacetResponse } from '@/lib/types/storefront'

// Renders one collapsible-free chip group per distinct product option (e.g. "ზომა", "ფერი")
// found in the current category. Selecting multiple values within the same group OR's them
// together; selecting values across different groups AND's the groups — matching how the
// listing query itself combines `optionFilters`.
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
          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-3 ${labelClassName}`}>{facet.name}</p>
          <div className="flex flex-wrap gap-1.5">
            {facet.values.map(value => {
              const active = isSelected(facet.name, value)
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggle(facet.name, value)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${chipClassName}`}
                  style={active ? { backgroundColor: accentColor, borderColor: accentColor, color: '#fff' } : undefined}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
