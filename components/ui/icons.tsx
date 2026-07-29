// Shared inline icon set for action buttons across the merchant dashboard — kept as plain
// SVG components (matching the rest of the codebase's convention) rather than pulling in an
// icon library, so every icon-only button can reuse the exact same glyph instead of each
// call site re-drawing its own path data.

type IconProps = { className?: string }

export function EditIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M9.5 1.5l3 3-7 7-3.5 1 1-3.5 6.5-6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function GripIcon({ className }: IconProps) {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden className={className}>
      <circle cx="2.5" cy="2.5" r="1.2" fill="currentColor"/>
      <circle cx="7.5" cy="2.5" r="1.2" fill="currentColor"/>
      <circle cx="2.5" cy="7" r="1.2" fill="currentColor"/>
      <circle cx="7.5" cy="7" r="1.2" fill="currentColor"/>
      <circle cx="2.5" cy="11.5" r="1.2" fill="currentColor"/>
      <circle cx="7.5" cy="11.5" r="1.2" fill="currentColor"/>
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M2.5 3.5h9M5.5 3.5V2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M5.5 6.5v4M8.5 6.5v4M3.5 3.5l.5 8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function DuplicateIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M9 5V3.5A1.5 1.5 0 0 0 7.5 2h-5A1.5 1.5 0 0 0 1 3.5v5A1.5 1.5 0 0 0 2.5 10H4" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden className={className}>
      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )
}

export function XIcon({ className }: IconProps) {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function ChevronUpIcon({ className }: IconProps) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden className={className}>
      <path d="M2 6.5L5 3.5L8 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden className={className}>
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden className={className}>
      <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden className={className}>
      <path d="M3.5 2L7 5l-3.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1.5" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}

export function StarIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill={filled ? 'currentColor' : 'none'} aria-hidden className={className}>
      <path d="M7 1.3l1.7 3.5 3.9.6-2.8 2.7.7 3.9L7 9.9l-3.5 1.8.7-3.9-2.8-2.7 3.9-.6L7 1.3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M12 4.5V1.5M12 4.5H9M12 4.5A5 5 0 1 0 12.7 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function PrintIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <rect x="3" y="5" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M3.5 5V2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5V5M4.5 10v1.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function SlidersIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M2 4h3M8 4h4M2 10h6M11 10h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="6" cy="4" r="1.3" fill="currentColor"/>
      <circle cx="9" cy="10" r="1.3" fill="currentColor"/>
    </svg>
  )
}

export function LoginIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M5.5 1.5H3A1.5 1.5 0 0 0 1.5 3v8A1.5 1.5 0 0 0 3 12.5h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 4.5L12 7l-3.5 2.5M5.5 7H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function StoreIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M1.5 5l1-3h9l1 3M1.5 5v6.5h11V5M1.5 5a1.75 1.75 0 0 0 3.5 0 1.75 1.75 0 0 0 3.5 0 1.75 1.75 0 0 0 3.5 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function PowerIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M7 1.5V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M4 3.2a4.5 4.5 0 1 0 6 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function FlaskIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M5.5 1.5h3M5.75 1.5v3.8L2.7 10.4a1 1 0 0 0 .87 1.5h6.86a1 1 0 0 0 .87-1.5L8.25 5.3V1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.3 8.3h5.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function BoldIcon({ className }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M3.5 1.5h4a2.5 2.5 0 0 1 0 5h-4v-5Zm0 5h4.5a2.5 2.5 0 0 1 0 5h-4.5v-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  )
}

