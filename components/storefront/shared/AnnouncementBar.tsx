'use client'

import { useEffect, useReducer } from 'react'
import { getContrastTextColor } from '@/lib/store/theme-config'
import { useStorefrontLanguage } from './StorefrontLanguageProvider'
import type { ThemeConfig } from '@/lib/types/storefront'

type Action = { type: 'dismiss' } | { type: 'restore'; dismissed: boolean }

function dismissedReducer(state: boolean, action: Action): boolean {
  return action.type === 'dismiss' ? true : action.dismissed
}

export function AnnouncementBar({ slug, tokens }: { slug: string; tokens: Required<ThemeConfig> }) {
  const { t } = useStorefrontLanguage()
  const text = tokens.announcementText.trim()
  const storageKey = `nipnip-announcement-dismissed-${slug}-${text}`
  const [dismissed, dispatch] = useReducer(dismissedReducer, false)

  // Reads localStorage after mount (not during SSR) so server and first client render always
  // agree on "visible" — avoids a hydration mismatch at the cost of a brief flash for repeat visitors.
  useEffect(() => {
    if (tokens.announcementDismissible) {
      dispatch({ type: 'restore', dismissed: window.localStorage.getItem(storageKey) === '1' })
    }
  }, [storageKey, tokens.announcementDismissible])

  if (!tokens.announcementEnabled || !text || dismissed) return null

  const textColor = getContrastTextColor(tokens.announcementColor)

  return (
    <div
      className="relative flex items-center gap-2 px-10 py-2 text-xs sm:text-sm font-medium"
      style={{ backgroundColor: tokens.announcementColor, color: textColor }}
    >
      {tokens.announcementLink ? (
        <a href={tokens.announcementLink} className="flex-1 text-center hover:underline underline-offset-2">
          {text}
        </a>
      ) : (
        <span className="flex-1 text-center">{text}</span>
      )}
      {tokens.announcementDismissible && (
        <button
          type="button"
          aria-label={t.announcementBar.closeAriaLabel}
          onClick={() => {
            window.localStorage.setItem(storageKey, '1')
            dispatch({ type: 'dismiss' })
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity text-sm leading-none"
          style={{ color: textColor }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
