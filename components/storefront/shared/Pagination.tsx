'use client'

import type { StorefrontStrings } from '@/lib/storefront-i18n'

export function Pagination({
  page,
  totalPages,
  onChange,
  t,
  buttonClassName,
  textClassName,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
  t: StorefrontStrings
  buttonClassName: string
  textClassName: string
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3 mt-10">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={buttonClassName}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t.pagination.previous}
      </button>
      <span className={`text-sm tabular-nums ${textClassName}`}>{page} / {totalPages}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={buttonClassName}
      >
        {t.pagination.next}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
