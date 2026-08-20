import { describe, expect, test } from 'bun:test'

import { firstGreetingLesson } from '@/courses/dialogue/content/first-greeting.ts'
import {
  createDialogueRuntimeDefinition,
  dialogueLessonSchema,
} from '@/courses/dialogue/model/dialogue-lesson-schema.ts'
import { getPublishedLesson } from '@/courses/lesson-registry.ts'
import { askingNameSample } from '../../fixtures/dialogue/asking-name-sample.ts'

describe('dialogue lesson schema', () => {
  test('projects dialogue semantics into the shared lesson runtime', () => {
    const runtime = createDialogueRuntimeDefinition(firstGreetingLesson)

    expect(runtime.id).toBe('first-greeting')
    expect(runtime.nodeId).toBe('node-first-greeting')
    expect(runtime.steps.map((step) => step.completionRule.kind)).toEqual([
      'continue',
      'media',
      'interaction',
      'interaction',
      'media',
      'continue',
    ])
    expect(runtime.steps[1].completionRule).toEqual({
      kind: 'media',
      mediaId: 'first-greeting-explore:explore',
    })
    expect(runtime.steps[4].completionRule).toEqual({
      kind: 'media',
      mediaId: 'first-greeting-role-practice:role-practice',
    })
  })

  test('publishes the first greeting through the lesson registry', () => {
    expect(getPublishedLesson('first-greeting')).toBe(firstGreetingLesson)
  })

  test('marks every dialogue audio line as a replaceable placeholder', () => {
    expect(
      firstGreetingLesson.lines.every(
        (line) =>
          line.audio.contentOrigin === 'generated-placeholder' &&
          line.audio.placeholder &&
          line.audio.mustReplaceBeforePublish,
      ),
    ).toBe(true)
  })

  test('validates a second fixture with different roles and line lengths', () => {
    expect(dialogueLessonSchema.safeParse(askingNameSample).success).toBe(true)
    expect(askingNameSample.roles.map((role) => role.id)).toEqual([
      'teacher-wang',
      'david',
    ])
    expect(askingNameSample.lines[1].tokens.length).toBeGreaterThan(
      askingNameSample.lines[0].tokens.length,
    )
  })

  test('rejects unknown speakers, multiple answers, and mismatched order lines', () => {
    const invalidLesson = {
      ...askingNameSample,
      lines: askingNameSample.lines.map((line, index) =>
        index === 0 ? { ...line, speakerId: 'missing-role' } : line,
      ),
      steps: askingNameSample.steps.map((step) => {
        if (step.kind === 'comprehension-choice') {
          return {
            ...step,
            options: step.options.map((option) => ({ ...option, isCorrect: true })),
          }
        }
        if (step.kind === 'line-order') {
          return {
            ...step,
            startingOrder: [
              step.startingOrder[0],
              step.startingOrder[1],
              step.startingOrder[1],
            ],
          }
        }
        return step
      }),
    }
    const result = dialogueLessonSchema.safeParse(invalidLesson)

    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message)
      expect(messages).toContain('Unknown dialogue speaker: missing-role')
      expect(messages).toContain(
        'Dialogue comprehension must have exactly one answer.',
      )
      expect(messages).toContain('Line order must contain the same unique lines twice.')
    }
  })
})
