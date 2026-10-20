// Metrics blocks share one content shape with the Stats section, so swapping
// one metrics block for another (or for the section) keeps the copy. Each block
// defaults every field to its demo copy, ignores the fields it has no place
// for, and hides a part passed as `null`.
import type { Action, Media } from './spine.ts'

export type MetricItem = { value: string; label: string; description?: string }

export type MetricsContent = {
  /** @category content */
  eyebrow?: string | null
  /** @category content */
  heading?: string
  /** @category content */
  description?: string | null
  /** Landmark name when the block shows no heading. @category content */
  label?: string
  /** The figures. Blocks without room for a line ignore `description`. @category content */
  items?: MetricItem[]
  /** The solid button. @category content */
  primaryAction?: Action | null
  /** The outline button. @category content */
  secondaryAction?: Action | null
  /** The photo behind or beside the figures. @category content */
  media?: Media | null
}
