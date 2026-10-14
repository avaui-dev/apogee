// A prop value that may change per breakpoint. Tables are generated literals
// (scripts/build-responsive.mjs) so Tailwind sees every class it must emit.
export type Bp = 'base' | 'sm' | 'md' | 'lg' | 'xl'
export type Responsive<T extends string | number | boolean> = T | Partial<Record<Bp, T>>
export type Table<T extends string | number> = Record<Bp, Record<T, string>>

const ORDER = ['base', 'sm', 'md', 'lg', 'xl'] as const

export function responsive<T extends string | number>(value: Responsive<T> | undefined, table: Table<T>): string[] {
  if (value === undefined) return []
  if (typeof value !== 'object') return [table.base[value]]
  const out: string[] = []
  for (const bp of ORDER) {
    const v = value[bp]
    if (v !== undefined) out.push(table[bp][v])
  }
  return out
}
