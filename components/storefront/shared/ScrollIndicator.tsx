export function ScrollIndicator({ colorClassName = 'text-white' }: { colorClassName?: string }) {
  return (
    <div className={`absolute bottom-5 left-1/2 -translate-x-1/2 animate-scroll-hint ${colorClassName}`} aria-hidden>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
