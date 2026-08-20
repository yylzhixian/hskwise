import { describe, expect, test } from 'bun:test'

import { createEmptyLearningState } from '@/store/learning/model/learning-state'
import { createMemoryStorageAdapter } from '@/store/learning/storage/memory-storage'
import {
  loadLearningState,
  saveLearningState,
} from '@/store/learning/storage/learning-storage'

describe('learning storage', () => {
  test('round trips a versioned learning state', () => {
    const adapter = createMemoryStorageAdapter()
    const state = createEmptyLearningState()

    expect(saveLearningState(adapter, state)).toEqual({ ok: true })
    expect(loadLearningState(adapter)).toEqual({ kind: 'loaded', state })
  })

  test('treats corrupt and old data as invalid', () => {
    const corrupt = createMemoryStorageAdapter({ initialValue: '{oops' })
    const oldVersion = createMemoryStorageAdapter({
      initialValue: JSON.stringify({
        ...createEmptyLearningState(),
        version: 0,
      }),
    })

    expect(loadLearningState(corrupt).kind).toBe('invalid')
    expect(loadLearningState(oldVersion).kind).toBe('invalid')
  })

  test('migrates v1 mistakes and review items without discarding progress', () => {
    const v1State = {
      version: 1,
      goalId: 'guided-hsk-path',
      currentRouteId: 'hsk3-level-1-starter',
      routeProgress: {},
      mistakes: [
        {
          id: 'mistake-v1',
          lessonId: 'four-tones',
          nodeId: 'node-four-tones',
          knowledgeId: 'pinyin.tone-shapes.tone3',
          prompt: 'Which tone turns near the bottom?',
          correction: 'The third tone dips and then rises.',
          occurredAt: '2026-08-20T08:00:00.000Z',
          resolved: false,
        },
      ],
      reviewQueue: [
        {
          id: 'review-v1',
          lessonId: 'four-tones',
          sourceNodeId: 'node-four-tones',
          knowledgeId: 'pinyin.tone-shapes.tone3',
          label: 'Third tone',
          dueAt: '2026-08-21T08:00:00.000Z',
          status: 'queued',
          attemptCount: 0,
        },
      ],
      recentActivity: [],
    }
    const adapter = createMemoryStorageAdapter({
      initialValue: JSON.stringify(v1State),
    })
    const result = loadLearningState(adapter)

    expect(result.kind).toBe('loaded')
    if (result.kind === 'loaded') {
      expect(result.state.version).toBe(2)
      expect(result.state.mistakes[0]).toMatchObject({
        id: 'mistake-v1',
        stepId: 'legacy-unlinked',
        interactionId: 'legacy-unlinked',
      })
      expect(result.state.reviewQueue[0]).toMatchObject({
        id: 'review-v1',
        sourceStepId: 'legacy-unlinked',
        sourceInteractionId: 'legacy-unlinked',
      })
    }
  })

  test('reports unavailable storage without throwing', () => {
    const unavailable = createMemoryStorageAdapter({ unavailable: true })

    expect(loadLearningState(unavailable).kind).toBe('unavailable')
    expect(saveLearningState(unavailable, createEmptyLearningState()).ok).toBe(
      false,
    )
  })
})
