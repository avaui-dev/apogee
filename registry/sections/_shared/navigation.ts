// Header navigation blocks share one content shape, so swapping one navigation
// block for another keeps the bar's copy. Each block defaults every field to
// its demo copy, ignores the fields it has no place for, and hides a part
// passed as `null`.
import type { Action, Media } from './spine.ts'

// A link inside a menu panel. `media` turns it into a preview card (blog post, video).
export type NavItem = { label: string; href: string; description?: string; badge?: string; media?: Media }
export type NavGroup = { heading?: string; items: NavItem[] }
// A top-level entry that opens a panel. Each block lays the groups out its own
// way (columns, a sidebar, a row of previews); its demo defaults show how many it expects.
export type NavMenu = { label: string; groups: NavGroup[] }

export type NavigationContent = {
  /** The site name beside the logo. @category content */
  brand?: string
  /** The bar's entries in order: a link `{ label, href }` or a menu `{ label, groups }`. @shape ({ label: string, href: string } | { label: string, groups: { heading?: string, items: { label: string, href: string, description?: string, badge?: string, media?: Media }[] }[] })[] @category content */
  links?: (Action | NavMenu)[]
  /** The solid button. @category content */
  primaryAction?: Action | null
  /** The outline button. @category content */
  secondaryAction?: Action | null
}
