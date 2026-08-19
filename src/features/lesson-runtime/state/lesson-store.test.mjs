import { describe, expect, test } from 'bun:test'

import {
  advanceLessonSessionAtom,
  submitLessonAttemptAtom,
} from '../atoms/lesson-action-atoms.ts'
import {
  currentLessonStepAtom,
  lessonSessionSummaryAtom,
} from '../atoms/lesson-selector-atoms.ts'
import { lessonDefinitionSchema } from '../model/lesson-definition.ts'
import { createLessonStore } from './lesson-store.ts'

const definition = lessonDefinitionSchema.parse({
  id: 'isolated-runtime',
  title: 'Isolated runtime',
  description: 'Verifies store ownership.',
  estimatedMinutes: 1,
  steps: [
    {
      id: 'ready',
      title: 'Ready',
      instruction: 'Continue.',
      completionRule: { kind: 'continue' },
    },
    {
      id: 'answer',
      title: 'Answer',
      instruction: 'Answer correctly.',
      completionRule: {
        kind: 'interaction',
        interactionId: 'answer-one',
        requireCorrect: true,
      },
    },
  ],
})

describe('lesson store', () => {
  test('keeps lesson stores isolated', () => {
    const first = createLessonStore({
      definition,
      now: '2026-08-19T08:00:00.000Z',
      sessionId: 'first-session',
    })
    const second = createLessonStore({
      definition,
      now: '2026-08-19T08:00:00.000Z',
      sessionId: 'second-session',
    })

    first.set(advanceLessonSessionAtom, '2026-08-19T08:01:00.000Z')

    expect(first.get(currentLessonStepAtom)?.definition.id).toBe('answer')
    expect(second.get(currentLessonStepAtom)?.definition.id).toBe('ready')
  })

  test('write atoms accept semantic actions and update narrow selectors', () => {
    const store = createLessonStore({
      definition,
      now: '2026-08-19T08:00:00.000Z',
    })
    store.set(advanceLessonSessionAtom, '2026-08-19T08:01:00.000Z')
    store.set(submitLessonAttemptAtom, {
      stepId: 'answer',
      interactionId: 'answer-one',
      answer: 'yes',
      isCorrect: true,
      now: '2026-08-19T08:02:00.000Z',
    })

    expect(store.get(currentLessonStepAtom)?.session.isReady).toBe(true)
    expect(store.get(lessonSessionSummaryAtom)?.progressPercent).toBe(50)
  })
})
