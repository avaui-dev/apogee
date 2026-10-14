// Edge fades for a scrolling box: which physical side hides content. In RTL
// scrollLeft is ≤ 0 with 0 at the right edge.
export function fadeState(scrollLeft: number, scrollWidth: number, clientWidth: number, rtl: boolean): string {
  const max = scrollWidth - clientWidth
  if (max <= 1) return ''
  const left = rtl ? max + scrollLeft : scrollLeft
  return [left > 1 && 'left', left < max - 1 && 'right'].filter(Boolean).join(' ')
}

export function fadeStateY(scrollTop: number, scrollHeight: number, clientHeight: number): string {
  const max = scrollHeight - clientHeight
  if (max <= 1) return ''
  return [scrollTop > 1 && 'top', scrollTop < max - 1 && 'bottom'].filter(Boolean).join(' ')
}

// Sets `data-fade="left right"` (or "top bottom" for a vertical box) on the
// element as it scrolls and resizes. Pair with
// `data-[fade~=left]:mask-l-from-85% data-[fade~=right]:mask-r-from-85%`.
export function edgeFade(el: HTMLElement, axis: 'x' | 'y' = 'x'): () => void {
  const update = () => {
    el.dataset.fade =
      axis === 'y'
        ? fadeStateY(el.scrollTop, el.scrollHeight, el.clientHeight)
        : fadeState(el.scrollLeft, el.scrollWidth, el.clientWidth, getComputedStyle(el).direction === 'rtl')
  }
  update()
  el.addEventListener('scroll', update, { passive: true })
  const ro = new ResizeObserver(update)
  ro.observe(el)
  return () => {
    el.removeEventListener('scroll', update)
    ro.disconnect()
  }
}
