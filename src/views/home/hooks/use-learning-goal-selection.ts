'use client'

import { useState } from 'react'

import {
  isLearningGoalId,
  type LearningGoalId,
} from '@/store/learning/model/learning-goal'

export type { LearningGoalId } from '@/store/learning/model/learning-goal'

export function useLearningGoalSelection() {
  const [selectedGoal, setSelectedGoal] =
    useState<LearningGoalId>('guided-hsk-path')

  function selectGoal(values: string[]) {
    const nextGoal = values[0]

    if (isLearningGoalId(nextGoal)) {
      setSelectedGoal(nextGoal)
    }
  }

  return {
    continueHref: `/learn?goal=${selectedGoal}`,
    selectGoal,
    selectedGoal,
  }
}
