import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// The CLI runs below are tests, not usage: keep them out of telemetry.
process.env.APOGEE_TELEMETRY = '0'

import { canonical, resolveDeps, copyInto, copySkin, fileStatus, sha, telemetryOff, telemetryEvent, wireStyles } from './lib.mjs'

const index = {
  components: {
    Button: { files: ['Button/Button.astro'], registryDependencies: ['Spinner'] },
    Spinner: { files: ['Spinner/Spinner.astro'], registryDependencies: [] },
    DataGrid: { files: ['DataGrid/DataGrid.astro'], registryDependencies: ['Checkbox'] },
    Checkbox: { files: ['Checkbox/Checkbox.astro'], registryDependencies: ['Button'] },
  },
}

test('canonical ignores case and hyphens', () => {
  assert.equal(canonical(index, 'data-grid'), 'DataGrid')
  assert.equal(canonical(index, 'BUTTON'), 'Button')
  assert.equal(canonical(index, 'nope'), undefined)
})

test('resolveDeps is transitive and de-duplicated', () => {
  assert.deepEqual(resolveDeps(index, ['DataGrid']), ['DataGrid', 'Checkbox', 'Button', 'Spinner'])
  assert.deepEqual(resolveDeps(index, ['Button', 'Spinner']), ['Button', 'Spinner'])
})

test('copyInto skips existing files unless overwrite, and never escapes destRoot', () => {
  const root = mkdtempSync(join(tmpdir(), 'apogee-'))
  const registry = join(root, 'registry')
  mkdirSync(join(registry, 'components', 'Button'), { recursive: true })
  writeFileSync(join(registry, 'components', 'Button', 'Button.astro'), 'v1')
  const dest = join(root, 'project')

  assert.equal(copyInto(registry, 'Button/Button.astro', dest, false), 'ok')
  writeFileSync(join(registry, 'components', 'Button', 'Button.astro'), 'v2')
  assert.equal(copyInto(registry, 'Button/Button.astro', dest, false), 'skip')
  assert.equal(readFileSync(join(dest, 'Button/Button.astro'), 'utf8'), 'v1')
  assert.equal(copyInto(registry, 'Button/Button.astro', dest, true), 'ok')
  assert.equal(readFileSync(join(dest, 'Button/Button.astro'), 'utf8'), 'v2')

  assert.throws(() => copyInto(registry, '../../escape.astro', dest, true), /outside/)
})

test('copyInto reads sections from registry/sections and keeps them under sections/ in the project', () => {
  const root = mkdtempSync(join(tmpdir(), 'apogee-sections-'))
  const registry = join(root, 'registry')
  mkdirSync(join(registry, 'sections', 'Hero'), { recursive: true })
  writeFileSync(join(registry, 'sections', 'Hero', 'Hero.astro'), 'hero')
  const dest = join(root, 'project')
  assert.equal(copyInto(registry, 'sections/Hero/Hero.astro', dest, false), 'ok')
  assert.equal(readFileSync(join(dest, 'sections', 'Hero', 'Hero.astro'), 'utf8'), 'hero')
})

test('a copied section imports components from the project components dir, not a components/ subfolder', () => {
  const root = mkdtempSync(join(tmpdir(), 'apogee-section-imports-'))
  const registry = join(root, 'registry')
  mkdirSync(join(registry, 'sections', 'Hero'), { recursive: true })
  mkdirSync(join(registry, 'sections', '_shared'), { recursive: true })
  mkdirSync(join(registry, 'components', 'Section'), { recursive: true })
  writeFileSync(join(registry, 'sections', 'Hero', 'Hero.astro'), "import Section from '../../components/Section/Section.astro'\nimport { uid } from '../../components/utils/uid.ts'\nimport { onBackground } from '../_shared/spine.ts'\n")
  writeFileSync(join(registry, 'sections', '_shared', 'spine.ts'), 'export const onBackground = {}')
  writeFileSync(join(registry, 'components', 'Section', 'Section.astro'), 'section')
  mkdirSync(join(registry, 'components', 'utils'), { recursive: true })
  writeFileSync(join(registry, 'components', 'utils', 'uid.ts'), 'export const uid = () => 1')
  const dest = join(root, 'project')
  for (const f of ['sections/Hero/Hero.astro', 'sections/_shared/spine.ts', 'Section/Section.astro', 'utils/uid.ts']) copyInto(registry, f, dest, false)
  const copied = readFileSync(join(dest, 'sections', 'Hero', 'Hero.astro'), 'utf8')
  for (const [, spec] of copied.matchAll(/from '([^']+)'/g)) {
    const target = join(dest, 'sections', 'Hero', spec)
    assert.ok(existsSync(target), `${spec} should resolve to ${target}`)
  }
})

