import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contrast, parseColor, composite, formatOklch, oklchToSrgb } from './color.mjs'

const approx = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`)

test('black on white is 21, white on white is 1', () => {
  approx(contrast('#000', '#fff'), 21)
  approx(contrast('#fff', '#fff'), 1)
})

test('parses oklch with and without alpha', () => {
  assert.deepEqual(parseColor('oklch(0.47 0.2 262)'), { l: 0.47, c: 0.2, h: 262, alpha: 1 })
  assert.deepEqual(parseColor('oklch(0 0 0 / 0.03)'), { l: 0, c: 0, h: 0, alpha: 0.03 })
})

test('composite blends alpha over an opaque background', () => {
  const over = composite({ l: 0, c: 0, h: 0, alpha: 0.5 }, { l: 1, c: 0, h: 0 })
  approx(over.l, 0.6, 0.02) // sRGB 0.5 grey (browser compositing is in gamma space) is OKLCH L ≈ 0.598
  assert.equal(over.alpha, 1)
})

test('formatOklch rounds to 4 places and omits alpha 1', () => {
  assert.equal(formatOklch({ l: 0.47, c: 0.2, h: 262.6667, alpha: 1 }), 'oklch(0.47 0.2 262.6667)')
  assert.equal(formatOklch({ l: 0, c: 0, h: 0, alpha: 0.03 }), 'oklch(0 0 0 / 0.03)')
})

test('oklchToSrgb clamps and converts white', () => {
  const [r, g, b] = oklchToSrgb({ l: 1, c: 0, h: 0 })
  approx(r, 1)
  approx(g, 1)
  approx(b, 1)
})
