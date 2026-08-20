import { describe, expect, test } from 'bun:test'

import { fourTonesLesson } from '@/courses/pinyin/content/four-tones.ts'
import {
  initialPinyinLessonCheckState,
  reducePinyinLessonCheck,
} from '@/courses/pinyin/model/pinyin-lesson-check.ts'

const lessonCheck = fourTonesLesson.steps.find(
  (step) => step.kind === 'lesson-check',
)

if (!lessonCheck || lessonCheck.kind !== 'lesson-check') {
  throw new Error('Four-tone lesson check fixture is missing.')
}

describe('pinyin lesson check', () => {
  test('keeps the current question locked after an incorrect answer', () => {
    const question = lessonCheck.questions[0]
    const wrongTone = question.optionToneNumbers.find(
      (toneNumber) => toneNumber !== question.correctToneNumber,
    )
    if (!wrongTone) throw new Error('Question needs an incorrect option.')

    let state = reducePinyinLessonCheck(initialPinyinLessonCheckState, {
      type: 'tone.selected',
      toneNumber: wrongTone,
    })
    state = reducePinyinLessonCheck(state, {
      type: 'answer.submitted',
      question,
    })
    const afterAdvance = reducePinyinLessonCheck(state, {
      type: 'question.advanced',
    })

    expect(state.feedback?.kind).toBe('incorrect')
    expect(afterAdvance.questionIndex).toBe(0)
    expect(afterAdvance.answers).toEqual([])
  })

  test('completes only after all five questions are answered correctly', () => {
    let state = initialPinyinLessonCheckState

    lessonCheck.questions.forEach((question, index) => {
      state = reducePinyinLessonCheck(state, {
        type: 'tone.selected',
        toneNumber: question.correctToneNumber,
      })
      state = reducePinyinLessonCheck(state, {
        type: 'answer.submitted',
        question,
      })
      expect(state.feedback?.kind).toBe('correct')
      state = reducePinyinLessonCheck(state, {
        type: 'question.advanced',
      })
      expect(state.questionIndex).toBe(index + 1)
    })

    expect(state.questionIndex).toBe(5)
    expect(state.answers).toEqual([1, 2, 3, 4, 3])
  })
})
