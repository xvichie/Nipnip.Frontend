'use client'

import { createPortal } from 'react-dom'

// Classic "panel" sidebar-toggle glyph (Notion/Linear/VS Code style) — the shaded
// segment mirrors sides between states, so the icon itself communicates the action.
export const SIDEBAR_COLLAPSE_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M6.25 3v10" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2.5 3.6h3v8.8h-3a1 1 0 0 1-1-1V4.6a1 1 0 0 1 1-1Z" fill="currentColor" fillOpacity="0.35"/>
    <path d="M9 6.25 7.25 8 9 9.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
export const SIDEBAR_EXPAND_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M9.75 3v10" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M10.5 3.6h3a1 1 0 0 1 1 1v6.8a1 1 0 0 1-1 1h-3V3.6Z" fill="currentColor" fillOpacity="0.35"/>
    <path d="M6 6.25 7.75 8 6 9.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Portal-rendered instead of a plain absolutely-positioned popover — the sidebar's drawer
// wrapper clips overflow-x unconditionally, so anything meant to escape the collapsed icon-only
// rail has to render outside that DOM subtree entirely to avoid getting clipped. The anchor rect
// is captured in the caller's hover handler (not read from a ref during render) to satisfy
// react-hooks/refs.
export function CollapsedTooltip({ label, rect }: { label: string; rect: DOMRect }) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      role="tooltip"
      className="fixed z-[200] px-2.5 py-1.5 rounded-lg bg-[#14141c] border border-white/10 text-white text-xs font-medium shadow-xl shadow-black/50 pointer-events-none whitespace-nowrap"
      style={{ top: rect.top + rect.height / 2, left: rect.right + 8, transform: 'translateY(-50%)' }}
    >
      {label}
    </div>,
    document.body
  )
}
