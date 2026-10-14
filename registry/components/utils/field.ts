// Shared class tables for text-like controls (Input, Textarea, Select,
// Combobox, NumberInput, PinInput, TagInput). Every string is a literal so
// Tailwind sees it.
export const fieldSizes = {
  small: 'h-7 px-2 text-xs rounded-sm',
  medium: 'h-9 px-3 text-sm rounded-md',
  large: 'h-12 px-4 text-base rounded-md',
  xlarge: 'h-14 px-5 text-lg rounded-md',
} as const

export const fieldVariants = {
  outline: 'border border-neutral bg-page shadow-(--shadow-field)',
  faded: 'border border-transparent bg-neutral-faded',
  ghost: 'border border-transparent bg-transparent',
  headless: 'border-0 bg-transparent p-0 h-auto rounded-none',
} as const

export const fieldBase =
  'w-full text-neutral placeholder:text-neutral-faded transition-colors max-md:text-base scroll-py-3 autofill:rounded-[inherit] ' +
  'focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1.5px_var(--border-primary)] ' +
  'disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled disabled:border-disabled ' +
  'aria-[invalid=true]:border-critical'

export type FieldSize = keyof typeof fieldSizes
export type FieldVariant = keyof typeof fieldVariants
