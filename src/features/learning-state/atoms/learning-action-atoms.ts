import { atom } from 'jotai'

import { starterRoute, starterRouteId } from '@/features/learning-routes/content/hsk3-level-1-starter'
import { getRouteNodes } from '@/features/learning-routes/model/route-schema'

import type { LearningGoalId } from '../model/learning-goal'
import { createEmptyLearningState } from '../model/learning-state'
import type { LearningState } from '../model/learning-state-schema'
import {
  activeLearningScenarioAtom,
  defaultCapabilities,
  learningClockAtom,
  learningHydrationAtom,
  learningProfileAtom,
  mistakesAtom,
  reviewQueueAtom,
  routeProgressAtom,
  type ActiveLearningScenario,
  type LearningHydrationState,
} from './learning-base-atoms'

type HydrateLearningInput = {
  state: LearningState
  now: string
  hydration: LearningHydrationState
  scenario?: ActiveLearningScenario
}

export const hydrateLearningStateAtom = atom(
  null,
  (_get, set, input: HydrateLearningInput) => {
    set(learningProfileAtom, {
      version: input.state.version,
      goalId: input.state.goalId,
      currentRouteId: input.state.currentRouteId,
      recentActivity: input.state.recentActivity,
    })
    set(routeProgressAtom, input.state.routeProgress)
    set(mistakesAtom, input.state.mistakes)
    set(reviewQueueAtom, input.state.reviewQueue)
    set(learningClockAtom, input.now)
    set(
      activeLearningScenarioAtom,
      input.scenario ?? {
        fixtureId: null,
        label: 'Normal session',
        capabilities: defaultCapabilities,
      },
    )
    set(learningHydrationAtom, input.hydration)
  },
)

export const setHydrationDegradedAtom = atom(
  null,
  (get, set, diagnostic: string) => {
    const hydration = get(learningHydrationAtom)
    set(learningHydrationAtom, {
      ...hydration,
      status: 'degraded',
      source: 'memory',
      diagnostic,
    })
  },
)

export const startStarterRouteAtom = atom(
  null,
  (get, set, goalId?: LearningGoalId) => {
    const now = get(learningClockAtom)
    const firstNode = getRouteNodes(starterRoute)[0]

    set(learningProfileAtom, (draft) => {
      draft.goalId = goalId ?? draft.goalId ?? 'guided-hsk-path'
      draft.currentRouteId = starterRouteId
    })
    set(routeProgressAtom, (draft) => {
      draft[starterRouteId] ??= {
        routeId: starterRouteId,
        completedNodeIds: [],
        currentNodeId: firstNode.id,
        startedAt: now,
        updatedAt: now,
      }
    })
  },
)

export const completeRouteNodeAtom = atom(
  null,
  (get, set, nodeId: string) => {
    const nodes = getRouteNodes(starterRoute)
    const nodeIndex = nodes.findIndex((node) => node.id === nodeId)

    if (nodeIndex < 0) return

    const now = get(learningClockAtom)
    const nextNode = nodes[nodeIndex + 1] ?? null
    const completedNode = nodes[nodeIndex]

    set(routeProgressAtom, (draft) => {
      const progress = draft[starterRouteId]

      if (!progress) return
      if (!progress.completedNodeIds.includes(nodeId)) {
        progress.completedNodeIds.push(nodeId)
      }
      progress.currentNodeId = nextNode?.id ?? null
      progress.updatedAt = now
    })
    set(learningProfileAtom, (draft) => {
      draft.recentActivity.unshift({
        id: `activity-${nodeId}-${now}`,
        kind: nextNode ? 'lesson-completed' : 'route-completed',
        label: nextNode
          ? `Completed ${completedNode.shortTitle}`
          : `Completed ${starterRoute.title}`,
        nodeId,
        occurredAt: now,
      })
      draft.recentActivity = draft.recentActivity.slice(0, 6)
    })
  },
)

export const resetLearningStateAtom = atom(null, (_get, set) => {
  const emptyState = createEmptyLearningState()

  set(learningProfileAtom, {
    version: emptyState.version,
    goalId: emptyState.goalId,
    currentRouteId: emptyState.currentRouteId,
    recentActivity: emptyState.recentActivity,
  })
  set(routeProgressAtom, emptyState.routeProgress)
  set(mistakesAtom, emptyState.mistakes)
  set(reviewQueueAtom, emptyState.reviewQueue)
})
