'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import {
  advanceLessonSessionAtom,
  completeLessonMediaAtom,
  retryLessonStepAtom,
  submitLessonAttemptAtom,
} from '../atoms/lesson-action-atoms'
import {
  currentLessonStepAtom,
  lessonFeedbackAtom,
} from '../atoms/lesson-selector-atoms'
import type { LessonFeedback } from '../model/lesson-session-schema'

type SubmitAnswerInput = {
  interactionId: string
  isCorrect: boolean | null
  answer?: unknown
  correctFeedback?: Omit<LessonFeedback, 'kind'>
  incorrectFeedback?: Omit<LessonFeedback, 'kind'>
}

type CompleteMediaInput = {
  mediaId: string
  feedback?: Omit<LessonFeedback, 'kind'>
}

export function useLessonStep() {
  const step = useAtomValue(currentLessonStepAtom)
  const feedback = useAtomValue(lessonFeedbackAtom)
  const submitAttempt = useSetAtom(submitLessonAttemptAtom)
  const retryStep = useSetAtom(retryLessonStepAtom)
  const completeMediaAction = useSetAtom(completeLessonMediaAtom)
  const advanceSession = useSetAtom(advanceLessonSessionAtom)

  const submitAnswer = useCallback(
    (input: SubmitAnswerInput) => {
      if (!step) return
      submitAttempt({
        ...input,
        stepId: step.definition.id,
        now: new Date().toISOString(),
      })
    },
    [step, submitAttempt],
  )

  const completeMedia = useCallback(
    (input: CompleteMediaInput) => {
      if (!step) return
      completeMediaAction({
        ...input,
        stepId: step.definition.id,
        now: new Date().toISOString(),
      })
    },
    [completeMediaAction, step],
  )

  const retry = useCallback(
    () => retryStep(new Date().toISOString()),
    [retryStep],
  )
  const advance = useCallback(
    () => advanceSession(new Date().toISOString()),
    [advanceSession],
  )

  return {
    step,
    feedback,
    submitAnswer,
    completeMedia,
    retry,
    advance,
  }
}
