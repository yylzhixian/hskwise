import { describe, expect, test } from 'bun:test'

import { fourTonesLesson } from '@/courses/pinyin/content/four-tones.ts'
import { toneShapeReviewFixture } from '../../fixtures/pinyin/tone-shape-review-fixture.ts'
import {
  createPinyinRuntimeDefinition,
  pinyinLessonSchema,
} from '@/courses/pinyin/model/pinyin-lesson-schema.ts'
import {
  createTonePath,
  getToneFrequency,
  getTonePlaybackDurationMs,
} from '@/courses/pinyin/model/tone-contour.ts'

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
      'media',
      'continue',
    ])
    expect(runtimeDefinition.steps[1].completionRule).toEqual({
      kind: 'media',
      mediaId: 'four-tones-pitch-guide:pitch-guide',
    })
    expect(runtimeDefinition.steps[4].completionRule).toEqual({
      kind: 'media',
      mediaId:
        'four-tones-pronunciation-practice:pronunciation-practice',
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

  test('requires generated audio placeholders to carry replacement flags', () => {
    const pronunciationStep = fourTonesLesson.steps.find(
      (step) => step.kind === 'pronunciation-practice',
    )

    expect(pronunciationStep?.referenceAudio).toMatchObject({
      contentOrigin: 'generated-placeholder',
      placeholder: true,
      mustReplaceBeforePublish: true,
    })

    const invalidLesson = {
      ...fourTonesLesson,
      steps: fourTonesLesson.steps.map((step) =>
        step.kind === 'pronunciation-practice'
          ? {
              ...step,
              referenceAudio: {
                ...step.referenceAudio,
                mustReplaceBeforePublish: false,
              },
            }
          : step,
      ),
    }
    const result = pinyinLessonSchema.safeParse(invalidLesson)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        'Generated placeholder audio must be marked placeholder and replaced before publish.',
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
