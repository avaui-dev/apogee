// Shared class tables for text-like controls (Input, Textarea, Select,
// Combobox, NumberInput, PinInput, TagInput). Every string is a literal so
// Tailwind sees it. Small and medium text reach 16px on touch screens and
// narrow viewports so iOS never zooms into a focused field.
export const fieldSizes = {
  small: 'h-7 px-2 text-xs max-md:text-base pointer-coarse:text-base rounded-sm',
  medium: 'h-9 px-3 text-sm max-md:text-base pointer-coarse:text-base rounded-md',
  large: 'h-12 px-4 text-base rounded-md',
  xlarge: 'h-14 px-5 text-lg rounded-md',
} as const

export const fieldVariants = {
  outline: 'border border-neutral bg-page shadow-[var(--shadow-outline),var(--shadow-field)]',
  faded: 'border border-transparent bg-neutral-faded',
  ghost: 'border border-transparent bg-transparent',
  headless: 'border-0 bg-transparent p-0 h-auto rounded-none',
} as const

export const fieldBase =
  'w-full text-neutral placeholder:text-neutral-faded transition-colors scroll-py-3 autofill:rounded-[inherit] ' +
  'focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1.5px_var(--border-primary),var(--shadow-outline)] ' +
  'disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled disabled:border-disabled ' +
  'aria-[invalid=true]:border-critical'

export type FieldSize = keyof typeof fieldSizes
export type FieldVariant = keyof typeof fieldVariants
