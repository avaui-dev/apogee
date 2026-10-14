import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buttonStyles, buttonSizes } from './button.ts'

test('every variant covers every color with a hover state', () => {
  for (const [variant, colors] of Object.entries(buttonStyles)) {
    assert.deepEqual(Object.keys(colors), ['primary', 'neutral', 'critical', 'positive', 'warning'], variant)
    for (const cls of Object.values(colors)) assert.match(cls, /hover:bg-/, `${variant} hover`)
  }
})

test('sizes follow the 28/36/48/56 scale', () => {
  assert.match(buttonSizes.small, /\bh-7\b/)
  assert.match(buttonSizes.medium, /\bh-9\b/)
  assert.match(buttonSizes.large, /\bh-12\b/)
  assert.match(buttonSizes.xlarge, /\bh-14\b/)
})
