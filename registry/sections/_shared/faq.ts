import type { Action } from './spine.ts'

// FAQ blocks share one content shape (the FAQ section's props plus the contact
// action), so swapping one FAQ block for another keeps the copy. Each block
// defaults every field to its demo copy, ignores the fields it has no place for,
// and hides a part passed as `null`.
export type FAQItem = { question: string; answer: string }
export type FAQContent = {
  /** @category content */
  eyebrow?: string | null
  /** Asterisks are dropped; FAQ blocks have no accent style. @category content */
  heading?: string
  /** Where a block links its description, *asterisks* mark the link text, which points at `primaryAction.href`. @category content */
  description?: string | null
  /** Landmark name when there is no heading. @category content */
  label?: string
  /** Questions. @shape { question: string, answer: string } @category content */
  items?: FAQItem[]
  /** The contact button (and the description link's target). @category content */
  primaryAction?: Action | null
}
