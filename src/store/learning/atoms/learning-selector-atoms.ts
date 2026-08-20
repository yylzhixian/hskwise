import { atom } from 'jotai'

import { starterRoute } from '@/learning/routes/content/hsk3-level-1-starter'
import {
  deriveRouteOverview,
  getDueReviewItems,
} from '@/learning/routes/model/route-progress'
import type {
  MistakeRecord,
  ReviewItem,
} from '../model/learning-state-schema'
import { reviewItemMatchesMistake } from '../model/review-schedule'

import {
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

export type DueReviewPrompt = {
  item: ReviewItem
  mistake: MistakeRecord | null
}

export const dueReviewPromptsAtom = atom<DueReviewPrompt[]>((get) => {
  const mistakes = get(mistakesAtom)

  return get(dueReviewItemsAtom).map((item) => ({
    item,
    mistake:
      mistakes.find((mistake) => reviewItemMatchesMistake(item, mistake)) ??
      null,
  }))
})

export const allMistakesAtom = atom((get) => get(mistakesAtom))

export const unresolvedMistakesAtom = atom((get) =>
  get(mistakesAtom).filter((mistake) => !mistake.resolved),
)

export const recentActivityAtom = atom(
  (get) => get(learningProfileAtom).recentActivity,
)

export const hydrationStatusAtom = atom((get) =>
  get(learningHydrationAtom),
)
