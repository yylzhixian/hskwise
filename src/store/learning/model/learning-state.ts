import type { LearningGoalId } from './learning-goal'
import {
  learningStateSchema,
  learningStateVersion,
  type LearningState,
} from './learning-state-schema'

export function createEmptyLearningState(): LearningState {
  return learningStateSchema.parse({
    version: learningStateVersion,
    goalId: null,
    currentRouteId: null,
    routeProgress: {},
    mistakes: [],
    reviewQueue: [],
    recentActivity: [],
  })
}

export function startLearningRoute(
  state: LearningState,
  input: {
    routeId: string
    firstNodeId: string
    now: string
    goalId?: LearningGoalId
  },
): LearningState {
  const nextState = learningStateSchema.parse(state)

  nextState.goalId = input.goalId ?? nextState.goalId ?? 'guided-hsk-path'
  nextState.currentRouteId = input.routeId
  nextState.routeProgress[input.routeId] ??= {
    routeId: input.routeId,
    completedNodeIds: [],
    currentNodeId: input.firstNodeId,
    startedAt: input.now,
    updatedAt: input.now,
  }

  return nextState
}
