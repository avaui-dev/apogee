// Boots an enhancement once per matching element, now and after every Astro
// View Transition. Document-level listeners stay outside `init` (bound once).
export function island<T extends HTMLElement = HTMLElement>(selector: string, init: (root: T) => void): void {
  const run = () => {
    for (const el of document.querySelectorAll<T>(selector)) {
      if (el.dataset.apogeeReady) continue
      el.dataset.apogeeReady = 'true'
      init(el)
    }
  }
  run()
  document.addEventListener('astro:page-load', run)
}
