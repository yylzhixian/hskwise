'use client'

import { useSetAtom } from 'jotai'
import { type RefObject, useEffect, useRef } from 'react'

import { starterRoute, starterRouteId } from '@/learning/routes/content/hsk3-level-1-starter'
import { getRouteNodes } from '@/learning/routes/model/route-schema'

import { hydrateLearningStateAtom } from '@/store/learning/atoms/learning-action-atoms'
import { isLearningGoalId } from '@/store/learning/model/learning-goal'
import {
  createEmptyLearningState,
  startLearningRoute,
} from '@/store/learning/model/learning-state'
import {
  createWebStorageAdapter,
  loadLearningState,
} from '@/store/learning/storage/learning-storage'
import {
  createMemoryStorageAdapter,
  type LearningPersistenceRuntime,
} from '@/store/learning/storage/memory-storage'

export function useLearningHydration(
  persistenceRef: RefObject<LearningPersistenceRuntime>,
) {
  const hydrate = useSetAtom(hydrateLearningStateAtom)
  const hasHydrated = useRef(false)

  useEffect(() => {
    if (hasHydrated.current) return
    hasHydrated.current = true

    const params = new URLSearchParams(window.location.search)
    const now = new Date().toISOString()
    const goalParam = params.get('goal') ?? undefined
    const goalId = isLearningGoalId(goalParam) ? goalParam : undefined
    let storageAvailable = true

    try {
      persistenceRef.current.adapter = createWebStorageAdapter(
        window.localStorage,
      )
    } catch {
      persistenceRef.current.adapter = createMemoryStorageAdapter()
      storageAvailable = false
    }
    persistenceRef.current.enabled = true

    const loaded = loadLearningState(persistenceRef.current.adapter)
    let state = loaded.kind === 'loaded' ? loaded.state : createEmptyLearningState()

    if (goalId) {
      state = startLearningRoute(state, {
        routeId: starterRouteId,
        firstNodeId: getRouteNodes(starterRoute)[0].id,
        goalId,
        now,
      })
    }

    const isDegraded =
      !storageAvailable ||
      loaded.kind === 'invalid' ||
      loaded.kind === 'unavailable'

    if (loaded.kind === 'unavailable') {
      persistenceRef.current.adapter = createMemoryStorageAdapter()
    }

    hydrate({
      state,
      now,
      hydration: {
        status: isDegraded ? 'degraded' : 'ready',
        source:
          loaded.kind === 'loaded'
            ? 'storage'
            : isDegraded
              ? 'memory'
              : 'new',
        diagnostic:
          loaded.kind === 'invalid' || loaded.kind === 'unavailable'
            ? loaded.diagnostic
            : !storageAvailable
              ? 'Browser storage is unavailable. Progress is held in memory.'
              : null,
      },
    })
  }, [hydrate, persistenceRef])
}
