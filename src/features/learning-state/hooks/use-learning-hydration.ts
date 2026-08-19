'use client'

import { useSetAtom } from 'jotai'
import { type RefObject, useEffect, useRef } from 'react'

import { starterRoute, starterRouteId } from '@/features/learning-routes/content/hsk3-level-1-starter'
import { getRouteNodes } from '@/features/learning-routes/model/route-schema'
import {
  createLearningFixture,
  isLearningFixtureId,
} from '@/features/learning-simulator/fixtures/learning-fixtures'

import { hydrateLearningStateAtom } from '../atoms/learning-action-atoms'
import { isLearningGoalId } from '../model/learning-goal'
import {
  createEmptyLearningState,
  startLearningRoute,
} from '../model/learning-state'
import {
  createWebStorageAdapter,
  loadLearningState,
} from '../storage/learning-storage'
import {
  createMemoryStorageAdapter,
  type LearningPersistenceRuntime,
} from '../storage/memory-storage'

export function useLearningHydration(
  persistenceRef: RefObject<LearningPersistenceRuntime>,
) {
  const hydrate = useSetAtom(hydrateLearningStateAtom)
  const hasHydrated = useRef(false)

  useEffect(() => {
    if (hasHydrated.current) return
    hasHydrated.current = true

    const params = new URLSearchParams(window.location.search)
    const fixtureId = params.get('fixture')

    if (
      process.env.NODE_ENV === 'development' &&
      isLearningFixtureId(fixtureId)
    ) {
      const fixture = createLearningFixture(fixtureId)
      persistenceRef.current.adapter = createMemoryStorageAdapter()
      persistenceRef.current.enabled = false
      hydrate({
        state: fixture.state,
        now: fixture.now,
        hydration: {
          status:
            fixture.capabilities.storage === 'unavailable'
              ? 'degraded'
              : 'ready',
          source: 'fixture',
          diagnostic:
            fixture.capabilities.storage === 'unavailable'
              ? 'Browser storage is unavailable. Progress is held in memory.'
              : null,
        },
        scenario: {
          fixtureId: fixture.id,
          label: fixture.label,
          capabilities: fixture.capabilities,
        },
      })
      return
    }

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
