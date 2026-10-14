import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rewrite } from './codemod-0.3.mjs'

test('utility renames, including variants and opacity forms', () => {
  assert.equal(rewrite('bg-accent hover:bg-accent-hover text-accent-foreground'), 'bg-primary hover:bg-primary-highlighted text-on-primary')
  assert.equal(rewrite('border-accent/25 bg-accent/10 text-accent'), 'border-primary-faded bg-primary-faded text-primary')
  assert.equal(rewrite('bg-danger text-danger-foreground hover:bg-danger-hover'), 'bg-critical text-on-critical hover:bg-critical-highlighted')
  assert.equal(rewrite('bg-muted/40 hover:bg-muted text-muted-foreground'), 'bg-neutral-faded hover:bg-neutral-faded-highlighted text-neutral-faded')
  assert.equal(rewrite('bg-surface text-surface-foreground border-border divide-border'), 'bg-elevation-raised text-neutral border-neutral divide-neutral')
  assert.equal(rewrite('bg-background text-foreground outline-ring'), 'bg-page text-neutral outline-primary')
  assert.equal(rewrite('bg-foreground text-background'), 'bg-inverted text-on-inverted')
  assert.equal(rewrite('peer-focus:text-accent aria-selected:border-accent'), 'peer-focus:text-primary aria-selected:border-primary')
})

test('opacity forms and ring/gradient colours', () => {
  assert.equal(rewrite('data-[drag=true]:bg-accent/5 hover:bg-muted/60 bg-muted-foreground/15'), 'data-[drag=true]:bg-primary-faded-highlighted hover:bg-neutral-faded-highlighted bg-neutral')
  assert.equal(rewrite('[&>*]:ring-background border-ring hover:text-accent-hover'), '[&>*]:ring-page border-primary hover:text-primary')
  assert.equal(rewrite('from-accent/20 to-transparent'), 'from-primary/20 to-transparent')
})

test('css variables inside <style> blocks', () => {
  assert.equal(rewrite('border: 1px solid var(--border); color: var(--muted-foreground)'), 'border: 1px solid var(--border-neutral); color: var(--foreground-neutral-faded)')
  assert.equal(rewrite('var(--accent) var(--accent-hover) var(--accent-foreground) var(--ring)'), 'var(--background-primary) var(--background-primary-highlighted) var(--on-primary) var(--border-primary)')
  assert.equal(rewrite('var(--duration-base) var(--ease-smooth) var(--ease-emphasized)'), 'var(--duration-medium) var(--ease-standard) var(--ease-decelerate)')
})

test('leaves unrelated classes alone', () => {
  assert.equal(rewrite('rounded-md shadow-lg bg-transparent text-current'), 'rounded-md shadow-lg bg-transparent text-current')
})

test('legacy --color-* variables inside <style> blocks', () => {
  assert.equal(
    rewrite('var(--color-accent) var(--color-muted) var(--color-border) var(--color-background) var(--color-ring) var(--color-danger) var(--color-success)'),
    'var(--background-primary) var(--background-neutral-faded) var(--border-neutral) var(--background-page) var(--border-primary) var(--background-critical) var(--background-positive)',
  )
})

test('run from a consumer project rewrites ./src, not the installed package', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync } = await import('node:fs')
  const { join } = await import('node:path')
  const { tmpdir } = await import('node:os')
  const { execFileSync } = await import('node:child_process')
  const root = mkdtempSync(join(tmpdir(), 'apogee-consumer-'))
  // A fake installed package: the script next to a registry/, as `npm pack` ships it.
  const pkg = join(root, 'node_modules', '@ava-ui', 'apogee')
  mkdirSync(join(pkg, 'scripts'), { recursive: true })
  mkdirSync(join(pkg, 'registry', 'components', 'X'), { recursive: true })
  cpSync(new URL('./codemod-0.3.mjs', import.meta.url), join(pkg, 'scripts', 'codemod-0.3.mjs'))
  writeFileSync(join(pkg, 'registry', 'components', 'X', 'X.astro'), '<div class="bg-accent" />')
  mkdirSync(join(root, 'src'), { recursive: true })
  writeFileSync(join(root, 'src', 'Page.astro'), '<div class="bg-accent" />')
  execFileSync(process.execPath, [join(pkg, 'scripts', 'codemod-0.3.mjs')], { cwd: root })
  assert.equal(readFileSync(join(root, 'src', 'Page.astro'), 'utf8'), '<div class="bg-primary" />')
  assert.equal(readFileSync(join(pkg, 'registry', 'components', 'X', 'X.astro'), 'utf8'), '<div class="bg-accent" />')
})
