'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SIDEBAR_COLLAPSED_EVENT } from '@/lib/dashboard/sidebar-state'

// A plain `fixed bottom-6 right-6` button is anchored to the viewport's edge, which
// drifts out of sync with the actual content column now that the sidebar's width
// varies (collapsed vs. expanded) — main isn't centered, so the gap between content
// and the viewport's right edge changes with it. This measures `anchorRef`'s own
// right edge instead and re-measures on resize and on the sidebar's collapse toggle.
//
// Portaled to <body> so it isn't clipped by anything — submits via the HTML `form`
// attribute (referencing the target form's id) rather than DOM nesting, since a portal
// moves it out of the <form> subtree.
export function FloatingFormButton({
  anchorRef,
  formId,
  disabled,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>
  formId: string
  disabled?: boolean
  children: React.ReactNode
}) {
  const [right, setRight] = useState<number | null>(null)

  useEffect(() => {
    function measure() {
      const el = anchorRef.current
      if (!el) return
      setRight(window.innerWidth - el.getBoundingClientRect().right)
    }

    measure()
    // The sidebar's width change is CSS-transitioned (~200ms) — re-measure once more
    // after it settles, in addition to the immediate measurement above.
    const settleTimer = window.setTimeout(measure, 250)

    window.addEventListener('resize', measure)
    window.addEventListener(SIDEBAR_COLLAPSED_EVENT, measure)
    return () => {
      window.clearTimeout(settleTimer)
      window.removeEventListener('resize', measure)
      window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, measure)
    }
  }, [anchorRef])

  if (right === null || typeof document === 'undefined') return null

  return createPortal(
    <button
      type="submit"
      form={formId}
      disabled={disabled}
      style={{ right }}
      className="fixed bottom-6 z-40 btn gap-2 px-6 bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500 text-white shadow-lg shadow-fuchsia-950/50 disabled:opacity-40"
    >
      {children}
    </button>,
    document.body
  )
}
