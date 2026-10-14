
// scripts/check-docs.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { propsOf, checkPage } from './check-docs.mjs'

const full = (extra = '') => `---
title: Thing
group: Components
related: [button]
---
import JsNote from '../../components/JsNote.astro'
<JsNote>x</JsNote>
## Add
## Usage
## API
| Prop | Type |
|---|---|
| \`size\` | \`'small' \\| 'large'\` |
## States
## Examples
<Preview code={\`<Thing size="small" /><Thing size="large" />\`}>
</Preview>
## Accessibility
## Tokens
## Do / Don't
## Content
${extra}`

const thing = (doc, over = {}) => ({
  name: 'Thing', doc, usesJs: true, ids: new Set(['button', 'thing']),
  files: [{ sub: 'Thing', props: [{ name: 'size', values: ['small', 'large'] }] }],
  ...over,
})

test('a complete page has no findings', () => {
  assert.deepEqual(checkPage(thing(full())), [])
})

test('missing required sections are named; Anatomy and Variants are optional', () => {
  const doc = full().replace('## States\n', '')
  assert.deepEqual(checkPage(thing(doc)), ['missing section States'])
})

test('layout primitives skip States, Examples, Do / Don\'t and Content', () => {
  const doc = full().replace('## States\n', '').replace("## Do / Don't\n", '').replace('## Content\n', '')
  assert.deepEqual(checkPage(thing(doc, { name: 'Stack' })), [])
})

test('standard sections out of order are reported', () => {
  const doc = full().replace('## API\n| Prop | Type |\n|---|---|\n| `size` | `\'small\' \\| \'large\'` |\n', '').replace('## Accessibility\n', "## Accessibility\n## API\n| `size` | x |\n")
  assert.deepEqual(checkPage(thing(doc)), ['sections out of order: Accessibility before API'])
})

test('every prop needs an API row', () => {
  const page = thing(full(), { files: [{ sub: 'Thing', props: [{ name: 'size', values: [] }, { name: 'tone', values: [] }] }] })
  assert.deepEqual(checkPage(page), ['no API row for Thing.tone'])
})

test('enum value outside a Preview is not covered', () => {
  const doc = full().replace('<Thing size="large" />', '') + '\nUse `size="large"` for banners.\n' + '`'.repeat(3) + 'astro\n<Thing size="large" />\n' + '`'.repeat(3) + '\n'
  assert.deepEqual(checkPage(thing(doc)), ['Thing.size value "large" not demoed in a <Preview>'])
})

test('object-form and quoted values inside a Preview count', () => {
  const doc = full().replace('<Thing size="large" />', "<Thing size={{ base: 'large' }} />")
  assert.deepEqual(checkPage(thing(doc)), [])
})

test('allowlisted enums are not checked', () => {
  const page = thing(full(), { name: 'Image', files: [{ sub: 'Image', props: [{ name: 'quality', values: ['low', 'max'] }] }] })
  assert.deepEqual(checkPage({ ...page, doc: page.doc.replace('| `size` |', '| `quality` |') }), [])
})

test('island pages need a JsNote', () => {
  assert.deepEqual(checkPage(thing(full().replace('<JsNote>x</JsNote>', ''))), ['island without <JsNote>'])
})

test('related ids must be component pages that exist', () => {
  assert.deepEqual(checkPage(thing(full().replace('related: [button]', 'related: [buttton]'))), ['related: "buttton" is not a component page'])
  assert.deepEqual(checkPage(thing(full().replace('related: [button]\n', ''))), ['related: missing'])
})

test('propsOf reads union literals, local tables and imported tables', () => {
  const button = `---\nexport const buttonSizes = {\n  small: 'h-8',\n  medium: 'h-9',\n} as const\n---`
  const src = `---
import { buttonSizes } from '../Button/Button.astro'
const tones = {
  neutral: 'x',
  critical: 'y',
} as const
interface Props extends HTMLAttributes<'button'> {
  size?: keyof typeof buttonSizes
  tone?: keyof typeof tones
  shape?: 'round' | 'square'
  on?: boolean
  class?: string
  width?:
    | number
    | string
}
---`
  const props = propsOf(src, (spec) => (spec.endsWith('Button.astro') ? button : null))
  assert.deepEqual(props, [
    { name: 'size', values: ['small', 'medium'] },
    { name: 'tone', values: ['neutral', 'critical'] },
    { name: 'shape', values: ['round', 'square'] },
    { name: 'on', values: [] },
    { name: 'width', values: [] },
  ])
})

test('nested table keys are not values; the default is read from the destructure', () => {
  const src = `---
const tones = {
  neutral: { fill: 'x', text: 'y' },
  critical: { fill: 'x', text: 'y' },
} as const
interface Props {
  tone?: keyof typeof tones
}
const { tone = 'neutral' } = Astro.props
---`
  assert.deepEqual(propsOf(src, () => null), [{ name: 'tone', values: ['neutral', 'critical'], default: 'neutral' }])
})

test('the default value counts as demoed; native passthrough props are skipped', () => {
  const page = thing(full(), { files: [{ sub: 'Thing', props: [{ name: 'size', values: ['small', 'large', 'medium'], default: 'medium' }, { name: 'as', values: ['div', 'span'] }] }] })
  assert.deepEqual(checkPage({ ...page, doc: page.doc.replace("| \`size\` |", "| \`as\` |\n| \`size\` |") }), [])
})

test('single-line tables and one-level dotted paths resolve; deeper paths yield no values', () => {
  const src = `---
const fits = { cover: 'object-cover', contain: 'object-contain' } as const
const styles = {
  solid: { primary: 'a', neutral: 'b' },
  faded: {
    primary: 'c',
    neutral: 'd',
  },
} as const
interface Props {
  fit?: keyof typeof fits
  color?: keyof typeof styles.solid
  tone?: keyof typeof styles.faded
  variant?: keyof typeof styles
  deep?: keyof typeof tables.items.base
  gap?: keyof typeof gaps
}
const gaps = { 1: 'gap-1', 2: 'gap-2', 4: 'gap-4' } as const
---`
  assert.deepEqual(propsOf(src, () => null), [
    { name: 'fit', values: ['cover', 'contain'] },
    { name: 'color', values: ['primary', 'neutral'] },
    { name: 'tone', values: ['primary', 'neutral'] },
    { name: 'variant', values: ['solid', 'faded'] },
    { name: 'deep', values: [] },
    { name: 'gap', values: [] },
  ])
})

test('propsOf handles type Props = … & { … }', () => {
  const src = `---\ntype Props = Base & {\n  gap?: 1 | 2\n  align?: 'start' | 'end'\n}\n---`
  assert.deepEqual(propsOf(src, () => null), [{ name: 'gap', values: [] }, { name: 'align', values: ['start', 'end'] }])
})
