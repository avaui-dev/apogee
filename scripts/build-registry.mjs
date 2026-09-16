#!/usr/bin/env node
// Generates registry/index.json — the manifest the CLI's `add` reads.
// Scans each component dir, parses imports to find sibling-component deps
// (`../Name/Name.astro`) and npm deps (bare, non-Astro specifiers).

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const componentsRoot = join(root, 'registry', 'components')

const IMPORT_RE = /(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/g

const dirs = readdirSync(componentsRoot).filter((d) =>
  statSync(join(componentsRoot, d)).isDirectory(),
)

const components = {}
for (const dir of dirs) {
  const dirPath = join(componentsRoot, dir)
  const files = readdirSync(dirPath).filter((f) => f.endsWith('.astro'))
  const registryDeps = new Set()
  const npmDeps = new Set()
  let usesJs = false

  for (const file of files) {
    const src = readFileSync(join(dirPath, file), 'utf8')
    if (src.includes('<script')) usesJs = true
    for (const m of src.matchAll(IMPORT_RE)) {
      const spec = m[1] ?? m[2]
      if (!spec) continue
      if (spec.startsWith('../') && spec.endsWith('.astro')) {
        const depDir = spec.split('/').at(-2) // ../Field/Field.astro -> Field
        if (depDir && depDir !== dir) registryDeps.add(depDir)
      } else if (!spec.startsWith('.') && !spec.startsWith('/') && !spec.startsWith('astro')) {
        npmDeps.add(spec) // e.g. @lucide/astro (astro:*, astro/* are built in)
      }
    }
  }

  components[dir] = {
    name: dir,
    files: files.map((f) => `${dir}/${f}`).sort(),
    registryDependencies: [...registryDeps].sort(),
    dependencies: [...npmDeps].sort(),
    usesJs,
  }
}

const index = {
  $schema: 'apogee-registry@1',
  tokens: 'registry/tokens/theme.css',
  components,
}

const out = join(root, 'registry', 'index.json')
writeFileSync(out, JSON.stringify(index, null, 2) + '\n')
console.log(`Wrote ${out} — ${Object.keys(components).length} components.`)
