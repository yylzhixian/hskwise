import { describe, expect, test } from 'bun:test'

import {
  getReviewAcceptedAnswers,
  isReviewAnswerCorrect,
  normalizeReviewAnswer,
} from '@/lib/learning/review-answer'

describe('review answer evaluation', () => {
  test('ignores pinyin tone marks, whitespace, case, and punctuation', () => {
    expect(normalizeReviewAnswer('  MÍNGZI! ')).toBe('mingzi')
    expect(
      isReviewAnswerCorrect('名字, mingzi', ['名字 míngzi']),
    ).toBe(true)
  })

  test('requires an exact normalized accepted answer', () => {
    expect(isReviewAnswerCorrect('你好', ['名字', 'míngzi'])).toBe(false)
    expect(isReviewAnswerCorrect('名字呀', ['名字'])).toBe(false)
    expect(isReviewAnswerCorrect('anything', [])).toBe(false)
  })

  test('extracts conservative candidates for legacy saved mistakes', () => {
    expect(
      getReviewAcceptedAnswers({
        correction: '名字 (míngzi) means “name”.',
      }),
    ).toEqual(['名字', 'míngzi'])
    expect(
      getReviewAcceptedAnswers({
        correction: 'First tone holds one high pitch.',
      }),
    ).toEqual(['First tone', 'Tone 1'])
  })
})
