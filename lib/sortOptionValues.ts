// Purely numeric values (sizes like 36, 37, 38) sort numerically. Known apparel-size
// tokens sort by their canonical order (XL after L, not before it alphabetically).
// Everything else falls back to a locale-aware, numeric-substring-aware compare —
// good for colors, arbitrary labels, and non-Latin scripts alike.
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', 'XXXL', '3XL', '4XL', '5XL']

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

function isNumeric(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value)
}

export function optionValueComparator(a: string, b: string): number {
  const ta = a.trim()
  const tb = b.trim()

  if (isNumeric(ta) && isNumeric(tb)) return parseFloat(ta) - parseFloat(tb)

  const ia = SIZE_ORDER.indexOf(ta.toUpperCase())
  const ib = SIZE_ORDER.indexOf(tb.toUpperCase())
  if (ia !== -1 && ib !== -1) return ia - ib

  return collator.compare(ta, tb)
}

export function sortOptionValues(values: string[]): string[] {
  return [...values].sort(optionValueComparator)
}

export function sortOptionValueObjects<T extends { value: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => optionValueComparator(a.value, b.value))
}
