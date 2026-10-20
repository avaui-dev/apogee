// Blog blocks share one content shape with the BlogList section, so swapping one
// blog block for another (or for BlogList) keeps the copy. Each block defaults
// every field to its demo copy, ignores the fields it has no place for, and
// hides a part passed as `null`.
import type { Action, Media } from './spine.ts'

type Link = { name: string; href?: string }

// BlogList's post shape (`title`, `excerpt`, `href`, `image`, `date`, `author`),
// plus the optional card details the blocks show: reading time, category, tags,
// an author link.
export type Post = {
  title: string
  excerpt: string
  href: string
  image?: Media
  /** ISO date, e.g. `2026-01-20`. */
  date: string
  author?: Link & { avatar?: string }
  readingTime?: string
  category?: Link
  tags?: (Link & { color?: 'primary' | 'neutral' | 'critical' | 'positive' | 'warning' })[]
}

// A category filter tab: `value` names the tab, `href` is its page.
export type Category = { label: string; value: string; href: string }

export type BlogContent = {
  /** @category content */
  eyebrow?: string | null
  /** @category content */
  heading?: string
  /** @category content */
  description?: string | null
  /** Posts. `date` is an ISO date string. @shape { title: string, excerpt: string, href: string, image?: { src, alt }, date: string, author?: { name: string, href?: string, avatar?: string }, readingTime?: string, category?: { name, href? }, tags?: { name, href?, color? }[] } @category content */
  items?: Post[]
  /** Date locale; defaults to the page locale. @category content */
  locale?: string
  /** The category filter. @shape { label: string, value: string, href: string }[] @category content */
  categories?: Category[] | null
  /** The solid button, e.g. View all posts. @category content */
  primaryAction?: Action | null
  /** The outline button, e.g. Load more. @category content */
  secondaryAction?: Action | null
}

// A blog post as PostCard reads it (`excerpt` is PostCard's `summary`).
export const toCard = ({ excerpt, ...post }: Post) => ({ ...post, summary: excerpt })
