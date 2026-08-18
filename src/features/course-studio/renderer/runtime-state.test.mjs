import { describe, expect, test } from 'bun:test'

import {
  sampleDialogueScene,
  samplePinyinToneScene,
} from '../scene-schema/samples.ts'
import {
  createInteractionAttempt,
  evaluateSceneProgress,
} from './runtime-state.ts'

describe('Course Studio runtime state', () => {
  test('viewed scenes respect minTimelineMs', () => {
    const scene = {
      ...samplePinyinToneScene,
      completionRule: { kind: 'viewed', minTimelineMs: 2_000 },
    }

    expect(progressFor(scene, { maxPlayedTimeMs: 1_999 }).status).toBe('inProgress')
    expect(progressFor(scene, { maxPlayedTimeMs: 2_000 }).status).toBe('completed')
  })

  test('viewed scenes without a threshold complete only at timeline end', () => {
    const scene = {
      ...samplePinyinToneScene,
      completionRule: { kind: 'viewed' },
    }

    expect(progressFor(scene).status).toBe('inProgress')
    expect(progressFor(scene, { timelineComplete: true }).status).toBe('completed')
  })

  test('a completion rule does not complete an unstarted scene', () => {
    const scene = {
      ...samplePinyinToneScene,
      interactions: [],
      completionRule: { kind: 'allRequiredInteractions' },
    }

    expect(progressFor(scene, { started: false }).status).toBe('notStarted')
  })

  test('attempt numbers and latest correctness survive retries', () => {
    const first = createInteractionAttempt([], {
      interactionId: 'quiz_tone_1',
      answer: { optionIds: ['tone_4'] },
      isCorrect: false,
      playheadMs: 3_600,
      submittedAt: '2026-08-17T00:00:00.000Z',
    })
    const second = createInteractionAttempt([first], {
      interactionId: 'quiz_tone_1',
      answer: { optionIds: ['tone_1'] },
      isCorrect: true,
      playheadMs: 3_600,
      submittedAt: '2026-08-17T00:00:01.000Z',
    })
    const scene = {
      ...samplePinyinToneScene,
      completionRule: {
        kind: 'minCorrect',
        interactionIds: ['quiz_tone_1'],
        minCorrect: 1,
      },
    }
    const progress = progressFor(scene, { attempts: [first, second] })

    expect(second.attemptNo).toBe(2)
    expect(progress.status).toBe('completed')
    expect(progress.correctInteractionIds).toEqual(['quiz_tone_1'])
  })

  test('ungraded submissions complete required work without counting as correct', () => {
    const attempt = createInteractionAttempt([], {
      interactionId: 'repeat_line_anna',
      answer: { recording: { durationMs: 1_200 } },
      isCorrect: null,
      playheadMs: 2_400,
      submittedAt: '2026-08-17T00:00:00.000Z',
    })
    const completed = progressFor(sampleDialogueScene, { attempts: [attempt] })
    const minCorrectScene = {
      ...sampleDialogueScene,
      completionRule: {
        kind: 'minCorrect',
        interactionIds: ['repeat_line_anna'],
        minCorrect: 1,
      },
    }

    expect(completed.status).toBe('completed')
    expect(completed.completedInteractionIds).toEqual(['repeat_line_anna'])
    expect(completed.correctInteractionIds).toEqual([])
    expect(progressFor(minCorrectScene, { attempts: [attempt] }).status).toBe(
      'inProgress',
    )
  })
})

function progressFor(scene, overrides = {}) {
  return evaluateSceneProgress({
    sceneId: 'scene_test',
    context: 'learner',
    scene,
    attempts: [],
    maxPlayedTimeMs: 0,
    timelineComplete: false,
    started: true,
    ...overrides,
  })
}
