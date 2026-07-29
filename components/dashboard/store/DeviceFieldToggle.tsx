'use client'

export type DeviceKind = 'desktop' | 'mobile'

const MONITOR_ICON = (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1.5" y="2.5" width="13" height="8.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5.5 14h5M8 11v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const PHONE_ICON = (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="4" y="1.5" width="8" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M7 12.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

/**
 * Small desktop/mobile pill toggle for fields that have a real value on both breakpoints (e.g.
 * hero image order: left/right on desktop vs top/bottom on mobile) — same icon language as the
 * live-preview Desktop/Mobile switcher in design/page.tsx, so picking "Mobile" here reads the same
 * way as picking it there. Swap which control renders in the slot below based on `value`, rather
 * than showing both desktop and mobile options at once in a separate block.
 */
export function DeviceFieldToggle({
  value,
  onChange,
}: {
  value: DeviceKind
  onChange: (value: DeviceKind) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/4 p-0.5 shrink-0">
      <button
        type="button"
        onClick={() => onChange('desktop')}
        aria-label="დესქტოპის მნიშვნელობა"
        className={[
          'tooltip tooltip-top flex items-center justify-center w-6 h-6 rounded-md transition-colors',
          value === 'desktop' ? 'bg-fuchsia-500/20 text-white' : 'text-white/40 hover:text-white',
        ].join(' ')}
        data-tip="დესქტოპი"
      >
        {MONITOR_ICON}
      </button>
      <button
        type="button"
        onClick={() => onChange('mobile')}
        aria-label="მობილურის მნიშვნელობა"
        className={[
          'tooltip tooltip-top flex items-center justify-center w-6 h-6 rounded-md transition-colors',
          value === 'mobile' ? 'bg-fuchsia-500/20 text-white' : 'text-white/40 hover:text-white',
        ].join(' ')}
        data-tip="მობილური"
      >
        {PHONE_ICON}
      </button>
    </div>
  )
}
