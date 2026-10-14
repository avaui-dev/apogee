// Pure helpers behind the Apogee CLI, kept separate so they can be tested.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve, join, sep } from 'node:path'

// Match user input (case / hyphen insensitive) to a canonical component name.
export const canonical = (index, input) => {
  const norm = (s) => s.replace(/-/g, '').toLowerCase()
  const target = norm(input)
  return Object.keys(index.components).find((k) => norm(k) === target)
}

// Resolve components + all their registry dependencies (transitive, de-duplicated).
export const resolveDeps = (index, names) => {
  const out = new Set()
  const visit = (name) => {
    if (out.has(name)) return
    out.add(name)
    for (const dep of index.components[name].registryDependencies) visit(dep)
  }
  for (const n of names) visit(n)
  return [...out]
}

// Copy one registry file into the project. Returns 'ok' | 'skip'. Refuses a
// destination outside destRoot so a bad registry entry can never escape.
export const copyInto = (registryDir, relFile, destRoot, overwrite) => {
  // Sections live in registry/sections and keep their `sections/` prefix in the project.
  const src = relFile.startsWith('sections/') ? join(registryDir, relFile) : join(registryDir, 'components', relFile)
  const dest = resolve(destRoot, relFile)
  if (!dest.startsWith(resolve(destRoot) + sep)) {
    throw new Error(`refusing to write outside ${destRoot}: ${relFile}`)
  }
  if (existsSync(dest) && !overwrite) return 'skip'
  mkdirSync(dirname(dest), { recursive: true })
  // In the registry, sections reach components through ../../components/; in a
  // project both live under the same components dir, so that hop goes away.
  const body = readFileSync(src, 'utf8')
  writeFileSync(dest, relFile.startsWith('sections/') ? body.replaceAll('../../components/', '../../') : body)
  return 'ok'
}
