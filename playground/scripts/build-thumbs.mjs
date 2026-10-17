#!/usr/bin/env node
// Overview thumbnails: one light and one dark picture of every docs page that sits
// under a category overview. Pages and blocks are shot from their /examples route
// (top of the page at desktop width); components from the first live <Preview> on
// their docs page. Needs the dev server running.
//   node scripts/build-thumbs.mjs [base-url] [only-id-prefix]
// Writes public/thumbs/<id>.<theme>.webp at 640px wide, and src/components/thumbs.json.

import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const docs = join(root, 'src', 'content', 'docs')
const out = join(root, 'public', 'thumbs')
const [base = 'http://localhost:4321', only = ''] = process.argv.slice(2)

// Every docs file: its id, its group, and the example it previews (if any).
const walk = (dir, pre = '') => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f)
  return statSync(p).isDirectory() ? walk(p, `${pre}${f}/`) : f.endsWith('.mdx') ? [{ id: `${pre}${f.replace(/\.mdx$/, '')}`, src: readFileSync(p, 'utf8') }] : []
})
const entries = walk(docs).map(({ id, src }) => ({
  id,
  group: src.match(/^group:\s*(.+)$/m)?.[1]?.trim(),
  example: src.match(/<PagePreview slug="([^"]+)"/)?.[1],
  hasPreview: src.includes('<Preview'),
}))
// Groups that have an overview page (a page that renders DocsIndex).
const overviewGroups = new Set(walk(docs).filter((d) => d.src.includes('<DocsIndex')).map((d) => d.src.match(/<DocsIndex group="([^"]+)"/)?.[1]))
const todo = entries.filter((e) => overviewGroups.has(e.group) && (e.example || e.hasPreview) && e.id.startsWith(only))

mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
const W = 1280, H = 960
let done = 0, failed = []
for (const theme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, colorScheme: theme, deviceScaleFactor: 2 })
  await page.addInitScript(() => addEventListener('DOMContentLoaded', () => document.head.insertAdjacentHTML('beforeend', '<style>astro-dev-toolbar{display:none!important}</style>')))
  for (const e of todo) {
    const file = join(out, `${e.id.replaceAll('/', '__')}.${theme}.webp`)
    try {
      let shot
      if (e.example) {
        await page.goto(`${base}/examples/${e.example}`, { waitUntil: 'networkidle', timeout: 30000 })
        await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
        await page.waitForTimeout(300)
        shot = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H } })
      } else {
        await page.goto(`${base}/docs/${e.id}`, { waitUntil: 'networkidle', timeout: 30000 })
        await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
        await page.waitForTimeout(300)
        // Shoot only what the example draws: the box around the live area's children, plus air.
        const box = await page.evaluate(() => {
          const live = document.querySelector('[data-preview-live]')
          const kids = [...live.children].filter((k) => getComputedStyle(k).position !== 'fixed' && k.getBoundingClientRect().width > 0)
          const r = kids.map((k) => k.getBoundingClientRect())
          const x0 = Math.min(...r.map((b) => b.left)), y0 = Math.min(...r.map((b) => b.top)), x1 = Math.max(...r.map((b) => b.right)), y1 = Math.max(...r.map((b) => b.bottom))
          return { x: x0 - 16 + scrollX, y: y0 - 16 + scrollY, width: x1 - x0 + 32, height: y1 - y0 + 32 }
        })
        shot = await page.screenshot({ clip: box, fullPage: true })
      }
      // Fit into a 4:3 frame on the page colour, so every card has the same shape.
      // The pad colour is the shot's own corner pixel (the page colour in that theme).
      const img = sharp(shot)
      const [r, g, b] = await sharp(shot).extract({ left: 8, top: 8, width: 1, height: 1 }).raw().toBuffer()
      const bg = { r, g, b }
      const pic = e.example ? img.resize(640, 480, { fit: 'cover', position: 'top' }) : img.resize(576, 416, { fit: 'inside', withoutEnlargement: true })
      const buf = await pic.png().toBuffer()
      const meta = await sharp(buf).metadata()
      await sharp({ create: { width: 640, height: 480, channels: 3, background: bg } })
        .composite([{ input: buf, left: Math.round((640 - meta.width) / 2), top: e.example ? 0 : Math.round((480 - meta.height) / 2) }])
        .webp({ quality: 72 })
        .toFile(file)
      done++
    } catch (err) {
      failed.push(`${e.id} (${theme}): ${err.message.split('\n')[0]}`)
    }
  }
  await page.close()
}
await browser.close()
// The list of ids that have both pictures, for the overview grid (src/components/thumbs.json).
const have = readdirSync(out).filter((f) => f.endsWith('.light.webp')).map((f) => f.replace('.light.webp', '')).filter((n) => readdirSync(out).includes(`${n}.dark.webp`)).map((n) => n.replaceAll('__', '/')).sort()
writeFileSync(join(root, 'src', 'components', 'thumbs.json'), JSON.stringify(have, null, 1) + '\n')
console.log(`thumbs: ${done} written to public/thumbs, ${failed.length} failed`)
if (failed.length) console.log(failed.slice(0, 20).join('\n'))
