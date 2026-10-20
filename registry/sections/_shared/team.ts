// Team blocks share one content shape with the Team section, so swapping one
// team block for another (or for the section) keeps the people. Each block
// defaults every field to its demo copy, ignores the fields it has no place
// for, and hides a part passed as `null` (or an item field left out).
import type { Action } from './spine.ts'

// `label` on a link is its accessible name ("Maya's website"); icon-only blocks
// draw their own icons by position, the Team section shows the label as text.
export type TeamLink = { label: string; href: string }
export type TeamMember = { name: string; role: string; avatar?: string; bio?: string; links?: TeamLink[] }

export type TeamContent = {
  /** @category content */
  eyebrow?: string | null
  /** @category content */
  heading?: string
  /** @category content */
  description?: string | null
  /** Accessible name for the landmark or the people carousel. @category content */
  label?: string
  /** People. @shape { name: string, role: string, avatar?: string, bio?: string, links?: { label: string, href: string }[] } @category content */
  items?: TeamMember[]
  /** The solid button by the heading. @category content */
  primaryAction?: Action | null
  /** The outline button by the heading. @category content */
  secondaryAction?: Action | null
}
