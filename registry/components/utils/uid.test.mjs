import { test } from 'node:test'
import assert from 'node:assert/strict'
import { uid } from './uid.ts'

test('counts per key and restarts for a new key', () => {
  const a = {}
  const b = {}
  assert.equal(uid(a), 'apogee-1')
  assert.equal(uid(a), 'apogee-2')
  assert.equal(uid(b), 'apogee-1')
  assert.equal(uid(a, 'tab'), 'tab-3')
})

test('falls back to a module counter without a key', () => {
  assert.match(uid(undefined), /^apogee-\d+$/)
})
