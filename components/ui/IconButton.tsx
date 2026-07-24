'use client'

import type { ReactNode } from 'react'

type IconButtonVariant = 'default' | 'danger' | 'accent' | 'ghost'
type IconButtonSize = 'xs' | 'sm'
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  default: 'bg-white/4 border-white/8 text-white/60 hover:text-white',
  danger: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20',
  accent: 'bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/25',
  ghost: 'bg-transparent border-transparent text-white/40 hover:text-white hover:bg-white/5',
}

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
}

interface IconButtonProps {
  icon: ReactNode
  label: string
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: IconButtonVariant
  size?: IconButtonSize
  disabled?: boolean
  /** Renders with the `accent` look regardless of `variant` — for a toggled/selected state. */
  active?: boolean
  tooltipPosition?: TooltipPosition
  className?: string
}

// Shared icon-only button with a hover tooltip (daisyUI's tooltip/data-tip pair) — the
// standard shape for row-level actions (edit, delete, duplicate, move, remove) across the
// merchant dashboard, so a bare label never has to stand in for what an icon already shows.
export function IconButton({
  icon,
  label,
  onClick,
  type = 'button',
  variant = 'default',
  size = 'xs',
  disabled,
  active,
  tooltipPosition = 'top',
  className = '',
}: IconButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      data-tip={label}
      className={[
        'tooltip', `tooltip-${tooltipPosition}`,
        'btn btn-square disabled:opacity-40 transition-colors',
        SIZE_CLASSES[size],
        active ? VARIANT_CLASSES.accent : VARIANT_CLASSES[variant],
        className,
      ].join(' ')}
    >
      {icon}
    </button>
  )
}
