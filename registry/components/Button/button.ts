// Button class tables. Shared with ToggleButton and NavLink so every
// button-shaped control sits on the same height scale.
export const buttonSizes = {
  small: 'h-7 px-2 text-xs gap-1.5 rounded-sm',
  medium: 'h-9 px-3 text-sm gap-2 rounded-md',
  large: 'h-12 px-4 text-base gap-2 rounded-md',
  xlarge: 'h-14 px-5 text-lg gap-2.5 rounded-md',
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
export type ButtonColor = keyof typeof buttonStyles.solid
export type ButtonVariant = keyof typeof buttonStyles
export type ButtonSize = keyof typeof buttonSizes
