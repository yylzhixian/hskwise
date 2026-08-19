import { atom } from 'jotai'

import { starterRoute } from '@/features/learning-routes/content/hsk3-level-1-starter'
import {
  deriveRouteOverview,
  getDueReviewItems,
} from '@/features/learning-routes/model/route-progress'

import {
  activeLearningScenarioAtom,
  learningClockAtom,
  learningHydrationAtom,
  learningProfileAtom,
  mistakesAtom,
  reviewQueueAtom,
  routeProgressAtom,
} from './learning-base-atoms'

export const persistedLearningStateAtom = atom((get) => {
  const profile = get(learningProfileAtom)

  return {
    version: profile.version,
    goalId: profile.goalId,
    currentRouteId: profile.currentRouteId,
    routeProgress: get(routeProgressAtom),
    mistakes: get(mistakesAtom),
    reviewQueue: get(reviewQueueAtom),
    recentActivity: profile.recentActivity,
  }
})

export const starterRouteOverviewAtom = atom((get) =>
  deriveRouteOverview(starterRoute, get(persistedLearningStateAtom), get(learningClockAtom)),
)

export const dueReviewItemsAtom = atom((get) =>
  getDueReviewItems(get(reviewQueueAtom), get(learningClockAtom)),
)

export const unresolvedMistakesAtom = atom((get) =>
  get(mistakesAtom).filter((mistake) => !mistake.resolved),
)

export const recentActivityAtom = atom(
  (get) => get(learningProfileAtom).recentActivity,
)

export const hydrationStatusAtom = atom((get) =>
  get(learningHydrationAtom),
)

export const learningScenarioAtom = atom((get) =>
  get(activeLearningScenarioAtom),
)
