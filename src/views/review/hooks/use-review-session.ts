'use client'

import { useCallback, useState } from 'react'
import { useAtomValue } from 'jotai'

import { useLearningActions } from '@/hooks/learning/use-learning-actions'
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

export function useReviewSession() {
  const duePrompts = useAtomValue(dueReviewPromptsAtom)
  const { submitReview } = useLearningActions()
  const [initialTotal] = useState(duePrompts.length)
  const [processedCount, setProcessedCount] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null)
  const activePrompt = feedback?.prompt ?? duePrompts[0] ?? null

  const revealAnswer = useCallback(() => setIsRevealed(true), [])

  const assess = useCallback(
    (result: LearningReviewResult) => {
      if (!activePrompt || feedback || !isRevealed) return

      setFeedback({
        ordinal: processedCount + 1,
        prompt: activePrompt,
        result,
      })
      setProcessedCount((count) => count + 1)
      submitReview(activePrompt.item.id, result)
    }, [activePrompt, feedback, isRevealed, processedCount, submitReview],
  )

  const continueReview = useCallback(() => {
    setFeedback(null)
    setIsRevealed(false)
  }, [])

  return {
    activePrompt,
    assess,
    continueReview,
    currentNumber: feedback?.ordinal ?? processedCount + 1,
    dueCount: duePrompts.length,
    feedback: feedback?.result ?? null,
    initialTotal,
    isRevealed,
    processedCount,
    revealAnswer,
  }
}
