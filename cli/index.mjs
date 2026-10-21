#!/usr/bin/env node
// Apogee CLI — copy components into your project (copy-in model).
//   apogee create <dir>    new Astro + Tailwind site with Apogee set up
//   apogee init            scaffold tokens + config, wire them into your stylesheet
//   apogee add <names...>  copy components, sections, pages or blocks (+ their deps)
//   apogee list            list available components
//   apogee diff [names...] what changed between your copies and the package
//   apogee update [names...] take package changes for files you haven't edited
// Dependency-free: Node built-ins only.

import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, readdirSync } from 'node:fs'
import { tmpdir, homedir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join, relative } from 'node:path'
import { parseArgs } from 'node:util'
import { canonical as canonicalIn, resolveDeps as resolveDepsIn, copyInto as copyIntoFrom, copySkin, rendered, destOf, sha, fileStatus, telemetryOff, telemetryEvent, wireStyles, nodeSatisfies } from './lib.mjs'

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryDir = join(pkgRoot, 'registry')
const index = JSON.parse(readFileSync(join(registryDir, 'index.json'), 'utf8'))

const CONFIG = 'apogee.json'
const { name: NAME, version: VERSION } = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'))
// PostHog project "Apogee CLI" (AVA UI org, EU cloud). A project key can only send
// events, never read them, so it is safe to ship. An empty key sends nothing.
// Forks publish under their own name, so their runs stay out of this project.
const POSTHOG_KEY = 'phc_ujwx92m25QmL2tSRhkwiTmj7eZmujr65bLkN6fp42FTJ'
const POSTHOG_URL = 'https://eu.i.posthog.com/i/v0/e/'
const DEFAULTS = { componentsDir: 'src/components/apogee', tokens: 'src/styles/apogee.css' }

// --- tiny output helpers ---
// Colour only on a terminal, so piped output stays plain text.
const c = (n) => (s) => (process.stdout.isTTY ? `\x1b[${n}m${s}\x1b[0m` : s)
const bold = c(1)
const dim = c(2)
const green = c(32)
const yellow = c(33)
const cyan = c(36)
const say = (...a) => console.log(...a)
const die = (msg) => {
  console.error(`${yellow('✖')} ${msg}`)
  process.exit(1)
}

const readConfig = () => {
  const p = join(process.cwd(), CONFIG)
  if (!existsSync(p)) return null
  try {
    return { ...DEFAULTS, ...JSON.parse(readFileSync(p, 'utf8')) }
  } catch (err) {
    die(`${CONFIG} is not valid JSON: ${err.message}`)
  }
}

// apogee.json keeps `installed`: project path → hash of what Apogee last wrote
// there. That's how `update` tells your edits from an older package version.
const recordWrites = (cfg, paths) => {
  const installed = { ...cfg.installed }
  for (const p of paths) installed[relative(process.cwd(), p)] = sha(readFileSync(p, 'utf8'))
  writeFileSync(join(process.cwd(), CONFIG), JSON.stringify({ ...cfg, installed }, null, 2) + '\n')
}

// Layouts go to src/layouts/ (Astro's convention, and where AVA looks), not the components dir.
const rootFor = (relFile, cfg) => (relFile.startsWith('layouts/') ? join(process.cwd(), 'src') : join(process.cwd(), cfg.componentsDir))

// One anonymous event per command. Never throws and never waits more than 1.5s.
async function track(command, props) {
  if (!POSTHOG_KEY || NAME !== '@ava-ui/apogee' || telemetryOff(process.env)) return
  const dir = join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'apogee')
  const file = join(dir, 'telemetry.json')
  let id
  try {
    id = JSON.parse(readFileSync(file, 'utf8')).id
  } catch {}
  if (!id) {
    id = randomUUID()
    try {
      mkdirSync(dir, { recursive: true })
      writeFileSync(file, JSON.stringify({ id }) + '\n')
    } catch {}
    console.error(dim('\nApogee sends anonymous usage data (the command, component names, versions). Turn it off with APOGEE_TELEMETRY=0. https://apogee.avaui.dev/docs/telemetry'))
  }
  try {
    await fetch(POSTHOG_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(telemetryEvent({ key: POSTHOG_KEY, id, command, props, version: VERSION })),
      signal: AbortSignal.timeout(1500),
    })
  } catch {}
}

const canonical = (input) => canonicalIn(index, input)

