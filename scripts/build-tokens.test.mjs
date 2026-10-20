import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateHue, renderBlocks } from './build-tokens.mjs'
import { contrast, composite, oklchToLinear } from './color.mjs'
// Fixed inputs, so these tests pin the generator's behaviour whatever scripts/hues.mjs is set to
// (check:contrast measures the configured theme).
const hues = { primary: 'blue-700', critical: 'red-600', warning: 'amber-400', positive: 'green-700', neutral: 'slate' }
import { resolveHue } from './build-tokens.mjs'

test('dark primary keeps its hue, lowers chroma by 20%, never below L 0.32', () => {
  const { dark } = generateHue('primary', hues.primary)
  const { h, c } = resolveHue('primary', hues.primary)
  assert.equal(dark['background-primary'].h, h)
  assert.ok(Math.abs(dark['background-primary'].c - c * 0.8) < 1e-9)
  assert.ok(dark['background-primary'].l >= 0.32)
})

test('neutral fills are a mid-lightness tinted ink: light 7% / 13%, dark 10% / 16%', () => {
  const { light, dark } = generateHue('neutral', hues.neutral)
  const lf = light['background-neutral-faded']
  assert.equal(lf.alpha, 0.07)
  assert.equal(light['background-neutral-faded-highlighted'].alpha, 0.13)
  assert.equal(lf.h, resolveHue('neutral', hues.neutral).h)
  assert.ok(lf.c > 0.03 && lf.l === 0.55, 'fill ink keeps its tint at low alpha')
  assert.equal(light['border-neutral'].l, 0.2, 'borders keep the dark ink')
  assert.equal(dark['background-neutral-faded'].alpha, 0.1)
  assert.equal(dark['background-neutral-faded-highlighted'].alpha, 0.16)
})

test('palette names resolve: accents to a step, greys to a tint', () => {
  assert.deepEqual(resolveHue('primary', 'blue'), resolveHue('primary', 'blue-600'))
  assert.notDeepEqual(resolveHue('primary', 'blue-700'), resolveHue('primary', 'blue-600'))
  assert.equal(resolveHue('neutral', 'stone').h, 58.071)
  assert.equal(resolveHue('neutral', 'neutral').c, 0)
  assert.deepEqual(resolveHue('primary', { l: 0.5, c: 0.1, h: 10 }), { l: 0.5, c: 0.1, h: 10 })
  assert.throws(() => resolveHue('primary', 'teal-950'), /unknown colour/)
  assert.throws(() => resolveHue('neutral', 'blue'), /unknown grey/)
})

test('grey chroma peaks at mid lightness and vanishes at white', () => {
  const { light } = generateHue('neutral', hues.neutral)
  assert.equal(light['background-page'].c, 0)
  assert.ok(light['foreground-neutral-faded'].c > light['foreground-neutral'].c)
  assert.ok(light['foreground-neutral'].c > light['background-page-faded'].c)
  const plain = generateHue('neutral', 'neutral')
  for (const v of Object.values(plain.light)) assert.equal(v.c, 0)
})

test('on-colour is white for primary in both modes and black for warning', () => {
  const p = generateHue('primary', hues.primary)
  const w = generateHue('warning', hues.warning)
  assert.equal(p.light['on-primary'].l, 1)
  assert.equal(p.dark['on-primary'].l, 1)
  assert.equal(w.light['on-warning'].l, 0)
})

test('every on-colour clears 4.5 against its fill, in both modes', () => {
  for (const [name, input] of Object.entries(hues)) {
    const { light, dark } = generateHue(name, input)
    assert.ok(contrast(light[`on-${name}`], light[`background-${name}`]) >= 4.5, `${name} light`)
    assert.ok(contrast(dark[`on-${name}`], dark[`background-${name}`]) >= 4.5, `${name} dark`)
  }
})

test('foreground on page clears 4.5 for every hue, both modes, with alpha composited', () => {
  const n = generateHue('neutral', hues.neutral)
  for (const [name, input] of Object.entries(hues)) {
    const { light, dark } = generateHue(name, input)
    assert.ok(contrast(light[`foreground-${name}`], n.light['background-page']) >= 4.5, `${name} light`)
    assert.ok(contrast(dark[`foreground-${name}`], n.dark['background-page']) >= 4.5, `${name} dark`)
  }
  const fadedBg = composite(n.light['background-neutral-faded'], n.light['background-page'])
  assert.ok(contrast(n.light['foreground-neutral-faded'], fadedBg) >= 4.5)
})

test('renderBlocks emits one declaration per variable with oklch values', () => {
  const { light, dark } = renderBlocks(hues)
  assert.match(light, /^  --background-primary: oklch\(0\.488 0\.243 264\.376\);$/m)
  assert.match(dark, /^  --background-page: oklch\(0\.16 [0-9.]+ 257\.417\);$/m)
  assert.match(light, /^  --on-primary: oklch\(1 0 0\);$/m)
})

