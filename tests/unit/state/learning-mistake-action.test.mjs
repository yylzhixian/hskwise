import { describe, expect, test } from 'bun:test'

import { recordLearningMistakeAtom } from '@/store/learning/atoms/learning-action-atoms'
import { persistedLearningStateAtom } from '@/store/learning/atoms/learning-selector-atoms'
import { createLearningStore } from '@/store/learning/learning-store'

describe('learning mistake action', () => {
  test('records mistakes and queues one future review per knowledge item', () => {
    const store = createLearningStore({ now: '2026-08-20T08:00:00.000Z' })
    const input = {
      lessonId: 'four-tones',
      nodeId: 'node-four-tones',
      knowledgeIds: [
        'pinyin.tone-shapes.tone3',
        'pinyin.tone-shapes.tone4',
      ],
      prompt: 'Which tone falls directly from high to low?',
      correction: 'The fourth tone falls without turning upward.',
      reviewLabel: 'Separate falling from dipping',
      now: '2026-08-20T08:05:00.000Z',
    }

    store.set(recordLearningMistakeAtom, input)
    store.set(recordLearningMistakeAtom, {
      ...input,
      now: '2026-08-20T08:06:00.000Z',
    })

    const state = store.get(persistedLearningStateAtom)
    expect(state.mistakes).toHaveLength(2)
    expect(state.reviewQueue).toHaveLength(2)
    expect(state.mistakes.every((mistake) => !mistake.resolved)).toBe(true)
    expect(state.mistakes[0].occurredAt).toBe('2026-08-20T08:06:00.000Z')
    expect(state.reviewQueue[0]).toMatchObject({
      lessonId: 'four-tones',
      sourceNodeId: 'node-four-tones',
      dueAt: '2026-08-21T08:05:00.000Z',
      status: 'queued',
      attemptCount: 0,
    })
  })
})
