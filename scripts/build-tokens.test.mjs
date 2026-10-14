import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateHue, renderBlocks } from './build-tokens.mjs'
import { contrast, composite, oklchToLinear } from './color.mjs'
import hues from './hues.mjs'

test('dark primary keeps its hue, lowers chroma by 20%, never below L 0.32', () => {
  const { dark } = generateHue('primary', hues.primary)
  assert.equal(dark['background-primary'].h, 262)
  assert.ok(Math.abs(dark['background-primary'].c - 0.16) < 1e-9)
  assert.ok(dark['background-primary'].l >= 0.32)
})

test('neutral faded is black at 5% alpha in light and white at 8% in dark', () => {
  const { light, dark } = generateHue('neutral', hues.neutral)
  assert.deepEqual(light['background-neutral-faded'], { l: 0, c: 0, h: 0, alpha: 0.05 })
  assert.deepEqual(dark['background-neutral-faded'], { l: 1, c: 0, h: 0, alpha: 0.08 })
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
  assert.match(light, /^  --background-primary: oklch\(0\.47 0\.2 262\);$/m)
  assert.match(dark, /^  --background-page: oklch\(0\.16 0 0\);$/m)
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
  assert.match(once, /--on-inverted: oklch\(0\.16 0 0\);\n  \/\* @generated colors dark end/)
  writeTheme(file, hues)
  assert.equal(readFileSync(file, 'utf8'), once) // idempotent
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
