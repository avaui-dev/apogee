import type { Action, Media } from './spine.ts'

// Content blocks share one content shape (the Content section's props plus the
// article details: author, date, reading time, topics), so swapping one content
// block for another keeps the copy. Each block defaults every field to its demo
// copy, ignores the fields it has no place for, and hides a part passed as `null`.
// ponytail: long article and policy bodies stay in each block's markup (dev-owned).
export type Author = { name: string; role?: string }

export type ContentContent = {
  /** The small label or category above the heading. @category content */
  eyebrow?: string | null
  /** Asterisks are dropped; content blocks have no accent style. @category content */
  heading?: string
  /** The line under the heading. @category content */
  description?: string | null
  /** Landmark name when the block shows no heading. @category content */
  label?: string
  /** The solid button (the first of two equal buttons). @category content */
  primaryAction?: Action | null
  /** The outline button. @category content */
  secondaryAction?: Action | null
  /** The main photo beside or under the heading. @category content */
  media?: Media | null
  /** Who wrote it (or who is quoted). @shape { name: string, role?: string } @category content */
  author?: Author | null
  /** ISO date, e.g. `2026-01-20`. @category content */
  date?: string
  /** e.g. "8 min read". @category content */
  readingTime?: string | null
  /** Topic badges under the article. @category content */
  topics?: string[] | null
}
