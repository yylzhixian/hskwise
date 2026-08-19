import { atom } from 'jotai'
import { atomWithImmer } from 'jotai-immer'

import {
  type LearningCapabilities,
  type MistakeRecord,
  type RecentActivity,
  type ReviewItem,
  type RouteProgress,
} from '../model/learning-state-schema'
import type { LearningGoalId } from '../model/learning-goal'

export type LearningProfileState = {
  version: 1
  goalId: LearningGoalId | null
  currentRouteId: string | null
  recentActivity: RecentActivity[]
}

export type LearningHydrationState = {
  status: 'hydrating' | 'ready' | 'degraded'
  source: 'initial' | 'new' | 'storage' | 'fixture' | 'memory'
  diagnostic: string | null
}

export type ActiveLearningScenario = {
  fixtureId: string | null
  label: string
  capabilities: LearningCapabilities
}

export const defaultCapabilities: LearningCapabilities = {
  audio: 'available',
  microphone: 'prompt',
  storage: 'available',
}

export const learningProfileAtom = atomWithImmer<LearningProfileState>({
  version: 1,
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

export const activeLearningScenarioAtom = atom<ActiveLearningScenario>({
  fixtureId: null,
  label: 'Normal session',
  capabilities: defaultCapabilities,
})

export const learningClockAtom = atom(new Date().toISOString())
