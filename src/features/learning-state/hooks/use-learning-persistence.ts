'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { type RefObject, useEffect, useRef } from 'react'

import { setHydrationDegradedAtom } from '../atoms/learning-action-atoms'
import {
  hydrationStatusAtom,
  learningScenarioAtom,
  persistedLearningStateAtom,
} from '../atoms/learning-selector-atoms'
import { saveLearningState } from '../storage/learning-storage'
import {
  createMemoryStorageAdapter,
  type LearningPersistenceRuntime,
} from '../storage/memory-storage'

export function useLearningPersistence(
  persistenceRef: RefObject<LearningPersistenceRuntime>,
) {
  const state = useAtomValue(persistedLearningStateAtom)
  const hydration = useAtomValue(hydrationStatusAtom)
  const scenario = useAtomValue(learningScenarioAtom)
  const setDegraded = useSetAtom(setHydrationDegradedAtom)
  const previousValue = useRef<string | null>(null)

  useEffect(() => {
    if (hydration.status === 'hydrating') return
    if (!persistenceRef.current.enabled || scenario.fixtureId) return

    const serialized = JSON.stringify(state)
    if (serialized === previousValue.current) return

    const result = saveLearningState(persistenceRef.current.adapter, state)
    previousValue.current = serialized

    if (!result.ok) {
      persistenceRef.current.adapter = createMemoryStorageAdapter({
        initialValue: serialized,
      })
      setDegraded(result.diagnostic)
    }
  }, [hydration.status, persistenceRef, scenario.fixtureId, setDegraded, state])
}
