// The shared prop spine every section uses: the same names, the same unions,
// and the colour choices that keep text readable on each section background.
export type Align = 'start' | 'center'
export type Background = 'page' | 'neutral-faded' | 'primary-faded' | 'primary' | 'inverted'
export type Spacing = 'small' | 'medium' | 'large'
export type HeadingLevel = 1 | 2 | 3 | 4
export type Action = { label: string; href: string }
// `srcDark` is an optional dark-mode version (a screenshot in a DeviceFrame swaps to it).
export type Media = { src: ImageMetadata | string; srcDark?: ImageMetadata | string; alt: string; width?: number; height?: number }

// A plain <img> needs a URL; an imported image (ImageMetadata) carries it in `.src`.
export const srcUrl = (src: ImageMetadata | string) => (typeof src === 'string' ? src : src.src)

// What goes on each background. Solid fills set the on-colour on the Section,
// so headings and body inherit it; eyebrow and buttons need explicit choices.
// ponytail: on solid fills the secondary button borrows the current text colour
// (outline + border-current); replace with a Button colour for fills when one exists.
const onFill = { variant: 'outline', color: 'neutral', class: 'border-current! text-inherit! shadow-none!' } as const
export const onBackground = {
  page: { eyebrow: 'primary', text: 'neutral-faded', primary: { variant: 'solid', color: 'primary' }, secondary: { variant: 'outline', color: 'neutral' }, muted: 'text-neutral-faded', card: 'elevation-raised' },
  'neutral-faded': { eyebrow: 'primary', text: 'neutral-faded', primary: { variant: 'solid', color: 'primary' }, secondary: { variant: 'outline', color: 'neutral' }, muted: 'text-neutral-faded', card: 'elevation-raised' },
  'primary-faded': { eyebrow: 'primary', text: 'neutral-faded', primary: { variant: 'solid', color: 'primary' }, secondary: { variant: 'outline', color: 'neutral' }, muted: 'text-neutral-faded', card: 'page' },
  primary: { eyebrow: 'inherit', text: 'inherit', primary: { variant: 'solid', color: 'neutral' }, secondary: onFill, muted: 'opacity-80', card: 'page' },
  inverted: { eyebrow: 'inherit', text: 'inherit', primary: { variant: 'solid', color: 'neutral' }, secondary: onFill, muted: 'opacity-80', card: 'page' },
} as const

export const sectionSpacing = { small: 'small', medium: 'medium', large: 'large' } as const

// Hero blocks share one content shape, so swapping one hero block for another
// keeps the copy. Each block defaults every field to its demo copy, ignores the
// fields it has no place for, and hides a part passed as `null`.
export type Announcement = { label: string; href: string; badge?: string }
export type HeroContent = {
  /** A pill link above the heading; `badge` is the tag inside it. @category content */
  announcement?: Announcement | null
  /** @category content */
  eyebrow?: string | null
  /** Wrap words in *asterisks* to accent them; each block styles the accent its own way. @category content */
  heading?: string
  /** @category content */
  description?: string | null
  /** The solid button. @category content */
  primaryAction?: Action | null
  /** The outline button. @category content */
  secondaryAction?: Action | null
  /** The hero image. @category content */
  media?: Media | null
}

// A heading in a block with no accent style: drop the *asterisks*.
export const plain = (text: string) => text.replaceAll('*', '')

// "We design *digital experiences* that…" → plain and accented runs.
export const accentRuns = (text: string) => text.split('*').map((text, i) => ({ text, accent: i % 2 === 1 }))
