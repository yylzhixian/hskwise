import { expect, test } from '@playwright/test'

import {
  createCheckpointLearningState,
  createFirstWordsLearningState,
  seedLearningState,
} from './fixtures/learning-state'

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

test('runs every formal v2 lesson url through shared renderers', async ({
  page,
}) => {
  await seedLearningState(page, createFirstWordsLearningState())

  await page.goto('/lessons/first-greeting')
  await expect(
    page.getByRole('heading', { name: 'Two classmates meet before class' }),
  ).toBeVisible()

  await page.goto('/lessons/first-words')
  await expect(
    page.getByRole('heading', { name: 'The words already live in a greeting' }),
  ).toBeVisible()
  await expect(page.getByText('Lesson preview')).toHaveCount(0)

  await page.goto('/lessons/starter-checkpoint')
  await expect(
    page.getByRole('heading', {
      name: 'Bring the first three lessons together',
    }),
  ).toBeVisible()
  await expect(page.getByText('Lesson preview')).toHaveCount(0)
})

test('completes the formal checkpoint and records a missed answer', async ({
  page,
}) => {
  await seedLearningState(page, createCheckpointLearningState())
  await page.goto('/lessons/starter-checkpoint')

  await page.getByRole('button', { name: 'Continue' }).click()
  await page.locator('audio').dispatchEvent('ended')
  await page.getByRole('button', { name: /^Tone 3/ }).click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page
    .getByRole('button', { name: /It asks for the other person's name/ })
    .click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('Try once more')).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()
  await page
    .getByRole('button', { name: /It introduces the speaker's name/ })
    .click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: /你好，林月！我叫安娜。/ }).click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page
    .getByRole('button', { name: 'Drag line 1 to reorder' })
    .dragTo(page.getByRole('button', { name: 'Drag line 3 to reorder' }))
  await page.getByRole('button', { name: 'Check order' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Finish lesson' }).click()
  await page.getByRole('link', { name: 'Return to route' }).click()

  await expect(page).toHaveURL(/\/learn$/)
  await expect(page.getByText('100% complete')).toBeVisible()

  await page.goto('/mistakes')
  await expect(
    page.getByRole('cell', { name: 'What does 叫 do in “我叫安娜”?' }),
  ).toBeVisible()
})

test('bridges a migrated vocabulary lesson to mistakes and route progress', async ({
  page,
}) => {
  await seedLearningState(page, createFirstWordsLearningState())
  await page.goto('/lessons/first-words')

  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page
    .getByRole('button', { name: /It means “to greet.”/ })
    .click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('Try once more')).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()
  await page
    .getByRole('button', { name: /It means “to be called.”/ })
    .click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('audio').dispatchEvent('ended')
  await page.getByRole('button', { name: /^也/ }).click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: 'Reveal the word' }).click()
  await page.getByRole('button', { name: 'I recalled it' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: /^叫/ }).click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Finish lesson' }).click()
  await page.getByRole('link', { name: 'Return to route' }).click()

  await expect(page).toHaveURL(/\/learn$/)
  await expect(page.getByText('75% complete')).toBeVisible()

  await page.goto('/mistakes')
  await expect(
    page.getByRole('cell', { name: 'What does 叫 do in 我叫林月?' }),
  ).toBeVisible()
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
