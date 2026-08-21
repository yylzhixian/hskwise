import { expect, test } from '@playwright/test'

import { seedLearningState } from './fixtures/learning-state'

const routes = [
  { path: '/learn', title: 'Learn | HSKWise' },
  { path: '/mistakes', title: 'Mistakes | HSKWise' },
  { path: '/review', title: 'Review | HSKWise' },
] as const

for (const route of routes) {
  test(`${route.path} stays within the viewport`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })

    await seedLearningState(page)
    await page.goto(route.path)

    await expect(page.locator('main')).toBeVisible()
    await expect(page).toHaveTitle(route.title)
    const hasPageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(hasPageOverflow).toBe(false)
    expect(consoleErrors).toEqual([])

    await page.screenshot({
      animations: 'disabled',
      fullPage: false,
      path: testInfo.outputPath(`${route.path.slice(1)}.png`),
    })
  })
}
