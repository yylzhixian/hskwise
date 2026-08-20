import { describe, expect, test } from 'bun:test'

import { firstGreetingLesson } from '@/courses/dialogue/content/first-greeting.ts'
import { getPublishedLesson } from '@/courses/lesson-registry.ts'
import { firstWordsLesson } from '@/courses/vocabulary/content/first-words.ts'
import {
  createVocabularyRuntimeDefinition,
  vocabularyLessonSchema,
} from '@/courses/vocabulary/model/vocabulary-lesson-schema.ts'
import { dailyItemsSample } from '../../fixtures/vocabulary/daily-items-sample.ts'

describe('vocabulary lesson schema', () => {
  test('projects recognition, recall, and application into the shared runtime', () => {
    const runtime = createVocabularyRuntimeDefinition(firstWordsLesson)

    expect(runtime.id).toBe('first-words')
    expect(runtime.nodeId).toBe('node-first-words')
    expect(runtime.steps.map((step) => step.completionRule.kind)).toEqual([
      'continue',
      'continue',
      'interaction',
      'interaction',
      'interaction',
      'interaction',
      'continue',
    ])
    expect(runtime.steps[4].completionRule).toEqual({
      kind: 'interaction',
      interactionId: 'first-words-recall:answer',
      requireCorrect: false,
    })
  })

  test('publishes the first words course through the lesson registry', () => {
    expect(getPublishedLesson('first-words')).toBe(firstWordsLesson)
  })

  test('derives word facts and context from the original dialogue', () => {
    for (const item of firstWordsLesson.vocabulary) {
      const line = firstGreetingLesson.lines.find(
        (candidate) => candidate.id === item.source.lineId,
      )
      const token = line?.tokens.find(
        (candidate) => candidate.id === item.source.tokenId,
      )

      expect(item.source.lessonId).toBe(firstGreetingLesson.id)
      expect(item.text).toBe(token?.text)
      expect(item.pinyin).toBe(token?.pinyin)
      expect(item.meaning).toBe(token?.meaning)
      expect(item.source.contextText).toBe(
        line?.tokens.map((candidate) => candidate.text).join(''),
      )
    }
  })

  test('marks every vocabulary audio cue as a replaceable placeholder', () => {
    expect(
      firstWordsLesson.vocabulary.every(
        (item) =>
          item.audio.contentOrigin === 'generated-placeholder' &&
          item.audio.placeholder &&
          item.audio.mustReplaceBeforePublish,
      ),
    ).toBe(true)
  })

  test('validates a second fixture with a different word count and longer meanings', () => {
    expect(vocabularyLessonSchema.safeParse(dailyItemsSample).success).toBe(true)
    expect(dailyItemsSample.vocabulary).toHaveLength(3)
    expect(firstWordsLesson.vocabulary).toHaveLength(5)
    expect(
      dailyItemsSample.vocabulary.some((item) => item.meaning.length > 45),
    ).toBe(true)
  })

  test('rejects duplicate items, unknown references, and ambiguous choices', () => {
    const invalidLesson = {
      ...dailyItemsSample,
      vocabulary: [
        dailyItemsSample.vocabulary[0],
        {
          ...dailyItemsSample.vocabulary[1],
          source: {
            ...dailyItemsSample.vocabulary[1].source,
            lineId: 'daily-items-line-2',
          },
        },
        dailyItemsSample.vocabulary[0],
        dailyItemsSample.vocabulary[2],
      ],
      steps: dailyItemsSample.steps.map((step) => {
        if (step.kind === 'word-focus') {
          return {
            ...step,
            vocabularyIds: ['daily-book', 'daily-cup', 'missing-word'],
          }
        }
        if (step.kind === 'meaning-choice') {
          return {
            ...step,
            options: step.options.map((option) => ({ ...option, isCorrect: true })),
          }
        }
        return step
      }),
    }
    const result = vocabularyLessonSchema.safeParse(invalidLesson)

    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message)
      expect(messages).toContain('Duplicate vocabulary item id: daily-book')
      expect(messages).toContain('Unknown vocabulary item: missing-word')
      expect(messages).toContain(
        'Context discovery vocabulary must come from one dialogue line.',
      )
      expect(messages).toContain('Vocabulary choice must have exactly one answer.')
    }
  })
})