// The page `create` leaves in src/pages/index.astro.
const starter = (componentsDir, skin) => `---
import '../styles/global.css'
import SiteLayout from '../layouts/SiteLayout.astro'
import Button from '../${componentsDir.replace(/^src\//, '')}/Button/Button.astro'
---

<SiteLayout title="My Apogee site"${skin ? ` data-skin="${skin}"` : ''}>
  <main class="grid min-h-dvh place-content-center gap-6 px-gutter text-center">
    <h1 class="text-4xl font-semibold">It works.</h1>
    <p class="text-neutral-faded">Add more with <code>npx @ava-ui/apogee add &lt;name&gt;</code>.</p>
    <Button href="https://apogee.avaui.dev/docs">Read the Apogee docs</Button>
  </main>
</SiteLayout>
`

function cmdCreate(dir, opts) {
  if (!dir) die('name the folder: `apogee create my-site`.')
  if (existsSync(dir)) die(`${bold(dir)} already exists.`)
  // Check Node against the latest Astro before making anything; offline, skip the check.
  const engines = spawnSync('npm', ['view', 'astro@latest', 'engines.node'], { encoding: 'utf8', shell: process.platform === 'win32', timeout: 15000 }).stdout?.trim()
  if (engines && !nodeSatisfies(process.version, engines)) die(`The latest Astro needs Node ${engines}; you have ${process.version.slice(1)}. Update Node (for example \`nvm install --lts\`), then run \`apogee create ${dir}\` again.`)
  const run = (cmd, args) => {
    const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' })
    if (r.status !== 0) die(`\`${cmd} ${args.join(' ')}\` failed.`)
  }
  // create-astro brings the latest Astro; --add tailwind wires the latest Tailwind in through Vite.
  run('npm', ['create', 'astro@latest', dir, '--', '--template', 'minimal', '--add', 'tailwind', '--yes'])
  process.chdir(dir)
  // create-astro reports success even when `astro add` fails, e.g. on a Node version Astro doesn't support.
  if (!existsSync('src/styles/global.css')) die(`Astro was set up, Tailwind wasn't. Check that your Node version meets Astro's, then in ${bold(dir)} run \`npx astro add tailwind\` and \`npx @ava-ui/apogee init\`.`)
  run('npm', ['install', '@lucide/astro'])
  say('')
  // quiet: create already did the steps init and add would print.
  cmdInit({ ...opts, quiet: true })
  cmdAdd(['SiteLayout', 'Button'], { quiet: true })
  writeFileSync('src/pages/index.astro', starter(opts.dir ?? DEFAULTS.componentsDir, opts.skin))
  say(`\n${green('✓')} ${bold(dir)} is ready:`)
  say(dim(`  cd ${dir} && npm run dev`))
  return { skin: opts.skin ?? null }
}

const resolveDeps = (names) => resolveDepsIn(index, names)
const copyInto = (relFile, destRoot, overwrite) => copyIntoFrom(registryDir, relFile, destRoot, overwrite)

