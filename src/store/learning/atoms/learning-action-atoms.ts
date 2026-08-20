import { atom } from 'jotai'

import { starterRoute, starterRouteId } from '@/learning/routes/content/hsk3-level-1-starter'
import { getRouteNodes } from '@/learning/routes/model/route-schema'

import type { LearningGoalId } from '../model/learning-goal'
import { createEmptyLearningState } from '../model/learning-state'
import type { LearningState } from '../model/learning-state-schema'
import {
  learningClockAtom,
  learningHydrationAtom,
  learningProfileAtom,
  mistakesAtom,
  reviewQueueAtom,
  routeProgressAtom,
  type LearningHydrationState,
} from './learning-base-atoms'

type HydrateLearningInput = {
  state: LearningState
  now: string
  hydration: LearningHydrationState
}

export type RecordLearningMistakeInput = {
  lessonId: string
  nodeId: string
  knowledgeIds: string[]
  prompt: string
  correction: string
  reviewLabel: string
  now: string
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
    const currentProgress = get(routeProgressAtom)[starterRouteId]
    if (!currentProgress || currentProgress.completedNodeIds.includes(nodeId)) {
      return
    }

    const nextNode = nodes[nodeIndex + 1] ?? null
    const completedNode = nodes[nodeIndex]

    set(routeProgressAtom, (draft) => {
      const progress = draft[starterRouteId]

      if (!progress) return
      progress.completedNodeIds.push(nodeId)
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

export const recordLearningMistakeAtom = atom(
  null,
  (_get, set, input: RecordLearningMistakeInput) => {
    const dueAt = new Date(
      Date.parse(input.now) + 24 * 60 * 60 * 1000,
    ).toISOString()

    set(mistakesAtom, (draft) => {
      for (const knowledgeId of input.knowledgeIds) {
        const existing = draft.find(
          (mistake) =>
            !mistake.resolved &&
            mistake.lessonId === input.lessonId &&
            mistake.nodeId === input.nodeId &&
            mistake.knowledgeId === knowledgeId,
        )

        if (existing) {
          existing.prompt = input.prompt
          existing.correction = input.correction
          existing.occurredAt = input.now
          continue
        }

        draft.unshift({
          id: `mistake:${input.lessonId}:${input.nodeId}:${knowledgeId}`,
          lessonId: input.lessonId,
          nodeId: input.nodeId,
          knowledgeId,
          prompt: input.prompt,
          correction: input.correction,
          occurredAt: input.now,
          resolved: false,
        })
      }
    })

    set(reviewQueueAtom, (draft) => {
      for (const knowledgeId of input.knowledgeIds) {
        const exists = draft.some(
          (item) =>
            item.status === 'queued' &&
            item.lessonId === input.lessonId &&
            item.sourceNodeId === input.nodeId &&
            item.knowledgeId === knowledgeId,
        )

        if (exists) continue

        draft.push({
          id: `review:${input.lessonId}:${input.nodeId}:${knowledgeId}`,
          lessonId: input.lessonId,
          sourceNodeId: input.nodeId,
          knowledgeId,
          label: input.reviewLabel,
          dueAt,
          status: 'queued',
          attemptCount: 0,
        })
      }
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
