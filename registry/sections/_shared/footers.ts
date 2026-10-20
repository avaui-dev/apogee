// Footer blocks share one content shape, so swapping one footer block for another
// keeps the copy. Names and item shapes follow FooterSection (`columns`,
// `copyright`, `social`, `navLabel`). Each block defaults every field to its demo
// copy, ignores the fields it has no place for, and hides a part passed as `null`.
import { AtSign, Camera, Code, Globe, Mail, MessageCircle, Rss, Share2, Users, Video } from '@lucide/astro'
import type { Action } from './spine.ts'

// A footer link; `badge` is a small tag after it (e.g. "New").
export type FooterLink = Action & { badge?: string }
export type FooterColumn = { heading: string; links: FooterLink[] }
// FooterSection's icon names plus users, camera, video and code.
export type SocialIcon = 'mail' | 'globe' | 'rss' | 'at-sign' | 'share' | 'message' | 'users' | 'camera' | 'video' | 'code'
export type SocialLink = { label: string; href: string; icon: SocialIcon }

// ponytail: generic glyphs only (the icon set ships no brand marks); a block that needs a brand logo swaps its own SVG in.
export const socialIcons = { mail: Mail, globe: Globe, rss: Rss, 'at-sign': AtSign, share: Share2, message: MessageCircle, users: Users, camera: Camera, video: Video, code: Code } as const satisfies Record<SocialIcon, unknown>

export type FooterContent = {
  /** The name in the logo or wordmark. @category content */
  brand?: string
  /** A short line about the company. Wrap words in *asterisks* to accent them where the block styles an accent. @category content */
  tagline?: string | null
  /** A call to action above or beside the links. Wrap words in *asterisks* to accent them. @category content */
  heading?: string | null
  /** @category content */
  description?: string | null
  /** The solid button. @category content */
  primaryAction?: Action | null
  /** The outline button. @category content */
  secondaryAction?: Action | null
  /** The label or heading over the email signup. @category content */
  newsletterHeading?: string | null
  /** @category content */
  newsletterDescription?: string | null
  /** The signup button. @category content */
  submitLabel?: string
  /** Link groups. Blocks with one flat row of links show every column's links in that row. @shape { heading: string, links: { label: string, href: string, badge?: string }[] }[] @category content */
  columns?: FooterColumn[]
  /** Name of the flat link row's nav. @category content */
  navLabel?: string
  /** @category content */
  copyright?: string | null
  /** Small links beside the copyright (terms, privacy). @category content */
  legal?: Action[] | null
  /** Icon links. @shape { label: string, href: string, icon: 'mail'|'globe'|'rss'|'at-sign'|'share'|'message'|'users'|'camera'|'video'|'code' }[] @category content */
  social?: SocialLink[] | null
}