// --- commands ---
function cmdInit(opts) {
  const cfgPath = join(process.cwd(), CONFIG)
  const config = { ...DEFAULTS }
  if (opts.dir) config.componentsDir = opts.dir
  if (opts.tokens) config.tokens = opts.tokens

  if (existsSync(cfgPath) && !opts.force) {
    say(`${yellow('•')} ${CONFIG} already exists — keeping it. Use --force to overwrite.`)
  } else {
    // --force resets the settings but keeps the record of installed files (diff/update need it).
    const installed = readConfig()?.installed
    writeFileSync(cfgPath, JSON.stringify(installed ? { ...config, installed } : config, null, 2) + '\n')
    say(`${green('✓')} wrote ${bold(CONFIG)}`)
  }

  // Copy the token layer.
  const tokensDest = join(process.cwd(), config.tokens)
  if (existsSync(tokensDest) && !opts.force) {
    say(`${yellow('•')} ${config.tokens} exists — skipped (--force to overwrite).`)
  } else {
    mkdirSync(dirname(tokensDest), { recursive: true })
    writeFileSync(tokensDest, readFileSync(join(registryDir, 'tokens', 'theme.css'), 'utf8'))
    say(`${green('✓')} wrote ${bold(config.tokens)}`)
  }

  let skinDest
  if (opts.skin) {
    try {
      skinDest = copySkin(registryDir, opts.skin, tokensDest)
      say(`${green('✓')} wrote ${bold(skinDest.replace(process.cwd() + '/', ''))}`)
    } catch (e) {
      die(e.message)
    }
  }

  // The stylesheet that imports Tailwind (Astro's `astro add tailwind` makes src/styles/global.css).
  const css = existsSync('src') && readdirSync('src', { recursive: true }).map((f) => join('src', f)).find((f) => f.endsWith('.css') && /@import\s+["']tailwindcss["']/.test(readFileSync(f, 'utf8')))
  const from = (p) => {
    const r = relative(dirname(resolve(css)), resolve(p))
    return r.startsWith('.') ? r : `./${r}`
  }
  const wired = css && wireStyles(readFileSync(css, 'utf8'), { tokens: from(config.tokens), componentsDir: from(config.componentsDir), ...(skinDest && { skin: from(skinDest) }) })
  if (wired) writeFileSync(css, wired)
  if (css) say(`${green('✓')} ${wired ? 'added Apogee to' : 'Apogee already in'} ${bold(css)}`)

  if (opts.quiet) return { skin: opts.skin ?? null }
  say(`\n${bold('Next steps')}`)
  if (!css) {
    say(`  1. Install Tailwind v4 + Lucide:`)
    say(dim(`     npx astro add tailwind && npm i @lucide/astro`))
    say(`  2. Run \`apogee init\` again to add Apogee to your stylesheet.`)
  }
  if (skinDest) say(dim(`  Put data-skin="${opts.skin}" on <html> to turn the skin on.`))
  say(`  ${css ? '' : '3. '}Add components:`)
  say(dim(`     npx @ava-ui/apogee add button`))
  return { skin: opts.skin ?? null }
}

function cmdAdd(names, opts) {
  if (!names.length) die('nothing to add. Try `apogee add button` or `apogee list`.')
  const config = readConfig()
  if (!config) say(`${yellow('•')} no ${CONFIG} — using defaults. Run \`apogee init\` first.`)
  const cfg = config ?? DEFAULTS

  // Resolve names.
  const resolved = []
  for (const n of names) {
    const name = canonical(n)
    if (!name) die(`unknown component: ${bold(n)}. Run \`apogee list\` to see all.`)
    resolved.push(name)
  }

  const all = resolveDeps(resolved)
  const added = []
  const skipped = []
  const npmDeps = new Set()

  for (const name of all) {
    const comp = index.components[name]
    for (const f of comp.files) {
      const r = copyInto(f, rootFor(f, cfg), opts.overwrite)
      ;(r === 'skip' ? skipped : added).push(f)
    }
    for (const d of comp.dependencies) npmDeps.add(d)
  }
  recordWrites(cfg, added.map((f) => destOf(f, rootFor(f, cfg))))

  const pulledIn = all.filter((n) => !resolved.includes(n))
  say(`${green('✓')} added ${bold(added.length)} file(s) to ${cyan(cfg.componentsDir)}`)
  for (const f of added) say(dim(`  + ${f}`))
  if (pulledIn.length) say(dim(`  (deps pulled in: ${pulledIn.join(', ')})`))
  if (skipped.length) {
    say(`${yellow('•')} skipped ${skipped.length} existing file(s) — use --overwrite to replace:`)
    for (const f of skipped) say(dim(`  = ${f}`))
  }
  if (npmDeps.size && !opts.quiet) {
    say(`\n${bold('Install peer packages:')}`)
    say(dim(`  npm i ${[...npmDeps].join(' ')}`))
  }
  return { items: resolved, files: added.length }
}

// Every installed file of the named entries (all entries when none are named), with its status.
function statuses(names) {
  const cfg = readConfig() ?? DEFAULTS
  const picked = names.length
    ? names.map((n) => canonical(n) ?? die(`unknown component: ${bold(n)}. Run \`apogee list\` to see all.`))
    : Object.keys(index.components)
  const rows = []
  for (const name of picked) {
    for (const f of index.components[name].files) {
      const dest = destOf(f, rootFor(f, cfg))
      if (!existsSync(dest)) continue
      const rel = relative(process.cwd(), dest)
      const upstream = rendered(registryDir, f)
      rows.push({ f, dest, rel, upstream, status: fileStatus(readFileSync(dest, 'utf8'), cfg.installed?.[rel], upstream) })
    }
  }
  if (!rows.length) die(names.length ? 'none of those are installed here.' : 'no Apogee files found here.')
  return { cfg, rows }
}

const NOTE = {
  current: 'same as the package',
  outdated: 'the package changed, you didn\'t: `apogee update` takes it',
  edited: 'you changed it, the package didn\'t: kept',
  conflict: 'you and the package both changed it: `apogee update --overwrite` takes the package version',
  unknown: 'differs from the package, no record of what was copied: `apogee update --overwrite` takes the package version',
}

function cmdDiff(names) {
  const { rows } = statuses(names)
  const counts = Object.fromEntries(Object.keys(NOTE).map((k) => [k, rows.filter((r) => r.status === k).length]))
  showDiff(rows)
  return counts
}

function showDiff(rows) {
  for (const r of rows) say(`${(r.status === 'current' ? dim : yellow)(r.status.padEnd(9))} ${r.rel}`)
  const changed = rows.filter((r) => r.status !== 'current')
  if (!changed.length) return say(`\n${green('✓')} every file matches the package.`)
  for (const s of new Set(changed.map((r) => r.status))) say(dim(`  ${s}: ${NOTE[s]}`))
  // ponytail: line diffs come from git, which nearly every project has; without it the status list stands alone.
  const tmp = mkdtempSync(join(tmpdir(), 'apogee-diff-'))
  for (const r of changed) {
    const pkgCopy = join(tmp, r.f.replaceAll('/', '_'))
    writeFileSync(pkgCopy, r.upstream)
    const g = spawnSync('git', ['--no-pager', 'diff', '--no-index', '--color=auto', `--src-prefix=package/`, `--dst-prefix=yours/`, pkgCopy, r.dest], { encoding: 'utf8' })
    if (g.error) return say(dim('\n(install git to see the changed lines)'))
    // Name both sides by the project path instead of the temp copy's.
    const out = g.stdout
      .replace(/^((?:\x1b\[[\d;]*m)*)diff --git .*$/m, `$1diff ${r.rel}`)
      .replace(/^((?:\x1b\[[\d;]*m)*)--- package\/\S+/m, `$1--- package/${r.rel}`)
      .replace(/^((?:\x1b\[[\d;]*m)*)\+\+\+ yours\/\S+/m, `$1+++ yours/${r.rel}`)
    say('\n' + out.trimEnd())
  }
}

function cmdUpdate(names, opts) {
  const { cfg, rows } = statuses(names)
  const take = rows.filter((r) => r.status === 'outdated' || (opts.overwrite && (r.status === 'conflict' || r.status === 'unknown')))
  for (const r of take) writeFileSync(r.dest, r.upstream)
  recordWrites(cfg, take.map((r) => r.dest))
  say(`${green('✓')} updated ${bold(take.length)} file(s)`)
  for (const r of take) say(dim(`  ↑ ${r.rel}`))
  const kept = rows.filter((r) => !take.includes(r) && r.status !== 'current')
  for (const r of kept) say(`${yellow('•')} kept ${r.rel} ${dim(`(${r.status}: ${NOTE[r.status]})`)}`)
  return { updated: take.length, kept: kept.length }
}

function cmdList() {
  // Names starting with _ are shared internals, pulled in as dependencies, never added on their own.
  const of = (kind) => Object.keys(index.components).filter((n) => index.components[n].kind === kind && !n.startsWith('_')).sort()
  const [pages, blocks, sections, names] = [of('page'), of('block'), of('section'), of('component')]
  for (const [label, list] of [['pages', pages], ['blocks', blocks]]) {
    if (!list.length) continue
    say(bold(`${list.length} ${label}:`))
    for (const p of list) say(`  ${p.padEnd(32)}${dim(index.components[p].description)}`)
    say('')
  }
  if (sections.length) say(bold(`${sections.length} sections:`) + '\n  ' + sections.join('  ') + '\n')
  const layouts = of('layout')
  if (layouts.length) say(bold(`${layouts.length} layouts`) + dim(' (to src/layouts/)') + bold(':') + '\n  ' + layouts.join('  ') + '\n')
  say(bold(`${names.length} components:\n`))
  const width = Math.max(...names.map((n) => n.length)) + 2
  let line = ''
  for (const n of names) {
    line += n.padEnd(width)
    if (line.length >= 72) {
      say('  ' + line.trimEnd())
      line = ''
    }
  }
  if (line) say('  ' + line.trimEnd())
  say(dim(`\nAdd one: apogee add <name>`))
}

function help() {
  say(`${bold('apogee')} — copy Apogee components into your project

${bold('Usage')}
  apogee create <dir> [--skin <name>]
  apogee init [--dir <path>] [--tokens <path>] [--skin <name>] [--force]
  apogee add <names...> [--overwrite]
  apogee list
  apogee diff [names...]
  apogee update [names...] [--overwrite]

${bold('Examples')}
  apogee create my-site            ${dim('# new Astro + Tailwind site with Apogee set up')}
  apogee init
  apogee add button dialog data-grid
  apogee add combobox --overwrite
  apogee add log-in/split-quote   ${dim('# a whole page, into <dir>/pages/log-in/')}
  apogee add banner/slim          ${dim('# a block (part of a page), into <dir>/blocks/banner/')}`)
}

// --- entry ---
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    dir: { type: 'string' },
    tokens: { type: 'string' },
    skin: { type: 'string' },
    force: { type: 'boolean', default: false },
    overwrite: { type: 'boolean', short: 'o', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
})

const [cmd, ...rest] = positionals
const commands = { create: () => cmdCreate(rest[0], values), init: () => cmdInit(values), add: () => cmdAdd(rest, values), list: () => cmdList(), diff: () => cmdDiff(rest), update: () => cmdUpdate(rest, values) }
if (values.help || !cmd) help()
else if (!commands[cmd]) die(`unknown command: ${bold(cmd)}. Run \`apogee --help\`.`)
else await track(cmd, commands[cmd]() ?? {})