test('copySkin writes the skin beside the tokens file and rejects unknown names', () => {
  const root = mkdtempSync(join(tmpdir(), 'apogee-skin-'))
  const registry = join(root, 'registry')
  mkdirSync(join(registry, 'tokens'), { recursive: true })
  writeFileSync(join(registry, 'tokens', 'skin-skeuomorphic.css'), "[data-skin='skeuomorphic'] { --shadow-control: 0 0 #000; }\n")
  const tokens = join(root, 'src', 'styles', 'apogee.css')
  mkdirSync(join(root, 'src', 'styles'), { recursive: true })
  writeFileSync(tokens, '')
  const out = copySkin(registry, 'skeuomorphic', tokens)
  assert.equal(out, join(root, 'src', 'styles', 'apogee-skin-skeuomorphic.css'))
  assert.ok(readFileSync(out, 'utf8').includes("data-skin='skeuomorphic'"))
  assert.throws(() => copySkin(registry, 'nope', tokens), /unknown skin/)
})

test('the CLI entry loads and answers --help', async () => {
  const { spawnSync } = await import('node:child_process')
  const r = spawnSync(process.execPath, [new URL('./index.mjs', import.meta.url).pathname, '--help'], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  assert.match(r.stdout, /apogee init/)
})

test('copyInto installs a page under pages/ and points its imports at the project layout', () => {
  const root = mkdtempSync(join(tmpdir(), 'apogee-'))
  const registry = join(root, 'registry')
  mkdirSync(join(registry, 'pages', 'log-in'), { recursive: true })
  writeFileSync(
    join(registry, 'pages', 'log-in', 'Simple.astro'),
    "import Input from '../../components/Input/Input.astro'\nimport AuthShell from '../../sections/AuthShell/AuthShell.astro'\n",
  )
  const dest = join(root, 'project')
  assert.equal(copyInto(registry, 'pages/log-in/Simple.astro', dest, false), 'ok')
  // In the project: <dir>/pages/log-in/Simple.astro, <dir>/Input/Input.astro, <dir>/sections/AuthShell/AuthShell.astro.
  assert.equal(
    readFileSync(join(dest, 'pages', 'log-in', 'Simple.astro'), 'utf8'),
    "import Input from '../../Input/Input.astro'\nimport AuthShell from '../../sections/AuthShell/AuthShell.astro'\n",
  )
})

test('canonical finds a page by its category/slug key', () => {
  const withPage = { components: { ...index.components, 'log-in/split-quote': { files: [], registryDependencies: [] } } }
  assert.equal(canonical(withPage, 'log-in/split-quote'), 'log-in/split-quote')
  assert.equal(canonical(withPage, 'login/SplitQuote'), 'log-in/split-quote')
})

test('list leaves out internal entries (names starting with _)', async () => {
  const { execFileSync } = await import('node:child_process')
  const out = execFileSync(process.execPath, [new URL('./index.mjs', import.meta.url).pathname, 'list'], { encoding: 'utf8' })
  assert.match(out, /Hero/)
  assert.doesNotMatch(out, /_shared/)
})

test('copyInto keeps blocks under blocks/ and rewrites the components hop', () => {
  const root = mkdtempSync(join(tmpdir(), 'apogee-'))
  const registry = join(root, 'registry')
  mkdirSync(join(registry, 'blocks', 'banner'), { recursive: true })
  writeFileSync(join(registry, 'blocks', 'banner', 'Slim.astro'), "import Banner from '../../sections/Banner/Banner.astro'\nimport Link from '../../components/Link/Link.astro'\n")
  const dest = join(root, 'out')
  assert.equal(copyInto(registry, 'blocks/banner/Slim.astro', dest, false), 'ok')
  const body = readFileSync(join(dest, 'blocks', 'banner', 'Slim.astro'), 'utf8')
  assert.match(body, /'\.\.\/\.\.\/sections\/Banner\/Banner\.astro'/)
  assert.match(body, /'\.\.\/\.\.\/Link\/Link\.astro'/)
})

test('add site-layout writes the layout to src/layouts/, where Astro and AVA look', async () => {
  const { execFileSync } = await import('node:child_process')
  const project = mkdtempSync(join(tmpdir(), 'apogee-'))
  execFileSync(process.execPath, [new URL('./index.mjs', import.meta.url).pathname, 'add', 'site-layout'], { cwd: project, encoding: 'utf8' })
  const body = readFileSync(join(project, 'src', 'layouts', 'SiteLayout.astro'), 'utf8')
  assert.match(body, /@seo title/)
  assert.equal(existsSync(join(project, 'src', 'components', 'apogee', 'layouts')), false)
})

test('fileStatus tells your edits from package changes using the recorded hash', () => {
  const [old, mine, pkg] = ['a', 'b', 'c']
  assert.equal(fileStatus(pkg, sha(old), pkg), 'current')
  assert.equal(fileStatus(old, sha(old), pkg), 'outdated') // package moved, you didn't
  assert.equal(fileStatus(mine, sha(pkg), pkg), 'edited') // you moved, package didn't
  assert.equal(fileStatus(mine, sha(old), pkg), 'conflict') // both moved
  assert.equal(fileStatus(mine, undefined, pkg), 'unknown') // no record
  assert.equal(fileStatus(pkg, undefined, pkg), 'current')
})

test('add records hashes; diff and update leave your edits alone and apply package changes', async () => {
  const { execFileSync } = await import('node:child_process')
  const cli = (...args) => execFileSync(process.execPath, [new URL('./index.mjs', import.meta.url).pathname, ...args], { cwd: project, encoding: 'utf8' })
  const project = mkdtempSync(join(tmpdir(), 'apogee-'))
  cli('add', 'badge')
  const file = join(project, 'src', 'components', 'apogee', 'Badge', 'Badge.astro')
  const pkg = readFileSync(file, 'utf8')
  const cfgPath = join(project, 'apogee.json')
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'))
  assert.equal(cfg.installed['src/components/apogee/Badge/Badge.astro'], sha(pkg))
  assert.match(cli('diff', 'badge'), /current\s+src\/components\/apogee\/Badge\/Badge\.astro/)

  // You edit the file: diff says edited, update keeps it.
  writeFileSync(file, pkg + '<!-- mine -->\n')
  assert.match(cli('diff', 'badge'), /edited\s+src\/components\/apogee\/Badge\/Badge\.astro/)
  cli('update', 'badge')
  assert.match(readFileSync(file, 'utf8'), /<!-- mine -->/)

  // An older copy you never touched (recorded hash matches): update brings it up to date.
  writeFileSync(file, 'old version\n')
  cfg.installed['src/components/apogee/Badge/Badge.astro'] = sha('old version\n')
  writeFileSync(cfgPath, JSON.stringify(cfg))
  assert.match(cli('diff', 'badge'), /outdated/)
  cli('update', 'badge')
  assert.equal(readFileSync(file, 'utf8'), pkg)
  assert.equal(JSON.parse(readFileSync(cfgPath, 'utf8')).installed['src/components/apogee/Badge/Badge.astro'], sha(pkg))
})

test('telemetry is off with APOGEE_TELEMETRY=0, DO_NOT_TRACK or in CI', () => {
  assert.equal(telemetryOff({}), false)
  for (const v of ['0', 'false', 'off', 'OFF']) assert.equal(telemetryOff({ APOGEE_TELEMETRY: v }), true, v)
  assert.equal(telemetryOff({ APOGEE_TELEMETRY: '1' }), false)
  assert.equal(telemetryOff({ DO_NOT_TRACK: '1' }), true)
  assert.equal(telemetryOff({ DO_NOT_TRACK: '0' }), false)
  assert.equal(telemetryOff({ CI: 'true' }), true)
})

test('a telemetry event is anonymous and carries only the command, its details and versions', () => {
  const e = telemetryEvent({ key: 'phc_x', id: 'abc', command: 'add', props: { items: ['button'] }, version: '0.7.0' })
  assert.equal(e.api_key, 'phc_x')
  assert.equal(e.event, 'cli add')
  assert.equal(e.distinct_id, 'abc')
  assert.equal(e.properties.$process_person_profile, false)
  assert.equal(e.properties.$geoip_disable, true) // no location looked up from the IP
  assert.deepEqual(Object.keys(e.properties).sort(), ['$geoip_disable', '$process_person_profile', 'cli_version', 'items', 'node_version', 'os'])
  assert.match(e.properties.node_version, /^\d+$/)
})

test('wireStyles adds the Apogee lines after the Tailwind import, once', () => {
  const paths = { tokens: './apogee.css', componentsDir: '../components/apogee' }
  const out = wireStyles(`@import "tailwindcss";\nbody { margin: 0 }\n`, paths)
  assert.equal(out, `@import "tailwindcss";\n@import "./apogee.css";\n@source "../components/apogee";\nbody { margin: 0 }\n`)
  assert.equal(wireStyles(out, paths), null)
  assert.equal(wireStyles('body {}', paths), null)
  assert.match(wireStyles(`@import 'tailwindcss'`, { ...paths, skin: './apogee-skin-x.css' }), /tailwindcss'\n@import "\.\/apogee\.css";\n@import "\.\/apogee-skin-x\.css";/)
})
