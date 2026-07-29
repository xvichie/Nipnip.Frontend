'use client'

import { useState } from 'react'

// Matches the duration of the `animate-modal-*-out` keyframes in globals.css.
const CLOSE_ANIMATION_MS = 150

/**
 * Every dashboard modal is conditionally rendered (`{open && <Modal/>}`), which unmounts it the
 * instant `onClose` runs — no time for an exit transition to play. This delays the real unmount
 * just long enough for the "out" animation to finish, so every modal gets the same "shrink and
 * fade out" close instead of abruptly disappearing. Use `closing` to pick the in/out class pair,
 * and call `close()` from the backdrop click, the X button, Cancel, and any mutation's onSuccess —
 * anywhere the modal would otherwise close immediately.
 */
export function useAnimatedModal(onClose: () => void) {
  const [closing, setClosing] = useState(false)

  function close() {
    setClosing(true)
    setTimeout(onClose, CLOSE_ANIMATION_MS)
  }

  return { closing, close }
}
