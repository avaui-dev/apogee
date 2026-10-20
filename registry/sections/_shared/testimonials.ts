import type { Action } from './spine.ts'

// Testimonials blocks share one content shape with the Testimonials section, so
// swapping one block for another (or for the section) keeps the quotes. A block
// that shows one featured quote renders `items[0]`; each block ignores the item
// fields it has no place for and hides a part passed as `null` (or left out).
export type Testimonial = {
  quote: string
  name: string
  role?: string
  /** The person's photo; blocks with a large portrait use it too. */
  avatar?: string
  /** Stars out of 5. Left out, no stars show (never invent a rating). */
  rating?: number
  /** The person's company, shown as a logo or caption where the block has one. */
  company?: string
  /** A small label for the customer's field, e.g. "Retail and commerce". */
  industry?: string
}

export type TestimonialsContent = {
  /** @category content */
  eyebrow?: string | null
  /** @category content */
  heading?: string
  /** @category content */
  description?: string | null
  /** Accessible name for the quote carousel or tabs. @category content */
  label?: string
  /** Quotes. Single-quote blocks show the first. @shape { quote: string, name: string, role?: string, avatar?: string, rating?: number, company?: string, industry?: string } @category content */
  items?: Testimonial[]
  /** The solid button beside the heading. @category content */
  primaryAction?: Action | null
  /** The outline button beside the heading. @category content */
  secondaryAction?: Action | null
}
