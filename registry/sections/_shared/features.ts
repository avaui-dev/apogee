// Features blocks share one content shape with the Features section, so
// swapping one features block for another (or for the section) keeps the copy.
// Each block defaults every field to its demo copy, ignores the fields it has
// no place for, and hides a part passed as `null`.
import type { Media } from './spine.ts'

export type FeatureIcon = 'check' | 'zap' | 'shield' | 'globe' | 'sparkles' | 'layers' | 'lock' | 'rocket' | 'gauge' | 'heart'
// ponytail: blocks draw their own icons by position; `icon` is read by the Features section only.
export type FeatureItem = { icon?: FeatureIcon; title: string; description: string; href?: string; linkLabel?: string; media?: Media }

export type FeaturesContent = {
  /** @category content */
  eyebrow?: string | null
  /** @category content */
  heading?: string
  /** @category content */
  description?: string | null
  /** Landmark name when the block shows no heading. @category content */
  label?: string
  /** The features. An item's link shows when it has an `href`. @category content */
  items?: FeatureItem[]
  /** Text of item links without their own `linkLabel`. @category content */
  linkLabel?: string
  /** The main image or screenshot beside or under the features. @category content */
  media?: Media | null
}
