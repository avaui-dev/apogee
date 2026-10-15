import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { render } from './build-responsive.mjs'

test('the committed tables match the generator', () => {
  assert.equal(readFileSync(new URL('../registry/components/utils/responsive-tables.ts', import.meta.url), 'utf8'), render())
})

import { defs } from './build-responsive.mjs'

test('dialogPosition cells set every layout axis and the slide variables', () => {
  const positions = ['center', 'start', 'end', 'top', 'bottom', 'full-screen']
  assert.deepEqual(Object.keys(defs.dialogPosition), positions)
  for (const cell of Object.values(defs.dialogPosition)) {
    for (const re of [/\bm-(auto|0)\b/, /\[--apogee-dx:/, /\[--apogee-dy:/, /\[--apogee-scale:/, /\bmax-w-|\[max-width:/, /\bmax-h-|\[max-height:/, /\brounded-/, /\bborder(-0)?\b/])
      assert.match(cell, re)
  }
  assert.match(defs.dialogPosition.end, /\[--apogee-dx:100%\]/)
  // Drawers keep a backdrop strip on narrow screens.
  for (const side of ['start', 'end']) assert.match(defs.dialogPosition[side], /calc\(100%-1\.5rem\)/)
  assert.match(defs.dialogPosition.bottom, /\[--apogee-dy:100%\]/)
})

test('carouselItems cells set the item count variable', () => {
  assert.deepEqual(Object.keys(defs.carouselItems), ['1', '2', '3', '4', '5', '6'])
  assert.equal(defs.carouselItems[3], '[--apogee-items:3]')
})

test('stepsOrientation cells set the direction and the connector geometry', () => {
  assert.deepEqual(Object.keys(defs.stepsOrientation), ['vertical', 'horizontal'])
  for (const cell of Object.values(defs.stepsOrientation))
    for (const v of ['--steps-li', '--steps-cw', '--steps-ch', '--steps-ct', '--steps-cs']) assert.match(cell, new RegExp(`\\[${v}:`))
})
