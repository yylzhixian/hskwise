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
import { useLessonStore } from '../provider/lesson-store-provider'

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
  const store = useLessonStore()
  const step = useAtomValue(currentLessonStepAtom, { store })
  const feedback = useAtomValue(lessonFeedbackAtom, { store })
  const submitAttempt = useSetAtom(submitLessonAttemptAtom, { store })
  const retryStep = useSetAtom(retryLessonStepAtom, { store })
  const completeMediaAction = useSetAtom(completeLessonMediaAtom, { store })
  const advanceSession = useSetAtom(advanceLessonSessionAtom, { store })

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
