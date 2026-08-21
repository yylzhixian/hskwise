'use client'

import { useCallback, useState } from 'react'
import { useAtomValue } from 'jotai'

import { useLearningActions } from '@/hooks/learning/use-learning-actions'
import {
  getReviewAcceptedAnswers,
  isReviewAnswerCorrect,
} from '@/lib/learning/review-answer'
import {
  dueReviewPromptsAtom,
  type DueReviewPrompt,
} from '@/store/learning/atoms/learning-selector-atoms'
import type { LearningReviewResult } from '@/store/learning/model/review-schedule'

type ReviewFeedback = {
  ordinal: number
  prompt: DueReviewPrompt
  result: LearningReviewResult
}

export type ReviewAttempt = {
  answer: string
  kind: 'answer' | 'unsure'
}

export function useReviewSession() {
  const duePrompts = useAtomValue(dueReviewPromptsAtom)
  const { submitReview } = useLearningActions()
  const [initialTotal] = useState(duePrompts.length)
  const [processedCount, setProcessedCount] = useState(0)
  const [draftAnswer, setDraftAnswer] = useState('')
  const [attempt, setAttempt] = useState<ReviewAttempt | null>(null)
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null)
  const activePrompt = feedback?.prompt ?? duePrompts[0] ?? null

  const completeReview = useCallback(
    (prompt: DueReviewPrompt, result: LearningReviewResult) => {
      setFeedback({
        ordinal: processedCount + 1,
        prompt,
        result,
      })
      setProcessedCount((count) => count + 1)
      submitReview(prompt.item.id, result)
    },
    [processedCount, submitReview],
  )

  const submitAttempt = useCallback(() => {
    const answer = draftAnswer.trim()
    if (!activePrompt || attempt || feedback || !answer) return
    const acceptedAnswers = activePrompt.mistake
      ? getReviewAcceptedAnswers(activePrompt.mistake)
      : []
    const result = isReviewAnswerCorrect(answer, acceptedAnswers)
      ? 'recalled'
      : 'needs-review'
    setAttempt({ answer, kind: 'answer' })
    completeReview(activePrompt, result)
  }, [activePrompt, attempt, completeReview, draftAnswer, feedback])

  const markUnsure = useCallback(() => {
    if (!activePrompt || attempt || feedback) return
    setAttempt({ answer: '', kind: 'unsure' })
    completeReview(activePrompt, 'needs-review')
  }, [activePrompt, attempt, completeReview, feedback])

  const continueReview = useCallback(() => {
    setFeedback(null)
    setAttempt(null)
    setDraftAnswer('')
  }, [])

  return {
    activePrompt,
    attempt,
    continueReview,
    currentNumber: feedback?.ordinal ?? processedCount + 1,
    draftAnswer,
    dueCount: duePrompts.length,
    feedback: feedback?.result ?? null,
    initialTotal,
    markUnsure,
    processedCount,
    setDraftAnswer,
    submitAttempt,
  }
}
