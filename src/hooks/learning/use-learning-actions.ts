'use client'

import { useSetAtom } from 'jotai'

import {
  completeRouteNodeAtom,
  type RecordLearningMistakeInput,
  recordLearningMistakeAtom,
  resetLearningStateAtom,
  startStarterRouteAtom,
} from '@/store/learning/atoms/learning-action-atoms'
import type { LearningGoalId } from '@/store/learning/model/learning-goal'

export function useLearningActions() {
  const completeNode = useSetAtom(completeRouteNodeAtom)
  const recordLearningMistake = useSetAtom(recordLearningMistakeAtom)
  const resetProgress = useSetAtom(resetLearningStateAtom)
  const startStarterRoute = useSetAtom(startStarterRouteAtom)

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
  }
}
