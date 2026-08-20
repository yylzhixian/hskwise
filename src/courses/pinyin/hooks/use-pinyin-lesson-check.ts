'use client'

import { useCallback, useReducer } from 'react'

import {
  initialPinyinLessonCheckState,
  reducePinyinLessonCheck,
} from '../model/pinyin-lesson-check'
import type {
  PinyinLessonCheckQuestion,
  PinyinTone,
} from '../model/pinyin-lesson-schema'

export function usePinyinLessonCheck({
  onComplete,
  onIncorrect,
  questions,
}: {
  onComplete: (answers: number[]) => void
  onIncorrect: (question: PinyinLessonCheckQuestion) => void
  questions: PinyinLessonCheckQuestion[]
}) {
  const [state, dispatch] = useReducer(
    reducePinyinLessonCheck,
    initialPinyinLessonCheckState,
  )
  const { answers, feedback, questionIndex, selectedToneNumber } = state
  const question = questions[questionIndex]
  const isComplete = questionIndex >= questions.length

  const selectTone = useCallback((values: string[]) => {
    const value = values[0]
    if (!value) return

    const toneNumber = Number(value.replace('tone-', ''))
    if (toneNumber < 1 || toneNumber > 4) return

    dispatch({
      type: 'tone.selected',
      toneNumber: toneNumber as PinyinTone['number'],
    })
  }, [])

  const submit = useCallback(() => {
    if (!question || selectedToneNumber === null) return

    if (selectedToneNumber !== question.correctToneNumber) {
      onIncorrect(question)
    }
    dispatch({ type: 'answer.submitted', question })
  }, [onIncorrect, question, selectedToneNumber])

  const advance = useCallback(() => {
    if (!question || feedback?.kind !== 'correct' || selectedToneNumber === null) {
      return
    }

    const nextAnswers = [...answers, selectedToneNumber]
    const nextQuestionIndex = questionIndex + 1
    dispatch({ type: 'question.advanced' })

    if (nextQuestionIndex === questions.length) onComplete(nextAnswers)
  }, [
    answers,
    feedback?.kind,
    onComplete,
    question,
    questionIndex,
    questions.length,
    selectedToneNumber,
  ])

  return {
    advance,
    feedback,
    isComplete,
    question,
    questionIndex,
    selectTone,
    selectedToneNumber,
    submit,
  }
}
