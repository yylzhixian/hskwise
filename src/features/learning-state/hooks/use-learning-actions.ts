'use client'

import { useSetAtom } from 'jotai'

import {
  completeRouteNodeAtom,
  resetLearningStateAtom,
  startStarterRouteAtom,
} from '../atoms/learning-action-atoms'
import type { LearningGoalId } from '../model/learning-goal'

export function useLearningActions() {
  const completeNode = useSetAtom(completeRouteNodeAtom)
  const resetProgress = useSetAtom(resetLearningStateAtom)
  const startStarterRoute = useSetAtom(startStarterRouteAtom)

  return {
    completeNode,
    resetProgress,
    startStarterRoute: (goalId?: LearningGoalId) => startStarterRoute(goalId),
  }
}
