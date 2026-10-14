// Keyboard shortcuts as strings: 'mod+k', 'shift+/', 'escape'. `mod` is Meta on
// macOS and Control elsewhere. Typing targets are ignored by default.
export function parseHotkey(combo: string) {
  const parts = combo.toLowerCase().split('+').map((p) => p.trim())
  const key = parts.pop() ?? ''
  return { key, mod: parts.includes('mod'), shift: parts.includes('shift'), alt: parts.includes('alt') }
}

const isTyping = (t: EventTarget | null) => {
  const el = t as { tagName?: string; isContentEditable?: boolean; closest?: (s: string) => unknown } | null
  if (!el) return false
  const tag = el.tagName ?? ''
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    Boolean(el.isContentEditable) ||
    Boolean(el.closest?.('[contenteditable]'))
  )
}

export function detectMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac/.test(navigator.platform || navigator.userAgent)
}

export function matchesHotkey(e: KeyboardEvent, combo: string, isMac = detectMac(), ignoreInputs = true): boolean {
  const h = parseHotkey(combo)
  if (ignoreInputs && isTyping(e.target)) return false
  const mod = isMac ? e.metaKey : e.ctrlKey
  const other = isMac ? e.ctrlKey : e.metaKey
  return e.key.toLowerCase() === h.key && mod === h.mod && !other && e.shiftKey === h.shift && e.altKey === h.alt
}

export function hotkey(
  combo: string,
  fn: (e: KeyboardEvent) => void,
  opts: { scope?: HTMLElement | Document | undefined; ignoreInputs?: boolean | undefined } = {},
): () => void {
  const scope = opts.scope ?? document
  const onKey = (e: Event) => {
    if (!matchesHotkey(e as KeyboardEvent, combo, detectMac(), opts.ignoreInputs ?? true)) return
    e.preventDefault()
    fn(e as KeyboardEvent)
  }
  scope.addEventListener('keydown', onKey)
  return () => scope.removeEventListener('keydown', onKey)
}
