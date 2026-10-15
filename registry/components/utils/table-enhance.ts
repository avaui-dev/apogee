/**
 * Sort and select for a table root (Table, DataGrid). Sort buttons are any
 * `th button[data-sort]`; a column sorts by each cell's `data-value`, else its
 * text, at the same cell index as the header. Numbers sort numerically.
 * Selection: `[data-row]` checkboxes and one `[data-all]` with an
 * indeterminate state.
 */
// A cell reads as a number when it is digits with separators and at most a
// short prefix or suffix ("$12.00", "1,200", "40 %"); anything else is text.
const asNumber = (v: string): number => {
  const t = v.trim()
  if (!/^[^\d-]{0,3}-?\d[\d,]*(\.\d+)?\s*[^\d]{0,3}$/.test(t)) return NaN
  return Number(t.replace(/[^\d.-]/g, ''))
}

/** Sort order for two cell values: numbers by value, text naturally ("item 9" before "item 10"). */
export function compareCells(a: string, b: string): number {
  const na = asNumber(a)
  const nb = asNumber(b)
  if (!isNaN(na) && !isNaN(nb)) return na - nb
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

export function enhanceTable(root: HTMLElement): void {
  const tbody = root.querySelector<HTMLElement>('tbody')
  if (!tbody) return
  const value = (cell: Element | undefined) =>
    (cell as HTMLElement | undefined)?.dataset.value ?? cell?.textContent?.trim() ?? ''

  for (const btn of root.querySelectorAll<HTMLButtonElement>('th button[data-sort]')) {
    btn.addEventListener('click', () => {
      const th = btn.closest('th')!
      const col = (th as HTMLTableCellElement).cellIndex
      const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending'
      for (const h of root.querySelectorAll('th[aria-sort]')) h.setAttribute('aria-sort', 'none')
      for (const b of root.querySelectorAll<HTMLElement>('th button[data-sort]')) b.dataset.sort = 'none'
      th.setAttribute('aria-sort', dir)
      btn.dataset.sort = dir
      const rows = [...tbody.querySelectorAll<HTMLTableRowElement>(':scope > tr')]
      rows.sort((a, b) => {
        const cmp = compareCells(value(a.cells[col]), value(b.cells[col]))
        return dir === 'ascending' ? cmp : -cmp
      })
      for (const r of rows) tbody.appendChild(r)
    })
  }

  const all = root.querySelector<HTMLInputElement>('[data-all]')
  const boxes = () => [...root.querySelectorAll<HTMLInputElement>('[data-row]')]
  all?.addEventListener('change', () => {
    for (const b of boxes()) b.checked = all.checked
    all.indeterminate = false
  })
  root.addEventListener('change', (e) => {
    if (!(e.target as HTMLElement).matches('[data-row]')) return
    const bs = boxes()
    const checked = bs.filter((b) => b.checked).length
    if (all) {
      all.checked = checked === bs.length
      all.indeterminate = checked > 0 && checked < bs.length
    }
  })
}
