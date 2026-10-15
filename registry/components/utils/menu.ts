// Keyboard pattern for a `role="menu"` panel: arrows wrap, Home/End jump.
// Items are the enabled `menuitem`, `menuitemcheckbox` and `menuitemradio` roles that belong to this menu and not to
// a nested one. `menuKeydown` returns true when it handled the key.
export function menuItems(menu: HTMLElement): HTMLElement[] {
  return [...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled]):not([aria-disabled="true"])')].filter(
    (i) => i.closest('[role="menu"]') === menu,
  )
}

export function menuKeydown(e: KeyboardEvent, menu: HTMLElement): boolean {
  const items = menuItems(menu)
  if (!items.length) return false
  const idx = items.indexOf(document.activeElement as HTMLElement)
  const go = (i: number) => {
    e.preventDefault()
    items[i]?.focus()
  }
  if (e.key === 'ArrowDown') go(idx < items.length - 1 ? idx + 1 : 0)
  else if (e.key === 'ArrowUp') go(idx > 0 ? idx - 1 : items.length - 1)
  else if (e.key === 'Home') go(0)
  else if (e.key === 'End') go(items.length - 1)
  else return false
  return true
}

// Native focus restoration only covers a popover opened while no other auto
// popover was open; a submenu, a listbox inside a Popover or a sibling menu
// opened by script gets none. Put focus back on the trigger when the panel
// closes with focus still inside it (or already lost to <body>).
export function restoreFocus(panel: HTMLElement, trigger: HTMLElement): void {
  panel.addEventListener('toggle', (e) => {
    if ((e as ToggleEvent).newState !== 'closed') return
    const active = document.activeElement
    if (!active || active === document.body || panel.contains(active)) trigger.focus()
  })
}
