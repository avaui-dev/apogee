import { test } from 'node:test'
import assert from 'node:assert/strict'
import { innerRadius } from './radius.ts'

test('every inner radius subtracts the tray padding from a radius token', () => {
  for (const [key, cls] of Object.entries(innerRadius)) {
    const [token, pad] = key.split('-')
    assert.match(cls, new RegExp(`^rounded-\\[calc\\(var\\(--radius-${token}\\)-${Number(pad) * 0.25}rem\\)\\]$`))
  }
})
