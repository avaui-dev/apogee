import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const index = JSON.parse(readFileSync(new URL('../registry/index.json', import.meta.url), 'utf8'))

test('utils pseudo-component ships its seventeen helpers and no tests', () => {
  assert.deepEqual(index.components.utils.files, ['utils/clipboard.ts', 'utils/fade.ts', 'utils/field.ts', 'utils/files.ts', 'utils/hotkey.ts', 'utils/icon.ts', 'utils/island.ts', 'utils/menu.ts', 'utils/panel.ts', 'utils/radius.ts', 'utils/responsive-tables.ts', 'utils/responsive.ts', 'utils/roving.ts', 'utils/scroll.ts', 'utils/table-enhance.ts', 'utils/theme.ts', 'utils/uid.ts'])
})

test('components importing a helper depend on utils', () => {
  assert.ok(index.components.Input.registryDependencies.includes('utils'))
  assert.ok(index.components.Tabs.registryDependencies.includes('utils'))
})

test('every entry carries its kind', () => {
  for (const [name, c] of Object.entries(index.components)) {
    assert.ok(['component', 'section', 'page'].includes(c.kind), `${name} has kind ${c.kind}`)
    if (c.kind === 'section') assert.ok(c.files.every((f) => f.startsWith('sections/')), `${name} files under sections/`)
    if (c.kind === 'page') assert.ok(c.files.every((f) => f.startsWith('pages/')), `${name} files under pages/`)
  }
})

test('pages are keyed by category/slug, carry a title and description, and depend on what they import', () => {
  const page = index.components['log-in/split-quote']
  assert.equal(page?.kind, 'page')
  assert.equal(page.category, 'log-in')
  assert.deepEqual(page.files, ['pages/log-in/SplitQuote.astro'])
  assert.equal(page.title, 'Split with quote')
  assert.ok(page.description.length > 10)
  for (const dep of ['AuthShell', 'Avatar', 'Rating', 'Input', 'Button']) assert.ok(page.registryDependencies.includes(dep), `depends on ${dep}`)
  for (const p of Object.values(index.components).filter((c) => c.kind === 'page')) assert.ok(p.title && p.description, `${p.name} has a title and description`)
})
