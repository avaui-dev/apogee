// Colour mode on <html>: read, set (persisted, no transition flash), toggle.
// `resolveInverted` gives every `[data-theme-inverted]` the opposite of its
// nearest themed ancestor; Theme.astro calls it once per page load.
export type ThemeMode = 'light' | 'dark'
const STORAGE = 'apogee-theme'

export function getTheme(): ThemeMode {
  const t = document.documentElement.dataset.theme
  if (t === 'dark' || t === 'light') return t
  // No attribute: the stylesheet renders light (there is no prefers-color-scheme block).
  return 'light'
}

export function setTheme(mode: ThemeMode, opts: { persist?: boolean | undefined } = {}): void {
  const html = document.documentElement
  html.classList.add('apogee-no-transitions')
  html.dataset.theme = mode
  if (opts.persist !== false) {
    try {
      localStorage.setItem(STORAGE, mode)
    } catch {
      // Storage blocked: the mode still applies for this page.
    }
  }
  requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove('apogee-no-transitions')))
  resolveInverted(document)
  document.dispatchEvent(new CustomEvent('apogee:theme-change', { bubbles: true, detail: { mode } }))
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

export function resolveInverted(root: ParentNode): void {
  for (const el of root.querySelectorAll<HTMLElement>('[data-theme-inverted]')) {
    const parent = el.parentElement?.closest<HTMLElement>('[data-theme="light"], [data-theme="dark"]')
    const mode = parent ? parent.dataset.theme : getTheme()
    el.dataset.theme = mode === 'dark' ? 'light' : 'dark'
  }
}

// Skins: an optional look (skin-<name>.css) switched on with data-skin on <html>.
const SKIN_STORAGE = 'apogee-skin'

export function getSkin(): string | null {
  return document.documentElement.dataset.skin ?? null
}

export function setSkin(name: string | null, opts: { persist?: boolean | undefined } = {}): void {
  const html = document.documentElement
  if (name) html.dataset.skin = name
  else delete html.dataset.skin
  if (opts.persist !== false) {
    try {
      if (name) localStorage.setItem(SKIN_STORAGE, name)
      else localStorage.removeItem(SKIN_STORAGE)
    } catch {
      // Storage blocked: the skin still applies for this page.
    }
  }
  document.dispatchEvent(new CustomEvent('apogee:skin-change', { bubbles: true, detail: { skin: name } }))
}
