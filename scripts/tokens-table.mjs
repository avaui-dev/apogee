// scripts/tokens-table.mjs — every token in the tokens file with its light and dark value, for the docs reference.
export function parseTokens(css) {
  const rows = new Map()
  // Unwrap at-rule wrappers so nested blocks read as flat ones (the regex below does not recurse).
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@(media|layer|supports)[^{;]*\{/g, '')
  for (const [, selector, body] of flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = selector.trim()
    const side = /data-theme=['"]dark['"]/.test(sel) ? 'dark' : /^(:root|@theme|html)\b/.test(sel) ? 'light' : null
    if (!side) continue
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      const row = rows.get(name) ?? { name, light: '—', dark: '—' }
      if (row[side] === '—') row[side] = value.trim()
      rows.set(name, row)
    }
  }
  return [...rows.values()]
}
