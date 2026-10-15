/**
 * Copy text, also where the Clipboard API is missing (plain-HTTP pages, some
 * in-app browsers): falls back to selecting a hidden textarea and the copy
 * command. Resolves true when the text reached the clipboard.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the selection path
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  // Off screen but selectable; 16px stops iOS from zooming in.
  area.style.cssText = 'position:fixed;inset-block-start:0;inset-inline-start:-9999px;font-size:16px;opacity:0'
  document.body.append(area)
  area.select()
  area.setSelectionRange(0, text.length)
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  area.remove()
  return ok
}
