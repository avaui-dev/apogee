// Button class tables. Shared with ToggleButton and NavLink so every
// button-shaped control sits on the same height scale.
export const buttonSizes = {
  small: 'h-7 px-2 text-xs gap-1.5 rounded-sm [&_svg]:size-3.5',
  medium: 'h-9 px-3 text-sm gap-2 rounded-md [&_svg]:size-4',
  large: 'h-12 px-4 text-base gap-2 rounded-md [&_svg]:size-4',
  xlarge: 'h-14 px-5 text-lg gap-2.5 rounded-md [&_svg]:size-5',
} as const
export const iconOnlySizes = { small: 'size-7', medium: 'size-9', large: 'size-12', xlarge: 'size-14' } as const

// variant × color. Every string is a literal so Tailwind sees it.
export const buttonStyles = {
  solid: {
    primary: 'bg-primary text-on-primary hover:bg-primary-highlighted',
    neutral: 'bg-neutral text-on-neutral hover:bg-neutral-highlighted',
    critical: 'bg-critical text-on-critical hover:bg-critical-highlighted',
    positive: 'bg-positive text-on-positive hover:bg-positive-highlighted',
    warning: 'bg-warning text-on-warning hover:bg-warning-highlighted',
  },
  faded: {
    primary: 'bg-primary-faded text-primary hover:bg-primary-faded-highlighted',
    neutral: 'bg-neutral-faded text-neutral hover:bg-neutral-faded-highlighted',
    critical: 'bg-critical-faded text-critical hover:bg-critical-faded-highlighted',
    positive: 'bg-positive-faded text-positive hover:bg-positive-faded-highlighted',
    warning: 'bg-warning-faded text-warning hover:bg-warning-faded-highlighted',
  },
  outline: {
    primary: 'border border-primary text-primary hover:bg-primary-faded-highlighted',
    neutral: 'border border-neutral text-neutral shadow-outline hover:bg-neutral-faded-highlighted',
    critical: 'border border-critical text-critical hover:bg-critical-faded-highlighted',
    positive: 'border border-positive text-positive hover:bg-positive-faded-highlighted',
    warning: 'border border-warning text-warning hover:bg-warning-faded-highlighted',
  },
  ghost: {
    primary: 'text-primary hover:bg-primary-faded-highlighted',
    neutral: 'text-neutral hover:bg-neutral-faded-highlighted',
    critical: 'text-critical hover:bg-critical-faded-highlighted',
    positive: 'text-positive hover:bg-positive-faded-highlighted',
    warning: 'text-warning hover:bg-warning-faded-highlighted',
  },
} as const
// `highlighted`: the variant's hover fill made permanent (an active filter, a menu that is open).
export const highlightedStyles = {
  solid: {
    primary: 'bg-primary-highlighted',
    neutral: 'bg-neutral-highlighted',
    critical: 'bg-critical-highlighted',
    positive: 'bg-positive-highlighted',
    warning: 'bg-warning-highlighted',
  },
  faded: {
    primary: 'bg-primary-faded-highlighted',
    neutral: 'bg-neutral-faded-highlighted',
    critical: 'bg-critical-faded-highlighted',
    positive: 'bg-positive-faded-highlighted',
    warning: 'bg-warning-faded-highlighted',
  },
  outline: {
    primary: 'bg-primary-faded-highlighted',
    neutral: 'bg-neutral-faded-highlighted',
    critical: 'bg-critical-faded-highlighted',
    positive: 'bg-positive-faded-highlighted',
    warning: 'bg-warning-faded-highlighted',
  },
  ghost: {
    primary: 'bg-primary-faded-highlighted',
    neutral: 'bg-neutral-faded-highlighted',
    critical: 'bg-critical-faded-highlighted',
    positive: 'bg-positive-faded-highlighted',
    warning: 'bg-warning-faded-highlighted',
  },
} as const
export type ButtonColor = keyof typeof buttonStyles.solid
export type ButtonVariant = keyof typeof buttonStyles
export type ButtonSize = keyof typeof buttonSizes

// ToggleButton pressed state, `aria-pressed:`-prefixed so it beats the resting
// variant (and its hover) without a specificity fight.
export const pressedStyles = {
  solid: {
    primary: 'aria-pressed:bg-primary aria-pressed:text-on-primary aria-pressed:hover:bg-primary-highlighted',
    neutral: 'aria-pressed:bg-neutral aria-pressed:text-on-neutral aria-pressed:hover:bg-neutral-highlighted',
    critical: 'aria-pressed:bg-critical aria-pressed:text-on-critical aria-pressed:hover:bg-critical-highlighted',
    positive: 'aria-pressed:bg-positive aria-pressed:text-on-positive aria-pressed:hover:bg-positive-highlighted',
    warning: 'aria-pressed:bg-warning aria-pressed:text-on-warning aria-pressed:hover:bg-warning-highlighted',
  },
  faded: {
    primary: 'aria-pressed:bg-primary-faded aria-pressed:text-primary aria-pressed:hover:bg-primary-faded-highlighted',
    neutral: 'aria-pressed:bg-neutral-faded aria-pressed:text-neutral aria-pressed:hover:bg-neutral-faded-highlighted',
    critical: 'aria-pressed:bg-critical-faded aria-pressed:text-critical aria-pressed:hover:bg-critical-faded-highlighted',
    positive: 'aria-pressed:bg-positive-faded aria-pressed:text-positive aria-pressed:hover:bg-positive-faded-highlighted',
    warning: 'aria-pressed:bg-warning-faded aria-pressed:text-warning aria-pressed:hover:bg-warning-faded-highlighted',
  },
} as const
export type PressedVariant = keyof typeof pressedStyles
