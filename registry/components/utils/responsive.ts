// A prop value that may change per breakpoint. Tables are generated literals
// (scripts/build-responsive.mjs) so Tailwind sees every class it must emit.
export type Bp = 'base' | 'sm' | 'md' | 'lg' | 'xl'
export type Responsive<T extends string | number | boolean> = T | Partial<Record<Bp, T>>
export type Table<T extends string | number> = Record<Bp, Record<T, string>>

const ORDER = ['base', 'sm', 'md', 'lg', 'xl'] as const

// Booleans read the table's 'true' / 'false' rows (wrap, for one).
type Key<T> = T extends boolean ? `${T}` : T

export function responsive<T extends string | number | boolean>(value: Responsive<T> | undefined, table: Table<Key<T> & (string | number)>): string[] {
  if (value === undefined) return []
  const cell = (bp: Bp, v: T) => table[bp][(typeof v === 'boolean' ? String(v) : v) as Key<T> & (string | number)]
  if (typeof value !== 'object') return [cell('base', value)]
  const out: string[] = []
  for (const bp of ORDER) {
    const v = value[bp]
    if (v !== undefined) out.push(cell(bp, v))
  }
  return out
}
