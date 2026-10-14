import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const index = JSON.parse(readFileSync(new URL('../registry/index.json', import.meta.url), 'utf8'))

test('utils pseudo-component ships its six helpers and no tests', () => {
  assert.deepEqual(index.components.utils.files, ['utils/field.ts', 'utils/island.ts', 'utils/radius.ts', 'utils/responsive-tables.ts', 'utils/responsive.ts', 'utils/uid.ts'])
})

test('components importing a helper depend on utils', () => {
  assert.ok(index.components.Input.registryDependencies.includes('utils'))
  assert.ok(index.components.Tabs.registryDependencies.includes('utils'))
})

test('every entry carries its kind', () => {
  for (const [name, c] of Object.entries(index.components)) {
    assert.ok(c.kind === 'component' || c.kind === 'section', `${name} has kind ${c.kind}`)
    if (c.kind === 'section') assert.ok(c.files.every((f) => f.startsWith('sections/')), `${name} files under sections/`)
  }
})
