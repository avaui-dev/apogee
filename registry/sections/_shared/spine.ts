// The shared prop spine every section uses: the same names, the same unions,
// and the colour choices that keep text readable on each section background.
export type Align = 'start' | 'center'
export type Background = 'page' | 'neutral-faded' | 'primary-faded' | 'primary' | 'inverted'
export type Spacing = 'small' | 'medium' | 'large'
export type HeadingLevel = 1 | 2 | 3 | 4
export type Action = { label: string; href: string }
export type Media = { src: ImageMetadata | string; alt: string; width?: number; height?: number }

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
