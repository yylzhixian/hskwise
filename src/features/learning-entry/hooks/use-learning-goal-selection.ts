'use client'

import { useState } from 'react'

export const learningGoalIds = [
  'guided-hsk-path',
  'exam-preparation',
  'find-my-level',
] as const

export type LearningGoalId = (typeof learningGoalIds)[number]

function isLearningGoalId(value: string | undefined): value is LearningGoalId {
  return learningGoalIds.some((goalId) => goalId === value)
}

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
