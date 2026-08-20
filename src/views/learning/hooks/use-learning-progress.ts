'use client'

import { useAtomValue } from 'jotai'

import { starterRoute } from '@/learning/routes/content/hsk3-level-1-starter'

import {
  recentActivityAtom,
  starterRouteOverviewAtom,
} from '@/store/learning/atoms/learning-selector-atoms'

export function useLearningProgress() {
  const overview = useAtomValue(starterRouteOverviewAtom)
  const recentActivity = useAtomValue(recentActivityAtom)

  return {
    route: starterRoute,
    recentActivity,
    ...overview,
  }
}
