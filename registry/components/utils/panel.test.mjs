import { test } from 'node:test'
import assert from 'node:assert/strict'
import { placementArea, panelStyle, itemSizes, itemColors } from './panel.ts'

test('twelve placements map to position-area values', () => {
  assert.equal(Object.keys(placementArea).length, 12)
  assert.equal(placementArea['bottom-start'], 'block-end span-inline-end')
  assert.equal(placementArea['end-top'], 'inline-end span-block-end')
  assert.equal(placementArea.top, 'block-start')
})
test('panelStyle anchors, places, gaps and falls back', () => {
  const s = panelStyle({ anchor: '--apogee-pop-1', placement: 'bottom-start', gap: 2 })
  assert.match(s, /position-anchor: --apogee-pop-1;/)
  assert.match(s, /position-area: block-end span-inline-end;/)
  assert.match(s, /margin-block-start: calc\(var\(--spacing\) \* 2\);/)
  assert.match(s, /position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;/)
})
test('gap lands on the side facing the anchor', () => {
  assert.match(panelStyle({ anchor: '--a', placement: 'top' }), /margin-block-end:/)
  assert.match(panelStyle({ anchor: '--a', placement: 'start-top' }), /margin-inline-end:/)
  assert.match(panelStyle({ anchor: '--a', placement: 'end' }), /margin-inline-start:/)
})
test('width and maxHeight are optional', () => {
  const s = panelStyle({ anchor: '--a', width: 'trigger', maxHeight: '15rem' })
  assert.match(s, /width: anchor-size\(width\);/)
  assert.match(s, /max-height: 15rem;/)
  assert.match(panelStyle({ anchor: '--a', width: '20rem' }), /width: 20rem;/)
  assert.doesNotMatch(panelStyle({ anchor: '--a' }), /width|max-height/)
})
test('item tables are literal classes', () => {
  for (const t of [itemSizes, itemColors]) for (const v of Object.values(t)) assert.ok(typeof v === 'string' && v.length)
})
test('menu panels only set display while open (a bare display utility would keep a closed popover visible)', async () => {
  const { menuClass } = await import('./panel.ts')
  assert.doesNotMatch(` ${menuClass} `, / (flex|block|grid|inline-flex) /)
  assert.match(menuClass, /\[&:popover-open\]:flex/)
})
