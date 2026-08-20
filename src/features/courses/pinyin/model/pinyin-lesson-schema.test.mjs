import { describe, expect, test } from 'bun:test'

import { fourTonesLesson } from '../content/four-tones.ts'
import { toneShapeReviewFixture } from '../fixtures/tone-shape-review-fixture.ts'
import {
  createPinyinRuntimeDefinition,
  pinyinLessonSchema,
} from './pinyin-lesson-schema.ts'
import {
  createTonePath,
  getToneFrequency,
  getTonePlaybackDurationMs,
} from './tone-contour.ts'

describe('pinyin lesson schema', () => {
  test('projects semantic pinyin steps into the shared lesson runtime', () => {
    const runtimeDefinition = createPinyinRuntimeDefinition(fourTonesLesson)

    expect(runtimeDefinition.id).toBe('four-tones')
    expect(runtimeDefinition.nodeId).toBe('node-four-tones')
    expect(runtimeDefinition.steps.map((step) => step.completionRule.kind)).toEqual([
      'continue',
      'media',
      'interaction',
      'interaction',
      'continue',
    ])
    expect(runtimeDefinition.steps[1].completionRule).toEqual({
      kind: 'media',
      mediaId: 'four-tones-pitch-guide:pitch-guide',
    })
  })

  test('validates a second unpublished lesson with the same protocol', () => {
    expect(toneShapeReviewFixture.schemaVersion).toBe('pinyinLesson/v1')
    expect(toneShapeReviewFixture.steps).toHaveLength(3)
    expect(pinyinLessonSchema.safeParse(toneShapeReviewFixture).success).toBe(true)
  })

  test('rejects duplicate tones and a missing correct choice', () => {
    const invalidLesson = {
      ...fourTonesLesson,
      tones: [
        fourTonesLesson.tones[0],
        fourTonesLesson.tones[0],
        fourTonesLesson.tones[2],
        fourTonesLesson.tones[3],
      ],
      steps: fourTonesLesson.steps.map((step) =>
        step.kind === 'tone-choice'
          ? { ...step, correctToneNumber: 1, optionToneNumbers: [2, 3, 4] }
          : step,
      ),
    }

    const result = pinyinLessonSchema.safeParse(invalidLesson)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        'A pinyin tone lesson must define tones 1 through 4 once each.',
      )
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        'The correct tone must be included in the options.',
      )
    }
  })
})

describe('tone contour utilities', () => {
  test('centers the first tone and keeps the third tone symmetric', () => {
    expect(createTonePath([5, 5])).toBe('M8 36 L172 36')
    expect(createTonePath([2, 1, 4])).toBe('M8 22 L90 64 L172 22')
  })

  test('keeps path animation synchronized with pitch playback', () => {
    expect(getTonePlaybackDurationMs([5, 5])).toBe(800)
    expect(getTonePlaybackDurationMs([2, 1, 4])).toBe(1600)
  })

  test('maps higher pitch levels to higher frequencies', () => {
    expect(getToneFrequency(5)).toBeGreaterThan(getToneFrequency(1))
  })
})
