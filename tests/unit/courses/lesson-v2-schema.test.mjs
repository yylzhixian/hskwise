import { describe, expect, test } from 'bun:test'

import { auditLessonPublishability } from '@/courses/compiler/audit-lesson-publishability.ts'
import { compileLessonV2 } from '@/courses/compiler/compile-lesson-v2.ts'
import { LessonV2Error } from '@/courses/compiler/lesson-v2-errors.ts'
import {
  parseLessonV2,
  validateLessonV2,
} from '@/courses/compiler/validate-lesson-v2.ts'
import firstGreetingInput from '@/courses/content/lessons/first-greeting.v2.json'
import firstWordsInput from '@/courses/content/lessons/first-words.v2.json'

const firstGreeting = parseLessonV2(firstGreetingInput)
const dependencies = [firstGreeting]

describe('lesson/v2 schema and compiler', () => {
  test('validates both JSON pilots and their cross-lesson vocabulary sources', () => {
    const firstWords = validateLessonV2(firstWordsInput, { dependencies })

    expect(firstGreeting.type).toBe('dialogue')
    expect(firstWords.type).toBe('vocabulary')
    expect(firstWords.resources.lexemes).toHaveLength(5)
    expect(firstWords.resources.lexemes[0].sourceRef?.lessonId).toBe(
      firstGreeting.id,
    )
  })

  test('compiles stable runtime ids without route or component fields', () => {
    const runtime = compileLessonV2(firstGreeting)

    expect(runtime.routeId).toBeUndefined()
    expect(runtime.nodeId).toBeUndefined()
    expect(runtime.steps.map((step) => step.completionRule.kind)).toEqual([
      'continue',
      'media',
      'interaction',
      'interaction',
      'media',
      'continue',
    ])
    expect(runtime.steps[2].completionRule).toEqual({
      kind: 'interaction',
      interactionId:
        'first-greeting-v2-pilot:first-greeting-meaning-check:answer',
      requireCorrect: true,
    })
  })

  test('keeps self-assessment informational and compiles cloze as an answer', () => {
    const runtime = compileLessonV2(firstWordsInput, { dependencies })

    expect(runtime.steps[4].completionRule).toEqual({
      kind: 'interaction',
      interactionId: 'first-words-v2-pilot:first-words-recall:answer',
      requireCorrect: false,
    })
    expect(runtime.steps[5].completionRule).toEqual({
      kind: 'interaction',
      interactionId: 'first-words-v2-pilot:first-words-application:answer',
      requireCorrect: true,
    })
  })

  test('reports an invalid answer at its authoring path', () => {
    const invalid = structuredClone(firstWordsInput)
    invalid.steps[2].answer = 'missing-option'

    expectLessonIssue(
      () => validateLessonV2(invalid, { dependencies }),
      'Answer does not reference an option: missing-option',
      ['steps', 2, 'answer'],
    )
  })

  test('reports broken resource and source references with field paths', () => {
    const invalid = structuredClone(firstWordsInput)
    invalid.resources.lexemes[0].audioRef = 'audio.missing'
    invalid.resources.lexemes[1].sourceRef.tokenId = 'missing-token'

    expectLessonIssue(
      () => validateLessonV2(invalid, { dependencies }),
      'Unknown media resource: audio.missing',
      ['resources', 'lexemes', 0, 'audioRef'],
    )
    expectLessonIssue(
      () => validateLessonV2(invalid, { dependencies }),
      'Unknown source dialogue token: missing-token',
      ['resources', 'lexemes', 1, 'sourceRef', 'tokenId'],
    )
  })

  test('rejects React and runtime implementation fields in course JSON', () => {
    const invalid = structuredClone(firstGreetingInput)
    invalid.steps[0].component = 'DialogueSceneIntro'
    invalid.steps[0].className = 'text-primary'
    invalid.steps[0].interactionId = 'hand-authored-id'

    expectLessonIssue(
      () => parseLessonV2(invalid),
      'Forbidden authoring field: component',
      ['steps', 0, 'component'],
    )
    expectLessonIssue(
      () => parseLessonV2(invalid),
      'Forbidden authoring field: className',
      ['steps', 0, 'className'],
    )
    expectLessonIssue(
      () => parseLessonV2(invalid),
      'Forbidden authoring field: interactionId',
      ['steps', 0, 'interactionId'],
    )
  })

  test('allows draft previews but blocks every placeholder media asset', () => {
    expect(() => compileLessonV2(firstGreeting)).not.toThrow()

    const issues = auditLessonPublishability(firstGreeting)
    const blockedMedia = new Set(
      issues.map((issue) => issue.path.slice(0, 3).join('.')),
    )

    expect(blockedMedia.size).toBe(firstGreeting.resources.media.length)
    expect(
      issues.some((issue) =>
        issue.message.includes('uses non-publishable origin generated-placeholder'),
      ),
    ).toBe(true)
  })
})

function expectLessonIssue(run, message, path) {
  try {
    run()
    throw new Error('Expected lesson validation to fail.')
  } catch (error) {
    expect(error).toBeInstanceOf(LessonV2Error)
    expect(error.issues).toContainEqual({ message, path })
  }
}
