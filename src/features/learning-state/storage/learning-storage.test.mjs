import { describe, expect, test } from 'bun:test'

import { createEmptyLearningState } from '../model/learning-state'
import { createMemoryStorageAdapter } from './memory-storage'
import { loadLearningState, saveLearningState } from './learning-storage'

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

  test('reports unavailable storage without throwing', () => {
    const unavailable = createMemoryStorageAdapter({ unavailable: true })

    expect(loadLearningState(unavailable).kind).toBe('unavailable')
    expect(saveLearningState(unavailable, createEmptyLearningState()).ok).toBe(
      false,
    )
  })
})
