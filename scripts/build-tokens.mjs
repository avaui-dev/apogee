#!/usr/bin/env node
// Generates the colour blocks of registry/tokens/theme.css from five hue inputs
// (scripts/hues.mjs). The derivation rules are credited in LICENSE.
// Everything outside the @generated markers is hand-written and untouched.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { contrast, formatOklch, toGamut } from './color.mjs'
import hues from './hues.mjs'

const WHITE = { l: 1, c: 0, h: 0, alpha: 1 }
const BLACK = { l: 0, c: 0, h: 0, alpha: 1 }

// Partly inverts lightness: greys invert fully, vibrant colours stay close.
function darkOf({ l, c, h }) {
  const vibrancyThreshold = 0.25
  const neutralFactor = Math.min(1, Math.max(0, (vibrancyThreshold - c) / vibrancyThreshold))
  const easedVibrancy = 1 - neutralFactor ** 2
  const inverted = 1 - l
  const darkL = inverted + (l - inverted) * easedVibrancy
  return { l: Math.max(0.32, darkL), c: c * 0.8, h, alpha: 1 }
}

// Moves a background's lightness `amount` of the way toward the foreground's side.
function toward(bg, fgL, amount) {
  if (fgL === bg.l) return bg
  const l = fgL > bg.l ? bg.l + (1 - bg.l) * amount : bg.l - bg.l * amount
  return { ...bg, l }
}

const onColor = (bg) => (contrast(WHITE, bg) > 4.5 ? WHITE : BLACK)

// Hover moves the fill toward the foreground side; when that would drop the
// on-colour under AA, move away from the on-colour instead (darker under white
// text, lighter under black) so hover never loses legibility.
function highlight(bg, fgL, amount, on) {
  const toFg = toward(bg, fgL, amount)
  if (contrast(on, toFg) >= 4.5) return toFg
  return toward(bg, on.l === 1 ? 0 : 1, amount)
}

export function generateHue(name, input) {
  const bg = toGamut({ alpha: 1, ...input })
  const neutral = name === 'neutral'
  const warning = name === 'warning'
  const bgDark = toGamut(darkOf(bg))

  const bgFaded = neutral
    ? { ...bg, l: 0, c: 0, alpha: 0.05 }
    : { ...bg, l: 0.98, c: Math.min(warning ? 0.04 : 0.02, bg.c / 5) }
  const bgFadedDark = neutral ? { ...bgDark, l: 1, alpha: 0.08 } : { ...bgDark, l: 0.24, c: bgDark.c / 9.8 }

  const fgL = neutral ? 0.24 : 0.52
  const fgDarkL = neutral ? 0.96 : 0.75
  const onLight = onColor(bg)
  const onDark = onColor(bgDark)
  const light = {
    [`background-${name}`]: bg,
    [`background-${name}-faded`]: bgFaded,
    [`background-${name}-highlighted`]: highlight(bg, fgL, neutral ? 0.03 : 0.1, onLight),
    [`background-${name}-faded-highlighted`]: neutral ? { l: 0, c: 0, h: 0, alpha: 0.1 } : { ...bg, alpha: 0.06 },
    [`border-${name}`]: neutral ? { ...bg, l: 0, alpha: 0.12 } : { ...bg, l: bg.l - 0.04 },
    [`border-${name}-faded`]: neutral ? { ...bgFaded, l: 0, alpha: 0.08 } : { ...bgFaded, l: bgFaded.l - 0.04 },
    [`foreground-${name}`]: { ...bg, l: fgL },
    [`on-${name}`]: onLight,
  }
  const dark = {
    [`background-${name}`]: bgDark,
    [`background-${name}-faded`]: bgFadedDark,
    [`background-${name}-highlighted`]: highlight(bgDark, fgDarkL, neutral ? 0.06 : 0.1, onDark),
    [`background-${name}-faded-highlighted`]: neutral ? { l: 1, c: 0, h: 0, alpha: 0.14 } : { ...bgDark, alpha: 0.08 },
    [`border-${name}`]: neutral ? { ...bgDark, l: 1, alpha: 0.12 } : { ...bgDark, l: bgDark.l + 0.1 },
    [`border-${name}-faded`]: neutral ? { ...bgFadedDark, l: 1, alpha: 0.08 } : { ...bgFadedDark, l: bgFadedDark.l + 0.06 },
    [`foreground-${name}`]: neutral ? { ...bgDark, l: fgDarkL } : { ...bgDark, l: fgDarkL, c: bg.c * 0.85 },
    [`on-${name}`]: onDark,
  }

  if (neutral) {
    const grey = (l, alpha = 1) => ({ l, c: 0, h: 0, alpha })
    Object.assign(light, {
      'foreground-neutral-faded': grey(fgL + 0.28),
      'background-disabled': grey(0.95),
      'background-disabled-faded': grey(0.98),
      'border-disabled': grey(0, 0.06),
      'foreground-disabled': grey(0.65),
      'background-elevation-base': grey(1),
      'background-elevation-raised': grey(1),
      'background-elevation-overlay': grey(1),
      'background-page': grey(1),
      'background-page-faded': grey(0.98),
      'background-inverted': grey(fgL),
      'on-inverted': grey(1),
    })
    Object.assign(dark, {
      'foreground-neutral-faded': grey(fgDarkL - 0.22),
      'background-disabled': grey(0.28),
      'background-disabled-faded': grey(0.225),
      'border-disabled': grey(1, 0.06),
      'foreground-disabled': grey(0.45),
      'background-elevation-base': grey(0.2),
      'background-elevation-raised': grey(0.22),
      'background-elevation-overlay': grey(0.24),
      'background-page': grey(0.16),
      'background-page-faded': grey(0.18),
      'background-inverted': grey(fgDarkL),
      'on-inverted': grey(0.16),
    })
  }
  const fit = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, toGamut(v)]))
  return { light: fit(light), dark: fit(dark) }
}

export function renderBlocks(input) {
  const light = []
  const dark = []
  for (const [name, hue] of Object.entries(input)) {
    const g = generateHue(name, hue)
    for (const [k, v] of Object.entries(g.light)) light.push(`  --${k}: ${formatOklch(v)};`)
    for (const [k, v] of Object.entries(g.dark)) dark.push(`  --${k}: ${formatOklch(v)};`)
  }
  return { light: light.join('\n'), dark: dark.join('\n') }
}

export function writeTheme(themePath, input) {
  const src = readFileSync(themePath, 'utf8')
  const { light, dark } = renderBlocks(input)
  const sub = (s, mode, body) => {
    // Match from the start marker to the end marker, whether the block is empty or filled.
    const re = new RegExp(`(/\\* @generated colors ${mode} start \\*/)[\\s\\S]*?(\\n  /\\* @generated colors ${mode} end \\*/)`)
    if (!re.test(s)) throw new Error(`markers for "${mode}" not found in ${themePath}`)
    return s.replace(re, `$1\n${body}$2`)
  }
  writeFileSync(themePath, sub(sub(src, 'light', light), 'dark', dark))
}

// Usage: build-tokens.mjs [theme.css] [hues.mjs]
// Defaults to this package's theme and hues; a consumer points it at their copy.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const themePath = resolve(process.argv[2] ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', 'registry', 'tokens', 'theme.css'))
  const input = process.argv[3] ? (await import(resolve(process.argv[3]))).default : hues
  writeTheme(themePath, input)
  console.log(`Wrote colour blocks to ${themePath}`)
}