test('writeTheme fills empty marker blocks and replaces filled ones', async () => {
  const { writeTheme } = await import('./build-tokens.mjs')
  const { mkdtempSync, writeFileSync, readFileSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const file = join(mkdtempSync(join(tmpdir(), 'apogee-tokens-')), 'theme.css')
  writeFileSync(file, `:root {\n  /* @generated colors light start */\n  /* @generated colors light end */\n}\n[data-theme="dark"] {\n  /* @generated colors dark start */\n  /* @generated colors dark end */\n}\n`)
  writeTheme(file, hues)
  const once = readFileSync(file, 'utf8')
  assert.match(once, /start \*\/\n  --background-primary: oklch/)
  assert.match(once, /--on-inverted: oklch\(0\.16 [0-9.]+ 257\.417\);\n  \/\* @generated colors dark end/)
  writeTheme(file, hues)
  assert.equal(readFileSync(file, 'utf8'), once) // idempotent
})

test('writeTheme mirrors the whole dark rule into the system-dark block', async () => {
  const { writeTheme } = await import('./build-tokens.mjs')
  const { mkdtempSync, writeFileSync, readFileSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const file = join(mkdtempSync(join(tmpdir(), 'apogee-tokens-')), 'theme.css')
  writeFileSync(file, `:root {\n  /* @generated colors light start */\n  /* @generated colors light end */\n}\n[data-theme="dark"] {\n  /* @generated colors dark start */\n  /* @generated colors dark end */\n\n  color-scheme: dark;\n  --shadow-raised: 0 1px 2px rgb(0 0 0 / 0.5);\n}\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme]) {\n    /* @generated system dark start */\n    /* @generated system dark end */\n  }\n}\n`)
  writeTheme(file, hues)
  const css = readFileSync(file, 'utf8')
  const system = css.match(/system dark start \*\/\n([\s\S]*?)\n    \/\* @generated system dark end/)[1]
  const dark = css.match(/colors dark start \*\/\n([\s\S]*?)\n  \/\* @generated colors dark end/)[1]
  // every generated dark declaration and the hand-written ones, re-indented, no nested markers
  for (const line of dark.split('\n')) assert.ok(system.includes(`  ${line}`), line)
  assert.match(system, /\n    color-scheme: dark;\n    --shadow-raised: 0 1px 2px rgb\(0 0 0 \/ 0\.5\);$/)
  assert.doesNotMatch(system, /@generated colors/)
  writeTheme(file, hues)
  assert.equal(readFileSync(file, 'utf8'), css) // idempotent
})

test('every on-colour also clears 4.5 against its hovered fill, in both modes', () => {
  for (const [name, input] of Object.entries(hues)) {
    const { light, dark } = generateHue(name, input)
    assert.ok(contrast(light[`on-${name}`], light[`background-${name}-highlighted`]) >= 4.5, `${name} light`)
    assert.ok(contrast(dark[`on-${name}`], dark[`background-${name}-highlighted`]) >= 4.5, `${name} dark`)
  }
})

test('every emitted token is inside the sRGB gamut', () => {
  for (const [name, input] of Object.entries(hues)) {
    const g = generateHue(name, input)
    for (const mode of ['light', 'dark']) for (const [k, v] of Object.entries(g[mode])) {
      const rgb = oklchToLinear(v)
      assert.ok(rgb.every((x) => x >= -0.0005 && x <= 1.0005), `${mode} --${k} (${name}) is out of gamut: ${rgb.map((x) => x.toFixed(3))}`)
    }
  }
})

test('CLI writes the theme file given as an argument', async () => {
  const { mkdtempSync, writeFileSync, readFileSync } = await import('node:fs')
  const { join } = await import('node:path')
  const { tmpdir } = await import('node:os')
  const { execFileSync } = await import('node:child_process')
  const dir = mkdtempSync(join(tmpdir(), 'apogee-theme-'))
  const theme = join(dir, 'apogee.css')
  writeFileSync(theme, '/* @generated colors light start */\n  /* @generated colors light end */\n/* @generated colors dark start */\n  /* @generated colors dark end */\n')
  execFileSync(process.execPath, [new URL('./build-tokens.mjs', import.meta.url).pathname, theme])
  assert.match(readFileSync(theme, 'utf8'), /--background-primary: oklch/)
})

test('writeTheme records its hue inputs in the file, and readHues gets them back', async () => {
  const { writeTheme, readHues } = await import('./build-tokens.mjs')
  const { mkdtempSync, writeFileSync, readFileSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const file = join(mkdtempSync(join(tmpdir(), 'apogee-tokens-')), 'theme.css')
  writeFileSync(file, `:root {\n  /* @generated colors light start */\n  /* @generated colors light end */\n}\n[data-theme="dark"] {\n  /* @generated colors dark start */\n  /* @generated colors dark end */\n}\n`)
  assert.equal(readHues(readFileSync(file, 'utf8')), null)
  const custom = { ...hues, primary: { l: 0.55, c: 0.2, h: 30 }, neutral: 'stone' }
  writeTheme(file, custom)
  const css = readFileSync(file, 'utf8')
  assert.deepEqual(readHues(css), custom)
  writeTheme(file, readHues(css))
  assert.equal(readFileSync(file, 'utf8'), css) // regenerating from the record changes nothing
})
