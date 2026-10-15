// Axe smoke: every docs page, the showcase pages, the page and block examples and the RTL page, in both
// themes. Run on demand (`npm run test:a11y`) and in CI; not part of
// prepublishOnly because it downloads a browser.
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readdirSync } from 'node:fs'

const pages = readdirSync('src/content/docs', { recursive: true })
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => `/docs/${f.replace('.mdx', '')}`)
const showcase = readdirSync('src/pages/showcase', { recursive: true })
  .filter((f) => f.endsWith('.astro'))
  .map((f) => `/showcase/${f.replace('.astro', '')}`)
const examples = ['pages', 'blocks'].flatMap((d) => readdirSync(`../registry/${d}`, { recursive: true }))
  .filter((f) => f.endsWith('.astro'))
  .map((f) => `/examples/${f.replace('.astro', '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`)

for (const theme of ['light', 'dark']) {
  for (const path of ['/docs', '/rtl', ...pages, ...showcase, ...examples]) {
    test(`${path} ${theme} has no axe violations`, async ({ page }) => {
      // Theme is applied before first paint (the layout's head script reads this
      // key), so no colour transition is in flight when axe measures.
      await page.addInitScript((t) => localStorage.setItem('apogee-theme', t), theme)
      await page.goto(path)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).exclude('[data-preview-code]').analyze()
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    })
  }
}
