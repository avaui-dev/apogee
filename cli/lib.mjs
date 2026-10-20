// Pure helpers behind the Apogee CLI, kept separate so they can be tested.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve, join, sep } from 'node:path'
import { createHash } from 'node:crypto'

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

// A registry file as it lands in a project. Sections, pages, blocks and layouts
// live in registry/<kind>/ and keep that prefix; in the registry they reach
// components through ../../components/, in a project everything shares one
// components dir, so that hop goes away.
export const rendered = (registryDir, relFile) => {
  const nested = ['sections/', 'pages/', 'blocks/', 'layouts/'].some((p) => relFile.startsWith(p))
  const body = readFileSync(nested ? join(registryDir, relFile) : join(registryDir, 'components', relFile), 'utf8')
  return nested ? body.replaceAll('../../components/', '../../') : body
}

// Where a registry file lands. Refuses a destination outside destRoot so a bad
// registry entry can never escape.
export const destOf = (relFile, destRoot) => {
  const dest = resolve(destRoot, relFile)
  if (!dest.startsWith(resolve(destRoot) + sep)) throw new Error(`refusing to write outside ${destRoot}: ${relFile}`)
  return dest
}

// Copy one registry file into the project. Returns 'ok' | 'skip'.
export const copyInto = (registryDir, relFile, destRoot, overwrite) => {
  const dest = destOf(relFile, destRoot)
  if (existsSync(dest) && !overwrite) return 'skip'
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, rendered(registryDir, relFile))
  return 'ok'
}

export const sha = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)

// How a project file relates to the package, given the hash recorded when Apogee
// last wrote it: who moved since then, you (edited), the package (outdated), or both.
export const fileStatus = (current, recorded, upstream) => {
  if (current === upstream) return 'current'
  if (!recorded) return 'unknown'
  const mine = sha(current) !== recorded
  const theirs = sha(upstream) !== recorded
  return mine && theirs ? 'conflict' : mine ? 'edited' : 'outdated'
}

// Copy a skin file (registry/tokens/skin-<name>.css) next to the tokens file:
// src/styles/apogee.css → src/styles/apogee-skin-<name>.css. Returns the written path.
export const copySkin = (registryDir, name, tokensPath) => {
  const src = join(registryDir, 'tokens', `skin-${name}.css`)
  if (!existsSync(src)) throw new Error(`unknown skin ${name}`)
  const base = tokensPath.replace(/\.css$/, '')
  const dest = `${base}-skin-${name}.css`
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, readFileSync(src, 'utf8'))
  return dest
}
