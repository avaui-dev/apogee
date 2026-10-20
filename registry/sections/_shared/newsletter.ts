import type { Media } from './spine.ts'

// Newsletter blocks share one content shape (the CTA section's header plus the
// form's button label and `media`), so swapping one newsletter block for another
// keeps the copy. Each block defaults every field to its demo copy, ignores the
// fields it has no place for, and hides a part passed as `null`. The email field
// and the privacy line (it holds a link) stay in each block's markup.
export type NewsletterContent = {
  /** @category content */
  eyebrow?: string | null
  /** Asterisks are dropped; newsletter blocks have no accent style. @category content */
  heading?: string
  /** @category content */
  description?: string | null
  /** The subscribe button. @category content */
  submitLabel?: string
  /** The screenshot in the phone or browser frame. @category content */
  media?: Media | null
}