export function ItalicIcon({ className }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M8.5 1.5h-3M8.5 1.5 5.5 12.5M5.5 12.5h-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

export function UnderlineIcon({ className }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M3.5 1.5v5a3.5 3.5 0 0 0 7 0v-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M2.5 12.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M6 8a3 3 0 0 0 4.2 0l1.3-1.3a3 3 0 0 0-4.2-4.2L6.4 3.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6a3 3 0 0 0-4.2 0L2.5 7.3a3 3 0 0 0 4.2 4.2l.9-.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function BulletListIcon({ className }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <circle cx="2" cy="3" r="1" fill="currentColor"/>
      <circle cx="2" cy="7" r="1" fill="currentColor"/>
      <circle cx="2" cy="11" r="1" fill="currentColor"/>
      <path d="M5.5 3h7M5.5 7h7M5.5 11h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function OrderedListIcon({ className }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <text x="0.5" y="4.3" fontSize="3.6" fill="currentColor">1</text>
      <text x="0.5" y="8.3" fontSize="3.6" fill="currentColor">2</text>
      <text x="0.5" y="12.3" fontSize="3.6" fill="currentColor">3</text>
      <path d="M5.5 3h7M5.5 7h7M5.5 11h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function QuoteIcon({ className }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M4.5 3.5c-1.4 0-2.5 1.1-2.5 2.5S3.1 8.5 4.5 8.5c0-2.5-.8-4-2-5Z" fill="currentColor"/>
      <path d="M10 3.5c-1.4 0-2.5 1.1-2.5 2.5S8.6 8.5 10 8.5c0-2.5-.8-4-2-5Z" fill="currentColor"/>
    </svg>
  )
}

export function ClearFormatIcon({ className }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M3 1.5h8L8.5 12.5h-3L3 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M1.5 1.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M2 12l10-10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

export function SwatchIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <circle cx="4.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="9.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="7" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}

export function PaletteIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M7 1.3a5.7 5.7 0 1 0 0 11.4c.7 0 1.1-.6.8-1.2-.2-.3-.1-.8.3-1 .3-.1.6-.1.9 0 .5.3 1.2.1 1.4-.5.5-1.7.2-3.7-1.1-5.2C8.2 3.6 7 3.3 7 1.3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="4.5" cy="6" r="0.8" fill="currentColor"/>
      <circle cx="6" cy="3.8" r="0.8" fill="currentColor"/>
      <circle cx="4.3" cy="8.7" r="0.8" fill="currentColor"/>
    </svg>
  )
}

export function ImageIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <rect x="1.5" y="2.5" width="11" height="9" rx="1.3" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="5" cy="5.5" r="1.1" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M1.8 9.5l3-2.7 2.3 2 2.7-2.3 2.2 1.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function HeaderBarIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <rect x="1.5" y="1.5" width="11" height="11" rx="1.3" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1.5 5h11" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="3.3" cy="3.3" r="0.5" fill="currentColor"/>
    </svg>
  )
}

export function HeroSectionIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <rect x="1.5" y="1.5" width="11" height="11" rx="1.3" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="4.5" cy="4.8" r="1" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M1.8 9.8l2.7-2.5 2 1.7 2.8-2.8 2.4 2.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function BannerIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M2.5 1.5v11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M2.5 2h8.2l-1.6 2.3L10.7 6.6H2.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}

export function ButtonIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <rect x="1.5" y="4.5" width="11" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="7" cy="7" r="1" fill="currentColor"/>
    </svg>
  )
}

export function StackIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <rect x="2.5" y="1.5" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1.5 6.3v4.2a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function TagBadgeIcon({ className }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M7.7 1.5H2.5a1 1 0 0 0-1 1v5.2a1 1 0 0 0 .3.7l5.8 5.8a1 1 0 0 0 1.4 0l4.2-4.2a1 1 0 0 0 0-1.4l-5.8-5.8a1 1 0 0 0-.7-.3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="4.5" cy="4.5" r="0.9" fill="currentColor"/>
    </svg>
  )
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M6 2H2.5A1.5 1.5 0 0 0 1 3.5v8A1.5 1.5 0 0 0 2.5 13h8a1.5 1.5 0 0 0 1.5-1.5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 1.5H13V6M13 1.5L6.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
