import type { Action } from './spine.ts'

// One plan, the same shape the Pricing section takes. `period` is the bare unit
// ('mth', 'month'); each block adds its own '/' or 'per'. `badge` marks a plan
// (a pill, a banner or a call-out, per block); `featured` alone shows the
// block's default marker text.
export type PricingPlan = { name: string; price: string; annualPrice?: string; period?: string; annualPeriod?: string; description: string; features: string[]; action: Action; featured?: boolean; badge?: string }

// Pricing blocks share one content shape (the Pricing section's props), so
// swapping one pricing block for another keeps the copy. Each block defaults
// every field to its demo copy, ignores the fields it has no place for, and
// hides a part passed as `null`.
export type PricingContent = {
  /** @category content */
  eyebrow?: string | null
  /** Asterisks are dropped; pricing blocks have no accent style. @category content */
  heading?: string
  /** @category content */
  description?: string | null
  /** Landmark name when there is no heading. @category content */
  label?: string
  /** Name of the billing switch. @category content */
  periodLabel?: string
  /** Labels for the billing switch. @category content */
  periods?: { monthly: string; annual: string }
  /** Plans. @shape { name, price, annualPrice?, period?, annualPeriod?, description, features: string[], action: { label, href }, featured?: boolean, badge?: string } @category content */
  items?: PricingPlan[]
}
