import { describe, expect, test } from 'bun:test'

import { starterCheckpoint } from '@/courses/checkpoint/content/starter-checkpoint.ts'
import {
  checkpointSchema,
  createCheckpointRuntimeDefinition,
} from '@/courses/checkpoint/model/checkpoint-schema.ts'
import { getPublishedLesson } from '@/courses/lesson-registry.ts'
import { getLessonV2Definition } from '@/courses/content/lesson-v2-registry.ts'

describe('checkpoint schema', () => {
  test('keeps the legacy schema as a fixture while publishing checkpoint v2', () => {
    expect(getPublishedLesson('starter-checkpoint')).toBeNull()
    expect(getLessonV2Definition('starter-checkpoint')?.lesson.type).toBe(
      'checkpoint',
    )
    expect(starterCheckpoint.reviewedLessonIds).toEqual([
      'four-tones',
      'first-greeting',
      'first-words',
    ])
    expect(starterCheckpoint.steps.map((step) => step.kind)).toEqual([
      'checkpoint-intro',
      'listening-choice',
      'meaning-choice',
      'dialogue-choice',
      'line-order',
      'checkpoint-summary',
    ])
  })

  test('requires correct answers for all four checkpoint interactions', () => {
    const runtime = createCheckpointRuntimeDefinition(starterCheckpoint)
    const interactionSteps = runtime.steps.filter(
      (step) => step.completionRule.kind === 'interaction',
    )

    expect(interactionSteps).toHaveLength(4)
    expect(
      interactionSteps.every(
        (step) =>
          step.completionRule.kind === 'interaction' &&
          step.completionRule.requireCorrect,
      ),
    ).toBe(true)
  })

  test('retains source lesson, knowledge, step, and interaction identities', () => {
    const questionSteps = starterCheckpoint.steps.filter(
      (step) => 'sourceLessonId' in step,
    )

    expect(questionSteps.every((step) => step.knowledgeIds.length > 0)).toBe(true)
    expect(
      questionSteps.map((step) => ({
        sourceLessonId: step.sourceLessonId,
        stepId: step.id,
        interactionId: `${step.id}:answer`,
      })),
    ).toEqual([
      {
        sourceLessonId: 'four-tones',
        stepId: 'starter-checkpoint-tone',
        interactionId: 'starter-checkpoint-tone:answer',
      },
      {
        sourceLessonId: 'first-words',
        stepId: 'starter-checkpoint-meaning',
        interactionId: 'starter-checkpoint-meaning:answer',
      },
      {
        sourceLessonId: 'first-greeting',
        stepId: 'starter-checkpoint-dialogue',
        interactionId: 'starter-checkpoint-dialogue:answer',
      },
      {
        sourceLessonId: 'first-greeting',
        stepId: 'starter-checkpoint-order',
        interactionId: 'starter-checkpoint-order:answer',
      },
    ])
  })

  test('rejects unreviewed sources, ambiguous answers, and broken order lists', () => {
    const invalid = {
      ...starterCheckpoint,
      steps: starterCheckpoint.steps.map((step) => {
        if (step.kind === 'meaning-choice') {
          return {
            ...step,
            sourceLessonId: 'new-unlearned-lesson',
            options: step.options.map((option) => ({ ...option, isCorrect: true })),
          }
        }
        if (step.kind === 'line-order') {
          return { ...step, startingOrder: step.startingOrder.slice(1) }
        }
        return step
      }),
    }
    const result = checkpointSchema.safeParse(invalid)

    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message)
      expect(messages).toContain(
        'Checkpoint step references an unreviewed lesson: new-unlearned-lesson',
      )
      expect(messages).toContain('Checkpoint choice must have exactly one answer.')
      expect(messages).toContain(
        'Checkpoint order lists must contain every item exactly once.',
      )
    }
  })
})
