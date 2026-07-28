'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { StorefrontStrings } from '@/lib/storefront-i18n'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({
  items,
  t,
  textClassName,
  mutedClassName,
}: {
  items: BreadcrumbItem[]
  t: StorefrontStrings
  textClassName: string
  mutedClassName: string
}) {
  const router = useRouter()

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-2.5 mb-6 text-sm min-w-0">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label={t.breadcrumbs.backAriaLabel}
        className={`shrink-0 cursor-pointer transition-colors ${mutedClassName}`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ol className="flex items-center gap-2 flex-wrap min-w-0">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-2 min-w-0">
              {i > 0 && <span className={mutedClassName}>/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className={`${mutedClassName} hover:opacity-70 transition-opacity truncate`}>
                  {item.label}
                </Link>
              ) : (
                <span className={`${textClassName} truncate`}>{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
