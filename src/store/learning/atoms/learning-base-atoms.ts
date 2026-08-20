import { atom } from 'jotai'
import { atomWithImmer } from 'jotai-immer'

import {
  learningStateVersion,
  type MistakeRecord,
  type RecentActivity,
  type ReviewItem,
  type RouteProgress,
} from '../model/learning-state-schema'
import type { LearningGoalId } from '../model/learning-goal'

export type LearningProfileState = {
  version: typeof learningStateVersion
  goalId: LearningGoalId | null
  currentRouteId: string | null
  recentActivity: RecentActivity[]
}

export type LearningHydrationState = {
  status: 'hydrating' | 'ready' | 'degraded'
  source: 'initial' | 'new' | 'storage' | 'memory'
  diagnostic: string | null
}

export const learningProfileAtom = atomWithImmer<LearningProfileState>({
  version: learningStateVersion,
  goalId: null,
  currentRouteId: null,
  recentActivity: [],
})

export const routeProgressAtom = atomWithImmer<Record<string, RouteProgress>>(
  {},
)

export const mistakesAtom = atomWithImmer<MistakeRecord[]>([])
export const reviewQueueAtom = atomWithImmer<ReviewItem[]>([])

export const learningHydrationAtom = atom<LearningHydrationState>({
  status: 'hydrating',
  source: 'initial',
  diagnostic: null,
})

export const learningClockAtom = atom(new Date().toISOString())
