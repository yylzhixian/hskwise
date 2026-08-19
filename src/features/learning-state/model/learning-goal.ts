export const learningGoalIds = [
  'guided-hsk-path',
  'exam-preparation',
  'find-my-level',
] as const

export type LearningGoalId = (typeof learningGoalIds)[number]

export function isLearningGoalId(
  value: string | undefined,
): value is LearningGoalId {
  return learningGoalIds.some((goalId) => goalId === value)
}
