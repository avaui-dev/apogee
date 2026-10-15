// scripts/tokens-table.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseTokens } from './tokens-table.mjs'

test('pairs light and dark values by name, in first-seen order', () => {
  const css = `@theme { --radius-md: 6px; }\n:root { --background-page: oklch(1 0 0); --on-primary: #fff; }\n[data-theme='dark'] { --background-page: oklch(0.2 0 0); }`
  assert.deepEqual(parseTokens(css), [
    { name: '--radius-md', light: '6px', dark: '—' },
    { name: '--background-page', light: 'oklch(1 0 0)', dark: 'oklch(0.2 0 0)' },
    { name: '--on-primary', light: '#fff', dark: '—' },
  ])
})

test('missing dark value renders a dash and a dark-only token keeps a dash on the light side', () => {
  assert.deepEqual(parseTokens(`[data-theme="dark"] { --x: 1; }`), [{ name: '--x', light: '—', dark: '1' }])
})

test('the real tokens file yields every generated colour role in both themes', () => {
  const rows = parseTokens(readFileSync(new URL('../registry/tokens/theme.css', import.meta.url), 'utf8'))
  const page = rows.find((r) => r.name === '--background-page')
  assert.ok(page && page.light !== '—' && page.dark !== '—')
  assert.ok(rows.length > 100)
})
