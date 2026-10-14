// One keystroke on a horizontal row of controls (tabs, toggle group): the index
// to move to, wrapping at the ends, or null for any other key. The caller
// decides what moving means (focus only, or focus + select).
export function stepIndex(key: string, current: number, last: number, rtl = false): number | null {
  const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
  const back = rtl ? 'ArrowRight' : 'ArrowLeft'
  if (key === forward) return current >= last ? 0 : current + 1
  if (key === back) return current <= 0 ? last : current - 1
  if (key === 'Home') return 0
  if (key === 'End') return last
  return null
}
