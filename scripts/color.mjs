// OKLCH ⇄ sRGB, WCAG contrast, alpha compositing. No dependencies.
const clamp01 = (x) => Math.min(1, Math.max(0, x))

export function oklchToLinear({ l, c, h }) {
  const hr = (h * Math.PI) / 180
  const a = c * Math.cos(hr)
  const b = c * Math.sin(hr)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b
  const L = l_ ** 3
  const M = m_ ** 3
  const S = s_ ** 3
  return [
    clamp01(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S),
    clamp01(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S),
    clamp01(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S),
  ]
}

export function linearToOklch([r, g, b]) {
  const L = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const M = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const S = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  const l_ = Math.cbrt(L)
  const m_ = Math.cbrt(M)
  const s_ = Math.cbrt(S)
  const l = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
  const c = Math.hypot(a, bb)
  const h = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360
  return { l, c, h: c < 1e-6 ? 0 : h, alpha: 1 }
}

export function oklchToSrgb(color) {
  return oklchToLinear(color).map((v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055))
}

export function parseColor(str) {
  if (typeof str === 'object') return { alpha: 1, ...str }
  const s = String(str).trim()
  const ok = s.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+|none)\s+([\d.]+|none)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i)
  if (ok) {
    const num = (v) => (v === 'none' ? 0 : Number(v))
    let l = ok[1].endsWith('%') ? Number(ok[1].slice(0, -1)) / 100 : Number(ok[1])
    const alpha = ok[4] === undefined ? 1 : ok[4].endsWith('%') ? Number(ok[4].slice(0, -1)) / 100 : Number(ok[4])
    return { l, c: num(ok[2]), h: num(ok[3]), alpha }
  }
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    const srgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    const lin = srgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    return linearToOklch(lin)
  }
  throw new Error(`unrecognised colour: ${str}`)
}

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

// Alpha-composite `fg` over opaque `bg` the way browsers do it (in gamma-encoded
// sRGB, not linear light); returns an opaque OKLCH.
export function composite(fg, bg) {
  const a = fg.alpha ?? 1
  if (a >= 1) return { ...fg, alpha: 1 }
  const f = oklchToSrgb(fg)
  const b = oklchToSrgb(bg)
  return linearToOklch(f.map((v, i) => srgbToLinear(v * a + b[i] * (1 - a))))
}

function luminance(color) {
  const [r, g, b] = oklchToLinear(color)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a, b) {
  const la = luminance(parseColor(a))
  const lb = luminance(parseColor(b))
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

const r4 = (n) => Math.round(n * 10000) / 10000

export function formatOklch({ l, c, h, alpha = 1 }) {
  const base = `${r4(l)} ${r4(c)} ${r4(h)}`
  return alpha >= 1 ? `oklch(${base})` : `oklch(${base} / ${r4(alpha)})`
}

// Pulls a colour inside the sRGB gamut by reducing chroma (lightness and hue
// kept), so the numbers written to CSS are the colours that render.
export function toGamut(color) {
  const inside = (c) => oklchToLinear(c).every((x) => x >= -0.0005 && x <= 1.0005)
  if (inside(color)) return color
  let lo = 0
  let hi = color.c
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (inside({ ...color, c: mid })) lo = mid
    else hi = mid
  }
  return { ...color, c: lo }
}
