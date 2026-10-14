// Browser behaviour suite: each test pins a bug the owner or the parity audit
// reported. Runs against the built playground (see playwright.config.mjs).
import { test, expect } from '@playwright/test'

test('docs theme toggle flips data-theme and persists', async ({ page }) => {
  await page.goto('/docs/button')
  const before = await page.evaluate(() => document.documentElement.dataset.theme)
  await page.locator('[data-theme-toggle]:visible').first().click()
  const after = await page.evaluate(() => document.documentElement.dataset.theme)
  expect(after).not.toBe(before)
  expect(await page.evaluate(() => localStorage.getItem('apogee-theme'))).toBe(after)
})

test('segmented control styles exactly one option as selected', async ({ page }) => {
  await page.goto('/docs/segmented-control')
  const first = page.locator('[data-apogee-segmented]').first()
  const selectedCount = () =>
    first.locator('label').evaluateAll((els) => els.filter((el) => getComputedStyle(el).boxShadow !== 'none').length)
  expect(await selectedCount()).toBe(1)
  await first.locator('label').nth(2).click()
  expect(await selectedCount()).toBe(1)
  expect(await first.locator('label').nth(2).evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none')
})

test('tag input adds on Enter and removes on click', async ({ page }) => {
  await page.goto('/docs/tag-input')
  const root = page.locator('.apogee-taginput').first()
  const field = root.locator('.apogee-taginput-field')
  const before = await root.locator('.apogee-tag').count()
  await field.fill('zephyr-wind')
  await field.press('Enter')
  await expect(root.locator('.apogee-tag')).toHaveCount(before + 1)
  await expect(root.locator('input[type="hidden"][value="zephyr-wind"]')).toHaveCount(1)
  await root.locator('.apogee-tag').last().locator('.apogee-tag-remove').click()
  await expect(root.locator('.apogee-tag')).toHaveCount(before)
})

test('carousel next button scrolls the track', async ({ page }) => {
  await page.goto('/docs/carousel')
  const root = page.locator('.apogee-carousel').first()
  const track = root.locator('.apogee-carousel-track')
  expect(await track.evaluate((t) => t.scrollWidth > t.clientWidth)).toBe(true)
  await root.locator('.apogee-carousel-next').click()
  await expect.poll(() => track.evaluate((t) => t.scrollLeft)).toBeGreaterThan(0)
})

test('tag start-slot icon sits inline with the label', async ({ page }) => {
  await page.goto('/docs/tag')
  const tag = page.locator('[data-apogee-tag]', { hasText: 'Email' }).first()
  const chip = await tag.boundingBox()
  const svg = await tag.locator('svg').first().boundingBox()
  expect(svg.y).toBeGreaterThanOrEqual(chip.y - 0.5)
  expect(svg.y + svg.height).toBeLessThanOrEqual(chip.y + chip.height + 0.5)
})

test('rating stars have a 44px hit area on coarse pointers', async ({ browser }) => {
  const ctx = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 800 } })
  const page = await ctx.newPage()
  await page.goto('/docs/rating')
  const box = await page.locator('.apogee-rating label').first().boundingBox()
  expect(box.width).toBeGreaterThanOrEqual(44)
  expect(box.height).toBeGreaterThanOrEqual(44)
  await ctx.close()
})

test('combobox commit dispatches input, change and apogee:combobox-select', async ({ page }) => {
  await page.goto('/docs/combobox')
  const input = page.locator('[role="combobox"]').first()
  await page.evaluate(() => {
    window.__ev = []
    for (const n of ['input', 'change', 'apogee:combobox-select']) document.addEventListener(n, () => window.__ev.push(n), true)
  })
  await input.click()
  await input.press('ArrowDown')
  await input.press('Enter')
  expect(await page.evaluate(() => window.__ev)).toEqual(expect.arrayContaining(['input', 'change', 'apogee:combobox-select']))
  await expect(input).toHaveAttribute('aria-expanded', 'false')
})

test('toast timer pauses while hovered', async ({ page }) => {
  await page.goto('/docs/toast')
  await page.evaluate(() => window.apogeeToast('Hold', { duration: 600 }))
  const toast = page.locator('.apogee-toast').last()
  await toast.hover()
  await page.waitForTimeout(900)
  await expect(toast).toBeVisible()
  await page.mouse.move(0, 0)
  await expect(toast).toBeHidden({ timeout: 1500 })
})

test('a spanning grid item never overflows a phone-width page', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } })
  const page = await ctx.newPage()
  await page.goto('/docs/grid')
  const grid = page.locator('[data-grid-demo]')
  expect(await grid.evaluate((g) => g.scrollWidth <= g.clientWidth + 1)).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)
  await ctx.close()
})

test('pricing toggle swaps the visible price in every tier', async ({ page }) => {
  await page.goto('/showcase/pricing')
  const root = page.locator('[data-apogee-pricing]').first()
  await expect(root.locator('[data-period="monthly"]').first()).toBeVisible()
  await expect(root.locator('[data-period="annual"]').first()).toBeHidden()
  await root.locator('.apogee-pricing-toggle label').nth(1).click()
  await expect(root.locator('[data-period="annual"]').first()).toBeVisible()
  expect(await root.locator('[data-period="monthly"]:visible').count()).toBe(0)
  // A tier without an annual price keeps showing its price.
  const tiers = await root.locator('[data-period="monthly"]').count()
  expect(await root.locator('[data-period]:visible').count()).toBe(tiers)
})
