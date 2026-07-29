'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { OptionFilterInput } from '@/lib/types/storefront'
import { type ProductSortOption } from './product-search'

const DEBOUNCE_MS = 300
const SORT_VALUES: ProductSortOption[] = ['featured', 'price-asc', 'price-desc', 'name-asc', 'name-desc']

function parsePage(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 1
  return Number.isFinite(n) && n > 0 ? n : 1
}

function parseSort(raw: string | null): ProductSortOption {
  return (SORT_VALUES as string[]).includes(raw ?? '') ? (raw as ProductSortOption) : 'featured'
}

function parsePriceRange(searchParams: URLSearchParams): [number, number] | null {
  const min = searchParams.get('minPrice')
  const max = searchParams.get('maxPrice')
  if (min == null || max == null) return null
  const minN = Number(min)
  const maxN = Number(max)
  return Number.isFinite(minN) && Number.isFinite(maxN) ? [minN, maxN] : null
}

function rangesEqual(a: [number, number] | null, b: [number, number] | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return a[0] === b[0] && a[1] === b[1]
}

function parseOptionFilters(raw: string | null): OptionFilterInput[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (f): f is OptionFilterInput =>
        !!f && typeof f.name === 'string' && Array.isArray(f.values) && f.values.length > 0
    )
  } catch {
    return []
  }
}

// Keeps the products listing page (search term, sort, price range, option filters, page) fully
// driven by the URL so the exact filtered view can be bookmarked or shared as a link. `search`
// is additionally mirrored into local state so typing feels instant while the URL update — and
// the resulting refetch — stays debounced.
export function useProductListUrlState() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlSearch = searchParams.get('search') ?? ''
  const [searchInput, setSearchInput] = useState(urlSearch)

  // "Adjust state during render" instead of an effect — keeps the input box in sync when the
  // URL's search term changes from outside typing (back/forward navigation, opening a shared
  // link), while leaving it alone in between, once the debounce below has caught up to it.
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch)
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch)
    setSearchInput(urlSearch)
  }

  const page = parsePage(searchParams.get('page'))
  const sortBy = parseSort(searchParams.get('sort'))
  const priceRange = parsePriceRange(searchParams)
  const optionFilters = parseOptionFilters(searchParams.get('filters'))

  // Same instant-local-state/debounced-URL split as search — a price slider fires onChange on
  // every tick of the drag, so without this the URL (and the resulting product refetch) would
  // fire dozens of times per drag instead of once after the shopper settles on a value.
  const [priceRangeInput, setPriceRangeInput] = useState(priceRange)
  const [prevUrlPriceRange, setPrevUrlPriceRange] = useState(priceRange)
  if (!rangesEqual(priceRange, prevUrlPriceRange)) {
    setPrevUrlPriceRange(priceRange)
    setPriceRangeInput(priceRange)
  }

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) next.delete(key)
        else next.set(key, value)
      }
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== urlSearch) {
        updateParams({ search: searchInput.trim() || null, page: null })
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
    // Only the input value should re-trigger this debounce — re-running it when urlSearch or
    // updateParams change would fire it on every navigation, not just on typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  useEffect(() => {
    const t = setTimeout(() => {
      if (!rangesEqual(priceRangeInput, priceRange) && priceRangeInput) {
        updateParams({ minPrice: String(priceRangeInput[0]), maxPrice: String(priceRangeInput[1]), page: null })
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
    // Only the input value should re-trigger this debounce — same reasoning as the search effect above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRangeInput])

  const setPage = useCallback(
    (next: number) => updateParams({ page: next > 1 ? String(next) : null }),
    [updateParams]
  )

  const setSortBy = useCallback(
    (next: ProductSortOption) => updateParams({ sort: next === 'featured' ? null : next, page: null }),
    [updateParams]
  )

  const setPriceRange = useCallback((next: [number, number]) => setPriceRangeInput(next), [])

  const setOptionFilters = useCallback(
    (next: OptionFilterInput[]) => {
      const active = next.filter(f => f.values.length > 0)
      updateParams({ filters: active.length > 0 ? JSON.stringify(active) : null, page: null })
    },
    [updateParams]
  )

  return {
    searchInput,
    setSearchInput,
    debouncedSearch: urlSearch,
    page,
    setPage,
    sortBy,
    setSortBy,
    priceRange,
    priceRangeInput,
    setPriceRange,
    optionFilters,
    setOptionFilters,
  }
}
