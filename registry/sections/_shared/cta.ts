import type { Action, Media } from './spine.ts'

// CTA blocks share one content shape (the CTA section's props plus `media`), so
// swapping one CTA block for another keeps the copy. Each block defaults every
// field to its demo copy, ignores the fields it has no place for, and hides a
// part passed as `null`.
export type CTAContent = {
  /** @category content */
  eyebrow?: string | null
  /** Asterisks are dropped; CTA blocks have no accent style. @category content */
  heading?: string
  /** @category content */
  description?: string | null
  /** The solid button (the first of two equal buttons). @category content */
  primaryAction?: Action | null
  /** The outline button. @category content */
  secondaryAction?: Action | null
  /** The photo or screenshot beside or under the copy. @category content */
  media?: Media | null
}
