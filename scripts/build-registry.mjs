#!/usr/bin/env node
// Generates registry/index.json — the manifest the CLI's `add` reads.
// Scans each component dir, parses imports to find sibling-component deps
// (`../Name/Name.astro`) and npm deps (bare, non-Astro specifiers). Pages
// (registry/pages/<category>/<Name>.astro) and blocks (registry/blocks/…, one
// part of a page such as a banner) are one entry per file, keyed
// `<category>/<slug>`, with the title and description from their doc comment.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const componentsRoot = join(root, 'registry', 'components')
const sectionsRoot = join(root, 'registry', 'sections')

const IMPORT_RE = /(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/g

const listDirs = (rootDir) => (existsSync(rootDir) ? readdirSync(rootDir).filter((d) => statSync(join(rootDir, d)).isDirectory()) : [])
// Components ship as `Name/File`; sections as `sections/Name/File` so the CLI keeps them apart.
const entries = [
  ...listDirs(componentsRoot).map((dir) => ({ dir, kind: 'component', dirPath: join(componentsRoot, dir), prefix: '' })),
  ...listDirs(sectionsRoot).map((dir) => ({ dir, kind: 'section', dirPath: join(sectionsRoot, dir), prefix: 'sections/' })),
]

// ../../components/Button/Button.astro -> Button; npm specifiers -> npm deps.
const depsOf = (src, self) => {
  const registryDeps = new Set()
  const npmDeps = new Set()
  for (const m of src.matchAll(IMPORT_RE)) {
    const spec = m[1] ?? m[2]
    if (!spec) continue
    if (spec.startsWith('../') && (spec.endsWith('.astro') || spec.endsWith('.ts'))) {
      const depDir = spec.split('/').at(-2)
      if (depDir && depDir !== self) registryDeps.add(depDir)
    } else if (!spec.startsWith('.') && !spec.startsWith('/') && !spec.startsWith('astro')) {
      npmDeps.add(spec) // e.g. @lucide/astro (astro:*, astro/* are built in)
    }
  }
  return { registryDeps, npmDeps }
}

const components = {}
for (const { dir, kind, dirPath, prefix } of entries) {
  // Component sources: .astro files, plus .ts helpers (the utils pseudo-component). Tests are never shipped.
  const files = readdirSync(dirPath).filter((f) => (f.endsWith('.astro') || f.endsWith('.ts')) && !f.endsWith('.test.mjs'))
  const registryDeps = new Set()
  const npmDeps = new Set()
  let usesJs = false

  for (const file of files) {
    const src = readFileSync(join(dirPath, file), 'utf8')
    if (src.includes('<script')) usesJs = true
    const deps = depsOf(src, dir)
    for (const d of deps.registryDeps) registryDeps.add(d)
    for (const d of deps.npmDeps) npmDeps.add(d)
  }

  components[dir] = {
    name: dir,
    kind,
    files: files.map((f) => `${prefix}${dir}/${f}`).sort(),
    registryDependencies: [...registryDeps].sort(),
    dependencies: [...npmDeps].sort(),
    usesJs,
  }
}

for (const [folder, kind] of [['pages', 'page'], ['blocks', 'block']]) {
  const kindRoot = join(root, 'registry', folder)
  for (const category of listDirs(kindRoot)) {
    for (const file of readdirSync(join(kindRoot, category)).filter((f) => f.endsWith('.astro')).sort()) {
      const src = readFileSync(join(kindRoot, category, file), 'utf8')
      // Kebab case, digits split off too (FeaturedPost01 → featured-post-01).
      const name = `${category}/${file.replace(/\.astro$/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([a-z])([0-9])/g, '$1-$2').toLowerCase()}`
      if (components[name]) throw new Error(`${name}: a page and a block share this name`)
      // First doc-comment line: "Title: description."
      const line = src.match(/\/\*\*\s*\n\s*\*\s*(.+)/)?.[1] ?? ''
      const [title, ...rest] = line.split(': ')
      if (!title || !rest.length) throw new Error(`${name}: doc comment must open with "Title: description."`)
      const { registryDeps, npmDeps } = depsOf(src, null)
      components[name] = {
        name,
        kind,
        category,
        title,
        description: rest.join(': '),
        files: [`${folder}/${category}/${file}`],
        registryDependencies: [...registryDeps].sort(),
        dependencies: [...npmDeps].sort(),
        usesJs: src.includes('<script'),
      }
    }
  }
}

const index = {
  $schema: 'apogee-registry@1',
  tokens: 'registry/tokens/theme.css',
  components,
}

const out = join(root, 'registry', 'index.json')
writeFileSync(out, JSON.stringify(index, null, 2) + '\n')
const counts = Object.values(components).reduce((n, c) => ((n[c.kind] = (n[c.kind] ?? 0) + 1), n), {})
console.log(`Wrote ${out} — ${counts.component ?? 0} components, ${counts.section ?? 0} sections, ${counts.page ?? 0} pages, ${counts.block ?? 0} blocks.`)
