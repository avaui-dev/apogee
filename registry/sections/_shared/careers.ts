// Careers blocks share one content shape, so swapping one careers block for
// another keeps the open positions. Each block defaults every field to its demo
// copy, ignores the fields it has no place for, and hides a part passed as `null`
// (or an item field left out).
import type { Media } from './spine.ts'

// One open position, as JobCard reads it. `department` groups and filters jobs;
// `badge` is the status tag beside the title.
export type Job = {
  title: string
  href: string
  description?: string
  department?: string
  location?: string
  type?: string
  salary?: string
  badge?: { label: string; color?: 'primary' | 'neutral' | 'critical' | 'positive' | 'warning' }
}

// A department filter tab. The first tab shows every job; each other tab shows
// the jobs whose department, slugged, equals its `value` (`Customer Success` → `customer-success`).
export type Category = { label: string; value: string }

export type CareersContent = {
  /** @category content */
  eyebrow?: string | null
  /** @category content */
  heading?: string
  /** @category content */
  description?: string | null
  /** Open positions. @shape { title: string, href: string, description?: string, department?: string, location?: string, type?: string, salary?: string, badge?: { label: string, color?: 'primary' | 'neutral' | 'critical' | 'positive' | 'warning' } } @category content */
  items?: Job[]
  /** Department filter tabs; defaults to "View all" plus each department in `items`. @shape { label: string, value: string }[] @category content */
  categories?: Category[] | null
  /** The photo beside or above the list. @category content */
  media?: Media | null
}

// "Customer Success" → "customer-success", the tab value for a department.
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
