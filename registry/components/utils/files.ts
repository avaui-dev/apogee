/**
 * File helpers shared by FileUpload: the `accept` matcher the native picker
 * applies (so dropped files get the same rule) and a readable size.
 */

/** True when `file` matches an `accept` list (`.pdf`, `image/*`, `image/png`); an empty list accepts all. */
export function acceptsFile(accept: string | undefined, file: { name: string; type: string }): boolean {
  const rules = (accept ?? '')
    .split(',')
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean)
  if (rules.length === 0) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule)
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

/** `1536` → `1.5 KB`; one decimal below ten, whole numbers above. */
export function readableSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  const rounded = i === 0 ? Math.round(value) : value < 10 ? Math.round(value * 10) / 10 : Math.round(value)
  return `${rounded} ${units[i]}`
}
