#!/usr/bin/env node
// Apogee CLI — copy components into your project (copy-in model).
//   apogee init            scaffold tokens + config
//   apogee add <names...>  copy components, sections or pages (+ their deps)
//   apogee list            list available components
// Dependency-free: Node built-ins only.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
import { parseArgs } from 'node:util'
import { canonical as canonicalIn, resolveDeps as resolveDepsIn, copyInto as copyIntoFrom, copySkin } from './lib.mjs'

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryDir = join(pkgRoot, 'registry')
const index = JSON.parse(readFileSync(join(registryDir, 'index.json'), 'utf8'))

const CONFIG = 'apogee.json'
const DEFAULTS = { componentsDir: 'src/components/apogee', tokens: 'src/styles/apogee.css' }

// --- tiny output helpers ---
const c = (n) => (s) => `\x1b[${n}m${s}\x1b[0m`
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

const canonical = (input) => canonicalIn(index, input)
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
    writeFileSync(cfgPath, JSON.stringify(config, null, 2) + '\n')
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

  if (opts.skin) {
    try {
      const skinDest = copySkin(registryDir, opts.skin, tokensDest)
      say(`${green('✓')} wrote ${bold(skinDest.replace(process.cwd() + '/', ''))}`)
    } catch (e) {
      die(e.message)
    }
  }

  say(`\n${bold('Next steps')}`)
  say(`  1. Install Tailwind v4 + Lucide:`)
  say(dim(`     npm i -D tailwindcss @tailwindcss/vite @lucide/astro`))
  say(`  2. In your global stylesheet, after Tailwind:`)
  say(dim(`     @import "tailwindcss";`))
  say(dim(`     @import "${config.tokens.replace(/^src\/styles\//, './')}";`))
  if (opts.skin) say(dim(`     @import "${config.tokens.replace(/^src\/styles\//, './').replace(/\.css$/, '')}-skin-${opts.skin}.css"; /* then data-skin="${opts.skin}" on <html> */`))
  say(dim(`     @source "./${config.componentsDir}";`))
  say(`  3. Add components:`)
  say(dim(`     npx @ava-ui/apogee add button`))
}

function cmdAdd(names, opts) {
  if (!names.length) die('nothing to add. Try `apogee add button` or `apogee list`.')
  const config = readConfig()
  if (!config) say(`${yellow('•')} no ${CONFIG} — using defaults. Run \`apogee init\` first.`)
  const cfg = config ?? DEFAULTS
  const destRoot = join(process.cwd(), cfg.componentsDir)

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
      const r = copyInto(f, destRoot, opts.overwrite)
      ;(r === 'skip' ? skipped : added).push(f)
    }
    for (const d of comp.dependencies) npmDeps.add(d)
  }

  const pulledIn = all.filter((n) => !resolved.includes(n))
  say(`${green('✓')} added ${bold(added.length)} file(s) to ${cyan(cfg.componentsDir)}`)
  for (const f of added) say(dim(`  + ${f}`))
  if (pulledIn.length) say(dim(`  (deps pulled in: ${pulledIn.join(', ')})`))
  if (skipped.length) {
    say(`${yellow('•')} skipped ${skipped.length} existing file(s) — use --overwrite to replace:`)
    for (const f of skipped) say(dim(`  = ${f}`))
  }
  if (npmDeps.size) {
    say(`\n${bold('Install peer packages:')}`)
    say(dim(`  npm i ${[...npmDeps].join(' ')}`))
  }
}

function cmdList() {
  const of = (kind) => Object.keys(index.components).filter((n) => index.components[n].kind === kind).sort()
  const [pages, sections, names] = [of('page'), of('section'), of('component')]
  if (pages.length) {
    say(bold(`${pages.length} pages:`))
    for (const p of pages) say(`  ${p.padEnd(32)}${dim(index.components[p].description)}`)
    say('')
  }
  if (sections.length) say(bold(`${sections.length} sections:`) + '\n  ' + sections.join('  ') + '\n')
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
  apogee init [--dir <path>] [--tokens <path>] [--skin <name>] [--force]
  apogee add <names...> [--overwrite]
  apogee list

${bold('Examples')}
  apogee init
  apogee add button dialog data-grid
  apogee add combobox --overwrite
  apogee add log-in/split-quote   ${dim('# a whole page, into <dir>/pages/log-in/')}`)
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
if (values.help || !cmd) help()
else if (cmd === 'init') cmdInit(values)
else if (cmd === 'add') cmdAdd(rest, values)
else if (cmd === 'list') cmdList()
else die(`unknown command: ${bold(cmd)}. Run \`apogee --help\`.`)
