import { expect, test } from '@playwright/test'

import { seedLearningState } from './fixtures/learning-state'

test('starts the learning route from the selected goal', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Build Mandarin step by step.' }),
  ).toBeVisible()
  await page.getByRole('button', { name: /Prepare for an HSK exam/ }).click()
  await page.getByRole('button', { name: 'Start learning' }).click()

  await expect(page).toHaveURL(/\/learn\?goal=exam-preparation$/)
  await expect(
    page.getByRole('heading', { name: 'HSK 3.0 Level 1' }),
  ).toBeVisible()
  await expect(page.getByText('0% complete')).toBeVisible()
})

test('restores route progress after a reload', async ({ page }) => {
  await seedLearningState(page)
  await page.goto('/learn')

  await expect(page.getByText('75% complete')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Review 1 due item' }),
  ).toBeVisible()

  await page.reload()

  await expect(page.getByText('75% complete')).toBeVisible()
  await expect(page.getByRole('link', { name: 'To revisit: 1' })).toBeVisible()
})

test('resolves a linked mistake through active recall', async ({ page }) => {
  await seedLearningState(page)
  await page.goto('/review')

  await expect(page.getByText('1 due now')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'How do you say “name” in Mandarin?' }),
  ).toBeVisible()
  await page.getByRole('textbox', { name: 'Your answer' }).fill('名字 míngzi')
  await page.getByRole('button', { name: 'Check my answer' }).click()
  await expect(page.getByText('名字 (míngzi) means “name”.')).toBeVisible()
  await expect(page.getByText('名字 míngzi', { exact: true })).toBeVisible()
  await expect(page.getByText('Answer matched', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'My answer matches' }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Review complete')).toBeVisible()

  await page.getByRole('button', { name: 'View mistakes' }).click()
  await page.getByRole('button', { name: 'Resolved', exact: true }).click()

  await expect(page.getByRole('cell', { name: 'Resolved' })).toHaveCount(2)
  await expect(
    page.getByRole('cell', { name: 'How do you say “name” in Mandarin?' }),
  ).toBeVisible()
})

test('keeps an incorrect review answer in the queue', async ({ page }) => {
  await seedLearningState(page)
  await page.goto('/review')

  await page.getByRole('textbox', { name: 'Your answer' }).fill('你好')
  await page.getByRole('button', { name: 'Check my answer' }).click()

  const feedback = page.getByRole('status')
  await expect(feedback).toContainText('Needs more review')
  await expect(feedback).toContainText('did not match the accepted answer')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Review complete')).toBeVisible()

  await page.reload()
  await expect(page.getByText('0 due now')).toBeVisible()
})

test('keeps an uncertain item without showing an error', async ({ page }) => {
  await seedLearningState(page)
  await page.goto('/review')

  await page.getByRole('button', { name: "I don't know yet" }).click()

  const feedback = page.getByRole('status')
  await expect(feedback).toContainText('Scheduled for another look')
  await expect(feedback).toContainText('not a wrong answer')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Review complete')).toBeVisible()

  await page.reload()
  await expect(page.getByText('0 due now')).toBeVisible()
})
