import { describe, expect, test } from 'bun:test'

import { submitLearningReviewAtom } from '@/store/learning/atoms/learning-action-atoms'
import {
  dueReviewPromptsAtom,
  persistedLearningStateAtom,
} from '@/store/learning/atoms/learning-selector-atoms'
import { createLearningStore } from '@/store/learning/learning-store'
import { createEmptyLearningState } from '@/store/learning/model/learning-state'
import {
  getReviewRetryDueAt,
  reviewRetryDelayMinutes,
} from '@/store/learning/model/review-schedule'

const dueAt = '2026-08-20T08:00:00.000Z'
const submittedAt = '2026-08-20T08:05:00.000Z'

function createReviewState() {
  const state = createEmptyLearningState()

  state.mistakes.push(
    {
      id: 'mistake:first-words:recall:answer:word.name',
      lessonId: 'first-words',
      nodeId: 'node-first-words',
      stepId: 'recall',
      interactionId: 'recall:answer',
      knowledgeId: 'word.name',
      prompt: 'How do you say name?',
      correction: '名字 (míngzi) means name.',
      occurredAt: dueAt,
      resolved: false,
    },
    {
      id: 'mistake:first-words:recall:answer:word.ask',
      lessonId: 'first-words',
      nodeId: 'node-first-words',
      stepId: 'recall',
      interactionId: 'recall:answer',
      knowledgeId: 'word.ask',
      prompt: 'How do you say ask?',
      correction: '问 (wèn) means to ask.',
      occurredAt: dueAt,
      resolved: false,
    },
  )
  state.reviewQueue.push(
    {
      id: 'review:first-words:recall:answer:word.name',
      lessonId: 'first-words',
      sourceNodeId: 'node-first-words',
      sourceStepId: 'recall',
      sourceInteractionId: 'recall:answer',
      knowledgeId: 'word.name',
      label: 'Recall 名字',
      dueAt,
      status: 'queued',
      attemptCount: 0,
    },
    {
      id: 'review:first-words:recall:answer:word.ask',
      lessonId: 'first-words',
      sourceNodeId: 'node-first-words',
      sourceStepId: 'recall',
      sourceInteractionId: 'recall:answer',
      knowledgeId: 'word.ask',
      label: 'Recall 问',
      dueAt,
      status: 'queued',
      attemptCount: 2,
    },
  )

  return state
}

describe('learning review action', () => {
  test('joins a due review with its exact mistake prompt and correction', () => {
    const store = createLearningStore({ state: createReviewState(), now: dueAt })
    const prompts = store.get(dueReviewPromptsAtom)

    expect(prompts).toHaveLength(2)
    expect(prompts[0].mistake).toMatchObject({
      knowledgeId: 'word.name',
      prompt: 'How do you say name?',
      correction: '名字 (míngzi) means name.',
    })
  })

  test('completes a recalled item and resolves only its linked mistake', () => {
    const store = createLearningStore({ state: createReviewState(), now: dueAt })

    store.set(submitLearningReviewAtom, {
      reviewItemId: 'review:first-words:recall:answer:word.name',
      result: 'recalled',
      now: submittedAt,
    })

    const state = store.get(persistedLearningStateAtom)
    expect(state.reviewQueue[0]).toMatchObject({
      status: 'completed',
      attemptCount: 1,
    })
    expect(state.mistakes[0].resolved).toBe(true)
    expect(state.mistakes[1].resolved).toBe(false)
    expect(state.recentActivity[0]).toMatchObject({
      kind: 'review-completed',
      nodeId: 'node-first-words',
    })
    expect(store.get(dueReviewPromptsAtom)).toHaveLength(1)
  })

  test('keeps an uncertain item queued and delays it by ten minutes', () => {
    const store = createLearningStore({ state: createReviewState(), now: dueAt })

    store.set(submitLearningReviewAtom, {
      reviewItemId: 'review:first-words:recall:answer:word.ask',
      result: 'needs-review',
      now: submittedAt,
    })

    const state = store.get(persistedLearningStateAtom)
    expect(reviewRetryDelayMinutes).toBe(10)
    expect(getReviewRetryDueAt(submittedAt)).toBe(
      '2026-08-20T08:15:00.000Z',
    )
    expect(state.reviewQueue[1]).toMatchObject({
      status: 'queued',
      attemptCount: 3,
      dueAt: '2026-08-20T08:15:00.000Z',
    })
    expect(state.mistakes[1].resolved).toBe(false)
    expect(state.recentActivity).toHaveLength(0)
    expect(store.get(dueReviewPromptsAtom)).toHaveLength(1)
  })

  test('ignores a result submitted for an already completed item', () => {
    const state = createReviewState()
    state.reviewQueue[0].status = 'completed'
    const store = createLearningStore({ state, now: dueAt })

    store.set(submitLearningReviewAtom, {
      reviewItemId: state.reviewQueue[0].id,
      result: 'recalled',
      now: submittedAt,
    })

    expect(store.get(persistedLearningStateAtom).reviewQueue[0].attemptCount).toBe(0)
    expect(store.get(persistedLearningStateAtom).mistakes[0].resolved).toBe(false)
  })
})
