#!/usr/bin/env node
// AA contrast gate for Apogee's generated colour tokens.
//
// Reads both @generated blocks of registry/tokens/theme.css, composites alpha
// surfaces over the page colour (and alpha foregrounds over that surface), derives every text/fill and focus pair for
// every hue and mode, and exits non-zero on any AA miss.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { contrast, parseColor, composite } from './color.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// --- self-check ----------------------------------------------------------
const approx = (a, b) => Math.abs(a - b) < 0.01
if (!approx(contrast('#000', '#fff'), 21)) throw new Error('self-check: black/white != 21')
if (!approx(contrast('#fff', '#fff'), 1)) throw new Error('self-check: white/white != 1')

// --- load tokens ---------------------------------------------------------
// Usage: check-contrast.mjs [theme.css]  (defaults to this package's theme)
const css = readFileSync(resolve(process.argv[2] ?? resolve(root, 'registry/tokens/theme.css')), 'utf8')
const block = (mode) => {
  const m = css.match(new RegExp(`@generated colors ${mode} start \\*/([\\s\\S]*?)/\\* @generated colors ${mode} end`))
  if (!m) throw new Error(`no generated block for ${mode}`)
  const vars = {}
  for (const d of m[1].matchAll(/--([\w-]+):\s*(oklch\([^)]+\))/g)) vars[d[1]] = parseColor(d[2])
  if (!Object.keys(vars).length) throw new Error(`generated block for ${mode} is empty — run npm run build:tokens`)
  return vars
}

// --- derived pairs -------------------------------------------------------
// AA: 4.5 for normal text, 3 for the focus indicator (WCAG 1.4.3 / 1.4.11).
const HUES = ['primary', 'neutral', 'critical', 'positive', 'warning']
const rows = []
let failed = 0
for (const mode of ['light', 'dark']) {
  const v = block(mode)
  const page = v['background-page']
  const over = (name) => composite(v[name], page)
  const check = (fg, bg, min, label) => {
    if (!v[fg] || !v[bg]) throw new Error(`missing token --${fg} or --${bg} in ${mode}`)
    const back = over(bg)
    const ratio = contrast(composite(v[fg], back), back)
    const pass = ratio >= min
    if (!pass) failed++
    rows.push({ mode, pair: `${fg} / ${bg}`, label, ratio: ratio.toFixed(2), min, status: pass ? 'PASS' : 'FAIL' })
  }
  for (const h of HUES) {
    check(`foreground-${h}`, 'background-page', 4.5, 'coloured text on page')
    check(`foreground-${h}`, 'background-elevation-raised', 4.5, 'coloured text on raised')
    check(`foreground-${h}`, `background-${h}-faded`, 4.5, 'coloured text on its tint')
    check(`on-${h}`, `background-${h}`, 4.5, 'text on fill')
    check(`on-${h}`, `background-${h}-highlighted`, 4.5, 'text on hovered fill')
    check('foreground-neutral-faded', `background-${h}-faded`, 4.5, 'secondary text on a tint (Alert body)')
  }
  check('foreground-neutral-faded', 'background-page', 4.5, 'secondary text')
  check('foreground-neutral-faded', 'background-neutral-faded', 4.5, 'secondary text on muted fill')
  check('foreground-neutral', 'background-neutral', 4.5, 'text on neutral button')
  check('on-inverted', 'background-inverted', 4.5, 'tooltip text')
  check('border-primary', 'background-page', 3, 'focus ring')
  for (const e of ['base', 'raised', 'overlay']) check('foreground-neutral', `background-elevation-${e}`, 4.5, `body text on ${e}`)
}

console.table(rows)
if (failed) {
  console.error(`\n✖ ${failed} contrast pair(s) below AA.`)
  process.exit(1)
}
console.log('\n✓ All derived pairs meet AA.')
