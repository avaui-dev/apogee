#!/usr/bin/env node
// AA contrast gate for Apogee's semantic tokens.
//
// Reads the semantic mapping straight from registry/tokens/theme.css and the
// ramp values from Tailwind (OKLCH), resolves each pair, converts to sRGB,
// computes the WCAG contrast ratio, and exits non-zero on any AA miss.
// No dependencies — the colour math is inline (and self-checked at the bottom).

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// --- colour math ---------------------------------------------------------
const clamp01 = (x) => Math.min(1, Math.max(0, x))

function oklchToSrgb(L, C, H) {
  const h = (H * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  // linear -> sRGB gamma
  return lin.map((c) => {
    c = clamp01(c)
    return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
  })
}

function parseColor(str) {
  str = str.trim()
  const ok = str.match(/^oklch\(\s*([\d.]+)%?\s+([\d.]+|none)\s+([\d.]+|none)\s*\)$/i)
  if (ok) {
    const num = (v) => (v === 'none' ? 0 : Number(v))
    return oklchToSrgb(num(ok[1]) / 100, num(ok[2]), num(ok[3]))
  }
  const hex = str.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  }
  throw new Error(`unrecognised colour: ${str}`)
}

function luminance([r, g, b]) {
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a, b) {
  const la = luminance(parseColor(a))
  const lb = luminance(parseColor(b))
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// --- load tokens ---------------------------------------------------------
// Tailwind ramp: --color-<name>: oklch(...) | #hex
const twThemePath = resolve(root, 'playground/node_modules/tailwindcss/theme.css')
const ramp = {}
for (const m of readFileSync(twThemePath, 'utf8').matchAll(
  /--color-([\w-]+):\s*(oklch\([^)]+\)|#[0-9a-fA-F]+)/g,
)) {
  ramp[m[1]] = m[2]
}

// Semantic mapping from the token file, per theme (dark falls back to light).
const themeCss = readFileSync(resolve(root, 'registry/tokens/theme.css'), 'utf8')
const darkIdx = themeCss.indexOf('[data-theme="dark"] {')
const lightBlock = themeCss.slice(0, darkIdx)
const darkBlock = themeCss.slice(darkIdx, themeCss.indexOf('}', darkIdx))

function mapping(block) {
  const map = {}
  for (const m of block.matchAll(/--([\w-]+):\s*var\(--color-([\w-]+)\)/g)) {
    map[m[1]] = m[2] // semantic -> ramp key
  }
  return map
}
const light = mapping(lightBlock)
const dark = { ...mapping(lightBlock), ...mapping(darkBlock) } // dark overrides light

function color(theme, token) {
  const key = theme[token]
  if (!key) throw new Error(`no mapping for --${token}`)
  if (!ramp[key]) throw new Error(`no ramp value for --color-${key}`)
  return ramp[key]
}

// --- pairs to test -------------------------------------------------------
// AA: 4.5 for normal text, 3 for large text / focus indicator (WCAG 1.4.3 / 1.4.11).
// Decorative borders/dividers are exempt (1.4.11) and not tested.
const PAIRS = [
  ['foreground', 'background', 4.5, 'body text'],
  ['foreground', 'surface', 4.5, 'text on surface'],
  ['muted-foreground', 'background', 4.5, 'muted text'],
  ['muted-foreground', 'muted', 4.5, 'muted text on muted fill'],
  ['accent', 'background', 4.5, 'link / accent text'],
  ['accent-foreground', 'accent', 4.5, 'text on accent fill'],
  ['danger-foreground', 'danger', 4.5, 'text on danger fill'],
  ['success-foreground', 'success', 4.5, 'text on success fill'],
  ['warning-foreground', 'warning', 4.5, 'text on warning fill'],
  ['ring', 'background', 3, 'focus ring'],
]

let failed = 0
const rows = []
for (const theme of [
  ['light', light],
  ['dark', dark],
]) {
  for (const [fg, bg, min, label] of PAIRS) {
    const ratio = contrast(color(theme[1], fg), color(theme[1], bg))
    const pass = ratio >= min
    if (!pass) failed++
    rows.push({
      theme: theme[0],
      pair: `${fg} / ${bg}`,
      label,
      ratio: ratio.toFixed(2),
      min,
      status: pass ? 'PASS' : 'FAIL',
    })
  }
}

console.table(rows)
if (failed) {
  console.error(`\n✖ ${failed} contrast pair(s) below AA.`)
  process.exit(1)
}
console.log('\n✓ All semantic pairs meet AA.')

// --- self-check ----------------------------------------------------------
const approx = (a, b) => Math.abs(a - b) < 0.01
if (!approx(contrast('#000', '#fff'), 21)) throw new Error('self-check: black/white != 21')
if (!approx(contrast('#fff', '#fff'), 1)) throw new Error('self-check: white/white != 1')
