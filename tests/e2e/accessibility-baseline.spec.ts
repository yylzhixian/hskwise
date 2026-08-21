import { expect, test } from '@playwright/test'

import { seedLearningState } from './fixtures/learning-state'

test('keyboard navigation reveals the skip link', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')

  const skipLink = page.getByRole('link', { name: 'Skip to content' })
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeVisible()
})

test('the active learning destination is exposed to assistive technology', async ({
  page,
}) => {
  await seedLearningState(page)
  await page.goto('/review')

  const visibleNavigation = page.locator('nav[aria-label="Primary"]:visible')
  await expect(visibleNavigation).toHaveCount(1)
  await expect(
    visibleNavigation.getByRole('link', { name: 'Review' }),
  ).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
})
