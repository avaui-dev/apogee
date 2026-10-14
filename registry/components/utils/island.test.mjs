import { test } from 'node:test'
import assert from 'node:assert/strict'

// Minimal DOM double: enough for island() to query, mark and listen.
const el = (ready = false) => ({ dataset: ready ? { apogeeReady: 'true' } : {} })
const listeners = {}
const nodes = [el(), el(true)] // the same elements on every query, as a real DOM would return
globalThis.document = {
  querySelectorAll: () => nodes,
  addEventListener: (type, fn) => (listeners[type] = fn),
}
const { island } = await import('./island.ts')

test('initialises unmarked roots once and re-runs on astro:page-load', () => {
  let calls = 0
  island('.x', () => calls++)
  assert.equal(calls, 1) // the pre-marked element is skipped
  listeners['astro:page-load']()
  assert.equal(calls, 1) // the same element is now marked
})
