import type { Action } from './spine.ts'

// Page header blocks share one content shape with the PageHeader section, so
// swapping one header block for another keeps the copy. Each block defaults
// every field to its demo copy, ignores the fields it has no place for, and
// hides a part passed as `null`.
export type PageHeaderContent = {
  /** @shape { label: string, href?: string }[] @category content */
  breadcrumbs?: { label: string; href?: string }[] | null
  /** @category content */
  eyebrow?: string | null
  /** @category content */
  heading?: string
  /** @category content */
  description?: string | null
  /** The solid button. @category content */
  primaryAction?: Action | null
  /** The outline button. @category content */
  secondaryAction?: Action | null
  /** Tab links under the title. @shape { label: string, href: string, active?: boolean }[] @category content */
  tabs?: { label: string; href: string; active?: boolean }[] | null
  /** Name of the tabs nav. @category content */
  tabsLabel?: string
}
