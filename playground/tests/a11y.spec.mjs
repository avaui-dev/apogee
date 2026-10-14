// Axe smoke: every docs page, the showcase pages and the RTL page, in both
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

for (const theme of ['light', 'dark']) {
  for (const path of ['/docs', '/rtl', ...pages, ...showcase]) {
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
