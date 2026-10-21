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

// Anonymous usage events (see docs/telemetry). Off with APOGEE_TELEMETRY=0, with
// DO_NOT_TRACK set, and in CI, where runs would only count build machines.
export const telemetryOff = (env) =>
  ['0', 'false', 'off'].includes(String(env.APOGEE_TELEMETRY ?? '').toLowerCase()) ||
  (!!env.DO_NOT_TRACK && env.DO_NOT_TRACK !== '0') ||
  !!env.CI

// One PostHog capture payload. `$process_person_profile: false` keeps it anonymous:
// PostHog builds no person profile, so a random id is all that ties runs together.
// `$geoip_disable` skips the location lookup PostHog would otherwise run on the IP.
export const telemetryEvent = ({ key, id, command, props = {}, version }) => ({
  api_key: key,
  event: `cli ${command}`,
  distinct_id: id,
  properties: {
    $process_person_profile: false,
    $geoip_disable: true,
    cli_version: version,
    node_version: process.versions.node.split('.')[0],
    os: process.platform,
    ...props,
  },
})

// A stylesheet with Apogee's lines added straight after its Tailwind import: the
// tokens, the skin (if any), and an @source for the components dir. `paths` are
// relative to the stylesheet. Null when there's no Tailwind import or it's done already.
export const wireStyles = (css, paths) => {
  const tw = css.match(/@import\s+["']tailwindcss["'];?/)
  if (!tw || css.includes(paths.tokens)) return null
  const lines = [`@import "${paths.tokens}";`, ...(paths.skin ? [`@import "${paths.skin}";`] : []), `@source "${paths.componentsDir}";`]
  const out = css.replace(tw[0], `${tw[0]}\n${lines.join('\n')}`)
  return out.endsWith('\n') ? out : `${out}\n`
}

// Does a Node version meet an engines range? Handles the forms npm packages use:
// ">=a.b.c" and "^a.b.c", joined by "||". Anything else counts as met (unknown, so don't block).
export const nodeSatisfies = (version, range) => {
  const v = version.replace(/^v/, '').split('.').map(Number)
  const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
  return range.split('||').some((part) => {
    const m = part.trim().match(/^(>=|\^)\s*(\d+)\.(\d+)\.(\d+)$/)
    if (!m) return true
    const min = [Number(m[2]), Number(m[3]), Number(m[4])]
    return cmp(v, min) >= 0 && (m[1] === '>=' || v[0] === min[0])
  })
}
