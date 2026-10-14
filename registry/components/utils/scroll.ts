// Page scroll lock for custom overlays. Native modal dialogs lock through the
// `body:has(dialog:modal)` rule in the tokens file and never need this.
let locks = 0
export function lockScroll(): void {
  locks += 1
  document.documentElement.setAttribute('data-scroll-locked', '')
}
export function unlockScroll(): void {
  locks = Math.max(0, locks - 1)
  if (!locks) document.documentElement.removeAttribute('data-scroll-locked')
}
