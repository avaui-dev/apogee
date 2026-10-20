import type { Action } from './spine.ts'

// Banner blocks share one content shape with the Banner section, so swapping
// one banner block for another keeps the copy. Each block defaults every field
// to its demo copy, ignores the fields it has no place for, and hides a part
// passed as `null`.
export type BannerContent = {
  /** The one-line message. Asterisks are dropped; banner blocks have no accent style. @category content */
  heading?: string
  /** The quieter line. In blocks with a link, *asterisks* mark the linked words; other blocks drop them. @category content */
  description?: string | null
  /** Where the *starred* words in `description` link to; `null` leaves them as plain text. @category content */
  linkHref?: string | null
  /** The one link button. @category content */
  primaryAction?: Action | null
  /** The email form's button. @category content */
  submitLabel?: string
  /** The close button's accessible name. @category content */
  closeLabel?: string
}
