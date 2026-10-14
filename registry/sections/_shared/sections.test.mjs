// Guards for the section contract: no raw HTML from editor text, a localisable
// landmark name on every heading-less section, UTC-stable dates.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = new URL('..', import.meta.url).pathname
const sections = readdirSync(dir).filter((d) => !d.startsWith('_')).map((d) => [d, readFileSync(join(dir, d, `${d}.astro`), 'utf8')])

test('no section renders editor text with set:html', () => {
  for (const [name, src] of sections) assert.ok(!src.includes('set:html'), `${name} uses set:html`)
})

test('every heading-less landmark name is a prop, not fixed English', () => {
  for (const [name, src] of sections) {
    for (const m of src.matchAll(/aria-label=\{heading \? undefined : ([^}]+)\}/g)) assert.match(m[1], /^label \?\? /, `${name}: ${m[0]}`)
    assert.ok(!/aria-label="[A-Z][a-z]/.test(src), `${name} has a fixed aria-label string`)
  }
})

test('formatDate is stable across time zones', async () => {
  process.env.TZ = 'America/Los_Angeles'
  const { formatDate } = await import('./date.ts')
  assert.equal(formatDate('2026-09-18', 'en', 'long'), 'September 18, 2026')
  assert.equal(formatDate('2026-09-18', 'en', 'short'), 'Sep 18, 2026')
})
