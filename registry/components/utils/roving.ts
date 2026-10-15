// One keystroke on a horizontal row of controls (tabs, toggle group): the index
// to move to, wrapping at the ends, or null for any other key. The caller
// decides what moving means (focus only, or focus + select).
export function stepIndex(
  key: string,
  current: number,
  last: number,
  rtl = false,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
): number | null {
  const vertical = orientation === 'vertical'
  const forward = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
  const back = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
  if (key === forward) return current >= last ? 0 : current + 1
  if (key === back) return current <= 0 ? last : current - 1
  if (key === 'Home') return 0
  if (key === 'End') return last
  return null
}

// One tab stop across a row of controls; arrows, Home and End move it. The
// stop starts on the first selected item (aria-pressed / aria-selected /
// aria-checked), else the first enabled one.
export function rovingTabindex(root: HTMLElement, opts: { selector: string; loop?: boolean | undefined }): void {
  const all = () => [...root.querySelectorAll<HTMLElement>(opts.selector)]
  const items = () => all().filter((el) => !(el as HTMLButtonElement).disabled && el.getAttribute('aria-disabled') !== 'true')
  const rove = (target: HTMLElement) => {
    for (const el of all()) el.tabIndex = el === target ? 0 : -1
  }
  const list = items()
  const first =
    list.find((el) => ['aria-pressed', 'aria-selected', 'aria-checked'].some((a) => el.getAttribute(a) === 'true')) ?? list[0]
  if (first) rove(first)
  root.addEventListener('focusin', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(opts.selector)
    if (el && root.contains(el)) rove(el)
  })
  root.addEventListener('keydown', (e) => {
    const row = items()
    const i = row.indexOf(document.activeElement as HTMLElement)
    if (i < 0) return
    const n = stepIndex(e.key, i, row.length - 1, getComputedStyle(root).direction === 'rtl')
    if (n === null) return
    if (opts.loop === false && ((e.key === 'ArrowRight' && n < i) || (e.key === 'ArrowLeft' && n > i))) return
    e.preventDefault()
    rove(row[n]!)
    row[n]!.focus()
  })
}
