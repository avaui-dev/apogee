#!/usr/bin/env node
// AVA kit-contract gate. AVA reads a component's tags (@composable, @children,
// @descendants, @locked) only from the JSDoc directly above `interface Props`
// (astro-visual-admin server/descriptor.mjs, interfaceDocTags). A tag anywhere
// else is invisible to it, so the component silently stays locked. This runs
// the same regex and fails on any file whose tags AVA can't see.
// See docs/11-ava-integration.md.

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TAGS = /@(composable|children|descendants|locked)\b/

// Mirrors interfaceDocTags: the JSDoc block right before `interface|type Props`.
export function propsDoc(source) {
  const m = source.match(/\/\*\*([\s\S]*?)\*\/\s*(?:export\s+)?(?:interface|type)\s+Props\b/)
  if (!m) return null
  // The lazy match can start at an earlier block (the file header); keep the last one.
  return m[1].split('/**').pop()
}

// Every kit tag in the file, minus prop-level docs inside the Props body.
function fileTags(source) {
  const head = source.split(/(?:interface|type)\s+Props\b/)[0]
  return [...head.matchAll(/@(composable|children|descendants|locked)\b/g)].map((m) => m[1])
}

export function check(source) {
  const tags = fileTags(source)
  if (!tags.length) return null
  const doc = propsDoc(source)
  if (doc === null) return 'tags present but no `interface Props` JSDoc for AVA to read'
  const missing = tags.filter((t) => !new RegExp(`@${t}\\b`).test(doc))
  return missing.length ? `@${missing.join(', @')} not in the JSDoc above \`interface Props\`` : null
}

// --- self-check ----------------------------------------------------------
console.assert(check('/** X */\nimport a\ninterface Props {}') === null)
console.assert(check('/**\n * @composable\n */\nimport a\ninterface Props {}') !== null)
console.assert(check('/** head */\nimport a\n/** @composable\n * @children Radio */\ninterface Props {}') === null)
console.assert(check('/** @children li */\nconst x = 1\n/** @composable */\ninterface Props {}') !== null)

// --- run -----------------------------------------------------------------
const walk = (d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith('.astro') ? [join(d, e.name)] : [],
  )

const files = ['components', 'sections'].flatMap((d) => walk(join(root, 'registry', d)))
let bad = 0
const models = []
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  const err = check(src)
  if (err) { bad++; console.error(`✗ ${relative(root, f)}: ${err}`) }
  const doc = propsDoc(src) ?? ''
  const kids = doc.match(/@children\s+([^@]*)/)
  if (kids) models.push(`${relative(join(root, 'registry'), f)} → ${kids[1].replace(/[\s*]+/g, ' ').trim()}`)
}
console.log(`content models (${models.length}):\n  ${models.join('\n  ')}`)
if (bad) { console.error(`\n${bad} file(s) with tags AVA can't read.`); process.exit(1) }
console.log(`✓ ${files.length} files: every kit tag sits where AVA reads it.`)
