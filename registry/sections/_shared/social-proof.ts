// Social-proof blocks share one content shape with LogoCloud's names, so
// swapping one block for another keeps the copy. Logos here are names; each
// block draws them as text (with a Lucide mark cycling by index where it has one).
export type SocialProofContent = {
  /** The line above the logos. @category content */
  heading?: string | null
  /** Accessible name of the logo list. @category content */
  label?: string
  /** Company or publication names, in order. @category content */
  logos?: string[] | null
}
