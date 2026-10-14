// Deterministic ids: a counter per request (key on `Astro.locals`), so a build
// reproduces the same ids and two components on one page never collide.
const counters = new WeakMap<object, number>()
let fallback = 0

export function uid(key: object | undefined, prefix = 'apogee'): string {
  if (!key) return `${prefix}-${++fallback}`
  const n = (counters.get(key) ?? 0) + 1
  counters.set(key, n)
  return `${prefix}-${n}`
}
