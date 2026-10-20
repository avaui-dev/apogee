import type { Media } from './spine.ts'

// Contact blocks share one content shape (the Contact section's props plus
// `locations` and `media`), so swapping one contact block for another keeps the copy. Each
// block defaults every field to its demo copy, ignores the fields it has no
// place for, and hides a part passed as `null`.

// The section's three icon names plus the chat/support glyphs the blocks use.
export type ContactIcon = 'mail' | 'phone' | 'map-pin' | 'message-circle' | 'messages-square' | 'life-buoy'
// The section's detail shape; `description` is the line under the label.
export type ContactDetail = { icon: ContactIcon; label: string; value: string; href?: string; description?: string }
// An office or store. `lat`/`lon` place it on a map; `hours` shows where a block has room.
export type ContactLocation = { name: string; address: string; lat: number; lon: number; hours?: string }

export type ContactContent = {
  /** @category content */
  eyebrow?: string | null
  /** Asterisks are dropped; contact blocks have no accent style. @category content */
  heading?: string
  /** @category content */
  description?: string | null
  /** Ways to reach you: email, phone, chat, office. @shape { icon: 'mail'|'phone'|'map-pin'|'message-circle'|'messages-square'|'life-buoy', label: string, value: string, href?: string, description?: string } @category content */
  details?: ContactDetail[] | null
  /** Offices or stores, shown as addresses, tabs or map pins. @shape { name: string, address: string, lat: number, lon: number, hours?: string } @category content */
  locations?: ContactLocation[] | null
  /** The photo beside or above the content. @category content */
  media?: Media | null
  /** Form target. @category content */
  action?: string
  /** @category content */
  method?: 'get' | 'post'
  /** @category content */
  submitLabel?: string
}
