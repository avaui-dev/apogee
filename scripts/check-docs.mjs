
// scripts/check-docs.mjs — the docs gate: every component page complete against docs/10-component-docs-standard.md.
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SECTIONS = ['Add', 'Usage', 'Anatomy', 'API', 'Variants', 'States', 'Examples', 'Accessibility', 'Tokens', "Do / Don't", 'Content']
export const OPTIONAL = new Set(['Anatomy', 'Variants'])
export const LAYOUT_EXEMPT = new Set(['AspectRatio', 'Box', 'Container', 'ContentWrapper', 'Divider', 'Grid', 'Hidden', 'ScrollArea', 'Section', 'Stack'])
const EXEMPT_SECTIONS = new Set(['States', 'Examples', "Do / Don't", 'Content'])
// ponytail: browser constants (invoker commands) and image-service passthroughs; a row documents them, no preview each.
// ponytail: native passthrough attributes; the row documents them, no preview per value.
export const SKIP_PROPS = new Set(['as', 'type', 'loading', 'decoding'])
export const ENUM_ALLOW = new Set(['Button.command', 'Actionable.command', 'Image.quality', 'Image.format'])

// A class table's keys. Single-line tables (`{ a: 'x', b: 'y' }`) and multi-line ones at two-space indent;
// nested objects are one value's styles, not more values. `path` may be one level deep (`styles.solid`).
const keysOf = (body, indent) => [...body.matchAll(new RegExp(`^ {${indent}}'?([\\w-]+)'?\\s*:`, 'gm'))].map((m) => m[1])
const findTable = (fm, path) => {
  const [name, sub, deeper] = path.split('.')
  if (deeper) return null
  const one = fm.match(new RegExp(`const ${name}\\s*=\\s*\\{([^\\n{}]*)\\}`))
  if (one) return sub ? null : [...one[1].matchAll(/(?:^|[,{])\s*'?([\w-]+)'?\s*:/g)].map((m) => m[1])
  const many = fm.match(new RegExp(`const ${name}\\s*=\\s*\\{\\n([\\s\\S]*?)\\n\\}`))
  if (!many) return null
  if (!sub) return keysOf(many[1], 2)
  const nested = many[1].match(new RegExp(`^ {2}'?${sub}'?:\\s*\\{([^}]*)`, 'm'))
  if (!nested) return null
  return nested[1].includes('\n') ? keysOf(nested[1], 4) : [...nested[1].matchAll(/(?:^|[,{])\s*'?([\w-]+)'?\s*:/g)].map((m) => m[1])
}

export function propsOf(source, resolveImport) {
  const fm = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
  const body = fm.match(/(?:interface Props[^{]*|type Props\s*=[^{]*)\{([\s\S]*?)\n\}/)?.[1] ?? ''
  const imports = [...fm.matchAll(/import \{([^}]+)\} from '([^']+)'/g)]
  const table = (path) => {
    const local = findTable(fm, path)
    if (local) return local
    const name = path.split('.')[0]
    const imp = imports.find((i) => i[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).includes(name))
    const src = imp && resolveImport(imp[2])
    const found = src ? findTable(src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? src, path) : null
    if (!found) console.warn(`warn: unresolved table ${path}`)
    return found ?? []
  }
  const defaults = Object.fromEntries([...(fm.match(/const \{([\s\S]*?)\} = Astro\.props/)?.[1] ?? '').matchAll(/(\w+)\s*=\s*'([\w-]+)'/g)].map((m) => [m[1], m[2]]))
  const out = []
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*(\w+)\??:\s*(.*)$/)
    if (!m || m[1] === 'class') continue
    const [, name, type] = m
    let values = [...type.matchAll(/'([\w-]+)'/g)].map((x) => x[1])
    const kt = type.match(/keyof typeof ([\w.]+)/)?.[1]
    if (kt) values = values.concat(table(kt))
    // Numeric keys are a scale (gap 1–12, column starts), not variants to demo one by one.
    values = values.filter((v) => v !== 'true' && v !== 'false' && !/^\d+$/.test(v))
    out.push({ name, values: [...new Set(values)], ...(defaults[name] ? { default: defaults[name] } : {}) })
  }
  return out
}

export function checkPage({ name, doc, usesJs, files, ids }) {
  const f = []
  const heads = [...doc.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim())
  const std = heads.map((h) => SECTIONS.findIndex((s) => h.startsWith(s))).filter((i) => i >= 0)
  for (const s of SECTIONS) {
    if (OPTIONAL.has(s) || (LAYOUT_EXEMPT.has(name) && EXEMPT_SECTIONS.has(s))) continue
    if (!heads.some((h) => h.startsWith(s))) f.push(`missing section ${s}`)
  }
  for (let i = 1; i < std.length; i++) if (std[i] < std[i - 1]) { f.push(`sections out of order: ${SECTIONS[std[i - 1]]} before ${SECTIONS[std[i]]}`); break }
  const rows = new Set([...doc.matchAll(/^\| `(\w+)`/gm)].map((m) => m[1]))
  const previews = [...doc.matchAll(/<Preview\b[\s\S]*?<\/Preview>/g)].map((m) => m[0]).join(' ')
  for (const { sub, props } of files) {
    for (const { name: p, values, default: def } of props) {
      if (!rows.has(p)) f.push(`no API row for ${sub}.${p}`)
      if (values.length < 2 || SKIP_PROPS.has(p) || ENUM_ALLOW.has(`${sub}.${p}`)) continue
      for (const v of values) {
        if (v === def) continue
        const shown = new RegExp(`${p}=["'{]?\\s*['"]?${v}["'}]`).test(previews) || new RegExp(`'${v}'`).test(previews)
        if (!shown) f.push(`${sub}.${p} value "${v}" not demoed in a <Preview>`)
      }
    }
  }
  if (usesJs && !doc.includes('<JsNote')) f.push('island without <JsNote>')
  const rel = doc.match(/^related:\s*\[([^\]]*)\]/m)
  if (!rel) f.push('related: missing')
  else for (const id of rel[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)) if (!ids.has(id)) f.push(`related: "${id}" is not a component page`)
  return f
}

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const index = JSON.parse(readFileSync(`${root}/registry/index.json`, 'utf8'))
  const comps = Object.entries(index.components).filter(([n, c]) => n !== 'utils' && !(c.files ?? []).some((x) => x.startsWith('sections/')))
  const ids = new Set(comps.map(([n]) => kebab(n)))
  let bad = 0
  for (const [name, c] of comps) {
    const page = `${root}/playground/src/content/docs/${kebab(name)}.mdx`
    if (!existsSync(page)) { console.log(`${kebab(name)}: no page`); bad++; continue }
    const files = (c.files ?? []).filter((x) => x.endsWith('.astro')).map((x) => {
      const path = `${root}/registry/components/${x}`
      const resolveImport = (spec) => { const p = resolve(dirname(path), spec); return existsSync(p) ? readFileSync(p, 'utf8') : null }
      return { sub: x.split('/').pop().replace('.astro', ''), props: propsOf(readFileSync(path, 'utf8'), resolveImport) }
    })
    const findings = checkPage({ name, doc: readFileSync(page, 'utf8'), usesJs: !!c.usesJs, files, ids })
    if (findings.length) { bad++; console.log(`${kebab(name)}:\n  ${findings.join('\n  ')}`) }
  }
  if (bad) { console.error(`docs: ${bad} page(s) with findings`); process.exit(1) }
  console.log(`docs: ${comps.length} pages clean`)
}
