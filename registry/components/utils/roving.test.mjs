import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stepIndex } from './roving.ts'

test('stepIndex wraps both ways, mirrors in RTL, jumps with Home/End and ignores other keys', () => {
  assert.equal(stepIndex('ArrowRight', 2, 2), 0)
  assert.equal(stepIndex('ArrowLeft', 0, 2), 2)
  assert.equal(stepIndex('ArrowRight', 1, 2), 2)
  assert.equal(stepIndex('ArrowRight', 1, 2, true), 0)
  assert.equal(stepIndex('ArrowLeft', 1, 2, true), 2)
  assert.equal(stepIndex('Home', 3, 4), 0)
  assert.equal(stepIndex('End', 0, 4), 4)
  assert.equal(stepIndex('a', 1, 4), null)
  assert.equal(stepIndex('ArrowDown', 1, 4), null)
})

import { rovingTabindex } from './roving.ts'
test('rovingTabindex is exported for DOM consumers', () => {
  assert.equal(typeof rovingTabindex, 'function')
})

test('stepIndex in a vertical row maps Up/Down and ignores Left/Right', () => {
  assert.equal(stepIndex('ArrowDown', 0, 2, false, 'vertical'), 1)
  assert.equal(stepIndex('ArrowUp', 0, 2, false, 'vertical'), 2)
  assert.equal(stepIndex('ArrowRight', 0, 2, false, 'vertical'), null)
  assert.equal(stepIndex('ArrowDown', 0, 2), null)
})
