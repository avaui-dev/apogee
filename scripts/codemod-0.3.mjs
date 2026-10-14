#!/usr/bin/env node
// Rewrites 0.2 token utilities and CSS variables to the 0.3 model, in place.
// Usage: node scripts/codemod-0.3.mjs [--dry]   (run from the package root; a
// consumer runs it from their project root and it walks ./src)
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

// Order matters: longer / more specific names first.
const UTIL = [
  ['bg-accent/5', 'bg-primary-faded-highlighted'], ['from-accent/20', 'from-primary/20'], ['from-accent/10', 'from-primary/10'],
  ['bg-muted/60', 'bg-neutral-faded-highlighted'], ['bg-muted-foreground/15', 'bg-neutral'], ['bg-muted-foreground/10', 'bg-neutral'],
  ['ring-background', 'ring-page'], ['border-ring', 'border-primary'], ['text-accent-hover', 'text-primary'],
  ['bg-accent-hover', 'bg-primary-highlighted'], ['text-accent-foreground', 'text-on-primary'],
  ['border-accent/25', 'border-primary-faded'], ['bg-accent/10', 'bg-primary-faded'], ['bg-accent/15', 'bg-primary-faded'],
  ['bg-accent', 'bg-primary'], ['text-accent', 'text-primary'], ['border-accent', 'border-primary'], ['outline-accent', 'outline-primary'],
  ['bg-danger-hover', 'bg-critical-highlighted'], ['text-danger-foreground', 'text-on-critical'],
  ['border-danger/25', 'border-critical-faded'], ['bg-danger/10', 'bg-critical-faded'],
  ['bg-danger', 'bg-critical'], ['text-danger', 'text-critical'], ['border-danger', 'border-critical'],
  ['text-success-foreground', 'text-on-positive'], ['border-success/25', 'border-positive-faded'], ['bg-success/10', 'bg-positive-faded'],
  ['bg-success', 'bg-positive'], ['text-success', 'text-positive'], ['border-success', 'border-positive'],
  ['text-warning-foreground', 'text-on-warning'], ['border-warning/30', 'border-warning-faded'], ['bg-warning/10', 'bg-warning-faded'],
  ['text-muted-foreground', 'text-neutral-faded'], ['bg-muted/40', 'bg-neutral-faded'], ['bg-muted/50', 'bg-neutral-faded'],
  ['hover:bg-muted', 'hover:bg-neutral-faded-highlighted'], ['focus-visible:bg-muted', 'focus-visible:bg-neutral-faded-highlighted'],
  ['aria-selected:bg-muted', 'aria-selected:bg-neutral-faded-highlighted'], ['bg-muted', 'bg-neutral-faded'],
  ['text-surface-foreground', 'text-neutral'], ['bg-surface', 'bg-elevation-raised'],
  ['border-border', 'border-neutral'], ['divide-border', 'divide-neutral'], ['bg-border', 'bg-neutral'],
  ['bg-background/85', 'bg-page/85'], ['bg-background', 'bg-page'], ['text-background', 'text-on-inverted'], ['bg-foreground', 'bg-inverted'],
  ['text-foreground', 'text-neutral'], ['outline-ring', 'outline-primary'], ['ring-ring', 'ring-neutral'],
]
const VARS = [
  ['--accent-hover', '--background-primary-highlighted'], ['--accent-foreground', '--on-primary'], ['--accent', '--background-primary'],
  ['--danger-hover', '--background-critical-highlighted'], ['--danger-foreground', '--on-critical'], ['--danger', '--background-critical'],
  ['--success-foreground', '--on-positive'], ['--success', '--background-positive'],
  ['--warning-foreground', '--on-warning'], ['--warning', '--background-warning'],
  ['--muted-foreground', '--foreground-neutral-faded'], ['--muted', '--background-neutral-faded'],
  ['--surface-foreground', '--foreground-neutral'], ['--surface', '--background-elevation-raised'],
  ['--border', '--border-neutral'], ['--background', '--background-page'], ['--foreground', '--foreground-neutral'], ['--ring', '--border-primary'],
  ['--color-accent', '--background-primary'], ['--color-muted', '--background-neutral-faded'], ['--color-border', '--border-neutral'],
  ['--color-background', '--background-page'], ['--color-ring', '--border-primary'], ['--color-danger', '--background-critical'], ['--color-success', '--background-positive'],
  ['--duration-base', '--duration-medium'], ['--ease-smooth', '--ease-standard'], ['--ease-emphasized', '--ease-decelerate'],
]
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')

export function rewrite(src) {
  let out = src
  for (const [from, to] of UTIL) {
    // A whole utility, with any variant prefix (hover:, peer-focus:, aria-[x]:…) kept.
    out = out.replace(new RegExp(`(^|[\\s'"\`\\[:])${esc(from)}(?=$|[\\s'"\`\\]])`, 'g'), `$1${to}`)
  }
  for (const [from, to] of VARS) {
    out = out.replace(new RegExp(`var\\(${esc(from)}\\)`, 'g'), `var(${to})`)
  }
  return out
}

function walk(dir, exts, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue
    if (statSync(p).isDirectory()) walk(p, exts, acc)
    else if (exts.some((e) => name.endsWith(e))) acc.push(p)
  }
  return acc
}

const self = realpathSync(fileURLToPath(import.meta.url))
if (process.argv[1] && realpathSync(resolve(process.argv[1])) === self) {
  const here = resolve(dirname(self), '..')
  const dry = process.argv.includes('--dry')
  const exts = ['.astro', '.mdx', '.md', '.css']
  // Run from this package root: registry + playground. Run from a consumer
  // project (the script lives in node_modules): that project's ./src.
  const inPackage = realpathSync(process.cwd()) === here
  const dirs = inPackage
    ? [join(here, 'registry', 'components'), join(here, 'playground', 'src')]
    : [join(process.cwd(), 'src')]
  const files = dirs.filter(existsSync).flatMap((d) => walk(d, exts))
  let changed = 0
  for (const f of files) {
    const before = readFileSync(f, 'utf8')
    const after = rewrite(before)
    if (after !== before) {
      changed++
      console.log(`${dry ? 'would change' : 'changed'} ${f}`)
      if (!dry) writeFileSync(f, after)
    }
  }
  console.log(`${changed} file(s)`)
}
