import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { render } from './build-responsive.mjs'

test('the committed tables match the generator', () => {
  assert.equal(readFileSync(new URL('../registry/components/utils/responsive-tables.ts', import.meta.url), 'utf8'), render())
})
