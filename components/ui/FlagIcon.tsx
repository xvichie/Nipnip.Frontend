// Real SVG flags instead of flag emoji (🇬🇪🇬🇧🇷🇺) — Windows in particular renders those
// regional-indicator emoji sequences as plain two-letter country codes instead of pictures on
// a lot of font configurations, which is exactly what this replaces. Used by every ka/en/ru
// language picker across the storefront and the merchant dashboard, so a single component keeps
// them all in sync.
export function FlagIcon({ code, className }: { code: 'ka' | 'en' | 'ru'; className?: string }) {
  const cls = `inline-block shrink-0 rounded-[1px] ${className ?? ''}`

  if (code === 'ka') {
    return (
      <svg viewBox="0 0 24 16" className={cls} aria-hidden>
        <rect width="24" height="16" fill="#fff" />
        <rect x="10" width="4" height="16" fill="#DA291C" />
        <rect y="6" width="24" height="4" fill="#DA291C" />
        <g fill="#DA291C">
          <path d="M4.4 2.8h1v1h1v1h-1v1h-1v-1h-1v-1h1z" />
          <path d="M17.6 2.8h1v1h1v1h-1v1h-1v-1h-1v-1h1z" />
          <path d="M4.4 10.2h1v1h1v1h-1v1h-1v-1h-1v-1h1z" />
          <path d="M17.6 10.2h1v1h1v1h-1v1h-1v-1h-1v-1h1z" />
        </g>
      </svg>
    )
  }

  if (code === 'ru') {
    return (
      <svg viewBox="0 0 24 16" className={cls} aria-hidden>
        <rect width="24" height="5.333" fill="#fff" />
        <rect y="5.333" width="24" height="5.333" fill="#0039A6" />
        <rect y="10.667" width="24" height="5.333" fill="#D52B1E" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 16" className={cls} aria-hidden>
      <rect width="24" height="16" fill="#00247D" />
      <path d="M0 0L24 16M24 0L0 16" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0L24 16M24 0L0 16" stroke="#CF142B" strokeWidth="1.3" />
      <path d="M12 0V16M0 8H24" stroke="#fff" strokeWidth="5.3" />
      <path d="M12 0V16M0 8H24" stroke="#CF142B" strokeWidth="2.1" />
    </svg>
  )
}
