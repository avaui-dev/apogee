// The five hue inputs. Edit these; run `npm run build:tokens`.
//
// Accents take a Tailwind colour name (`'blue'` is the 600 step; `'blue-700'`
// picks a step from 400 to 700) or an OKLCH object `{ l, c, h }`.
// The neutral takes a Tailwind grey name (slate, gray, zinc, neutral, stone,
// mauve, olive, mist, taupe) whose tint colours every grey, or `{ l, c, h }`
// where `c` is the peak chroma at mid lightness (`c: 0` is pure grey).
// Names are listed in scripts/palettes.mjs.
export default {
  primary: 'blue-700',
  critical: 'red-600',
  warning: 'amber-400',
  positive: 'green-700',
  neutral: 'mist',
}
