import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fadeState, fadeStateY } from './fade.ts'

test('fadeState names the hidden sides, RTL included', () => {
  assert.equal(fadeState(0, 100, 100, false), '')
  assert.equal(fadeState(0, 300, 100, false), 'right')
  assert.equal(fadeState(100, 300, 100, false), 'left right')
  assert.equal(fadeState(200, 300, 100, false), 'left')
  assert.equal(fadeState(0, 300, 100, true), 'left')
  assert.equal(fadeState(-200, 300, 100, true), 'right')
})
test('fadeStateY names the hidden top and bottom', () => {
  assert.equal(fadeStateY(0, 100, 100), '')
  assert.equal(fadeStateY(0, 300, 100), 'bottom')
  assert.equal(fadeStateY(100, 300, 100), 'top bottom')
  assert.equal(fadeStateY(200, 300, 100), 'top')
})
