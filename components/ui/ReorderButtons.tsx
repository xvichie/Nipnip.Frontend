'use client'

import { IconButton } from './IconButton'
import { ChevronDownIcon, ChevronUpIcon } from './icons'

// Shared up/down pair for reordering rows in a list (hero slides, footer links, featured
// products, collection products, etc.) — every call site wired the same two icon buttons by
// hand before this existed.
export function ReorderButtons({
  disabledUp,
  disabledDown,
  onUp,
  onDown,
}: {
  disabledUp: boolean
  disabledDown: boolean
  onUp: () => void
  onDown: () => void
}) {
  return (
    <div className="flex flex-col gap-0.5 shrink-0">
      <IconButton
        icon={<ChevronUpIcon />}
        label="ზემოთ გადატანა"
        onClick={onUp}
        disabled={disabledUp}
        variant="ghost"
        className="!w-5 !h-4 !min-h-0"
      />
      <IconButton
        icon={<ChevronDownIcon />}
        label="ქვემოთ გადატანა"
        onClick={onDown}
        disabled={disabledDown}
        variant="ghost"
        className="!w-5 !h-4 !min-h-0"
      />
    </div>
  )
}
