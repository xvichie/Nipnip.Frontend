import { flushSync } from 'react-dom'

// Wraps a state update in the View Transitions API so the browser animates elements
// (tagged with a stable `viewTransitionName`) sliding to their new position — falls
// back to an instant update in browsers that don't support it (e.g. Firefox).
//
// React batches state updates asynchronously, but startViewTransition needs the DOM
// mutation to have already happened by the time its callback returns (it captures the
// "after" snapshot right after) — flushSync forces React to commit synchronously here,
// otherwise the transition silently animates nothing.
export function withViewTransition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (callback: () => void) => unknown }
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(() => flushSync(update))
  } else {
    update()
  }
}

// `view-transition-name` only allows letters, digits, hyphens, and underscores —
// hash an arbitrary string (e.g. an image URL) into a short, stable, valid identifier.
export function viewTransitionNameFor(value: string): string {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return `vt-${Math.abs(hash)}`
}
