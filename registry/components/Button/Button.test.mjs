import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buttonStyles, buttonSizes, pressedStyles } from './button.ts'

test('every variant covers every color with a hover state', () => {
  for (const [variant, colors] of Object.entries(buttonStyles)) {
    assert.deepEqual(Object.keys(colors), ['primary', 'neutral', 'critical', 'positive', 'warning'], variant)
    // Boxed variants hover their fill (outline tints its solid fill); `link` hovers its underline.
    const hover = variant === 'link' ? /hover:underline/ : variant === 'outline' ? /hover:\[--apogee-tint:var\(--background-\w+-faded-highlighted\)\]/ : /hover:bg-/
    for (const cls of Object.values(colors)) assert.match(cls, hover, `${variant} hover`)
  }
})

test('outline buttons sit on a solid page fill', () => {
  for (const cls of Object.values(buttonStyles.outline)) {
    assert.match(cls, /\bbg-page\b/)
    assert.doesNotMatch(cls, /hover:bg-/)
  }
})

test('every size squares itself under data-icon-only', () => {
  for (const cls of Object.values(buttonSizes)) assert.match(cls, /data-icon-only:w-\d+ data-icon-only:px-0/)
})

test('sizes follow the 28/36/48/56 scale', () => {
  assert.match(buttonSizes.small, /\bh-7\b/)
  assert.match(buttonSizes.medium, /\bh-9\b/)
  assert.match(buttonSizes.large, /\bh-12\b/)
  assert.match(buttonSizes.xlarge, /\bh-14\b/)
})

test('pressed styles cover solid and faded for every color, prefixed for aria-pressed', () => {
  assert.deepEqual(Object.keys(pressedStyles), ['solid', 'faded'])
  for (const [variant, colors] of Object.entries(pressedStyles)) {
    assert.deepEqual(Object.keys(colors), ['primary', 'neutral', 'critical', 'positive', 'warning'], variant)
    for (const cls of Object.values(colors)) assert.match(cls, /^aria-pressed:bg-\S+ aria-pressed:text-\S+ aria-pressed:hover:bg-\S+ aria-pressed:\[&>svg\]:opacity-100 aria-pressed:shadow-\(--shadow-control\)$/)
  }
})
