'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
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

// Keeps the products listing page (search term, sort, price range, option filters, page) driven
// by local state instead of reactively recomputing from useSearchParams on every change.
// next/navigation's router.push/replace always triggers a fresh RSC round-trip for this page's
// Server Component (re-fetching the store + its categories, neither of which any filter affects)
// since this app has no custom `staleTimes` config — the App Router defaults dynamic-route client
// caching to 0. That invisible extra round-trip, stacked in front of the actual (spinner-covered)
// product refetch, was the real source of filters "feeling unresponsive before the loading
// animation even plays": every tweak was waiting on it before React Query's own fetch even
// started. Local state drives the product query immediately; the visible URL is kept in sync
// separately via history.replaceState (still bookmarkable/shareable) without ever going through
// the Next.js router.
export function useProductListUrlState() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Read once, at mount — everything below is the source of truth afterward, not a reactive view
  // of the URL, since the URL now updates through a side channel (history.replaceState) that the
  // router doesn't know about.
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput)
  const [page, setPage] = useState(() => parsePage(searchParams.get('page')))
  const [sortBy, setSortByState] = useState<ProductSortOption>(() => parseSort(searchParams.get('sort')))
  const [priceRange, setPriceRangeState] = useState<[number, number] | null>(() => parsePriceRange(searchParams))
  const [priceRangeInput, setPriceRangeInput] = useState(priceRange)
  const [optionFilters, setOptionFiltersState] = useState<OptionFilterInput[]>(() => parseOptionFilters(searchParams.get('filters')))

  // The one filter written from outside this hook — HeaderSearchBox does a real router.push to
  // `/products?search=...`, which (when already on this page) re-renders this same mounted
  // instance with a fresh searchParams value instead of remounting it, so the lazy initializer
  // above won't see it. "Adjust state during render" picks that case up without needing an
  // effect, while leaving searchInput alone the rest of the time (once the debounce below has
  // caught up to it).
  const [prevUrlSearch, setPrevUrlSearch] = useState(searchInput)
  const urlSearch = searchParams.get('search') ?? ''
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch)
    setSearchInput(urlSearch)
    setDebouncedSearch(urlSearch)
  }

  // Recomputes the full query string from current state and swaps it into the address bar via
  // the native History API — never next/navigation's router, so this never triggers a Next.js
  // navigation or RSC fetch.
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (page > 1) params.set('page', String(page))
    if (sortBy !== 'featured') params.set('sort', sortBy)
    if (priceRange) {
      params.set('minPrice', String(priceRange[0]))
      params.set('maxPrice', String(priceRange[1]))
    }
    if (optionFilters.length > 0) params.set('filters', JSON.stringify(optionFilters))
    const qs = params.toString()
    const url = qs ? `${pathname}?${qs}` : pathname
    if (`${window.location.pathname}${window.location.search}` !== url) {
      window.history.replaceState(null, '', url)
    }
  }, [pathname, debouncedSearch, page, sortBy, priceRange, optionFilters])

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== debouncedSearch) {
        setDebouncedSearch(searchInput.trim())
        setPage(1)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
    // Only the input value should re-trigger this debounce — re-running it when debouncedSearch
    // changes too would fire it right back on its own commit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  useEffect(() => {
    const t = setTimeout(() => {
      if (!rangesEqual(priceRangeInput, priceRange) && priceRangeInput) {
        setPriceRangeState(priceRangeInput)
        setPage(1)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
    // Only the input value should re-trigger this debounce — same reasoning as the search effect above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRangeInput])

  const setSortBy = useCallback((next: ProductSortOption) => {
    setSortByState(next)
    setPage(1)
  }, [])

  const setPriceRange = useCallback((next: [number, number]) => setPriceRangeInput(next), [])

  const setOptionFilters = useCallback((next: OptionFilterInput[]) => {
    setOptionFiltersState(next.filter(f => f.values.length > 0))
    setPage(1)
  }, [])

  return {
    searchInput,
    setSearchInput,
    debouncedSearch,
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
