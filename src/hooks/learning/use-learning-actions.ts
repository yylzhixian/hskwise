'use client'

import { useSetAtom } from 'jotai'

import {
  completeRouteNodeAtom,
  type RecordLearningMistakeInput,
  recordLearningMistakeAtom,
  resetLearningStateAtom,
  startStarterRouteAtom,
  submitLearningReviewAtom,
} from '@/store/learning/atoms/learning-action-atoms'
import type { LearningGoalId } from '@/store/learning/model/learning-goal'
import type { LearningReviewResult } from '@/store/learning/model/review-schedule'

export function useLearningActions() {
  const completeNode = useSetAtom(completeRouteNodeAtom)
  const recordLearningMistake = useSetAtom(recordLearningMistakeAtom)
  const resetProgress = useSetAtom(resetLearningStateAtom)
  const startStarterRoute = useSetAtom(startStarterRouteAtom)
  const submitLearningReview = useSetAtom(submitLearningReviewAtom)

  return {
    completeNode,
    recordMistake: (
      input: Omit<RecordLearningMistakeInput, 'now'>,
    ) =>
      recordLearningMistake({
        ...input,
        now: new Date().toISOString(),
      }),
    resetProgress,
    startStarterRoute: (goalId?: LearningGoalId) => startStarterRoute(goalId),
    submitReview: (reviewItemId: string, result: LearningReviewResult) =>
      submitLearningReview({
        reviewItemId,
        result,
        now: new Date().toISOString(),
      }),
  }
}
