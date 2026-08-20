'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { type RefObject, useEffect, useRef } from 'react'

import { setHydrationDegradedAtom } from '@/store/learning/atoms/learning-action-atoms'
import {
  hydrationStatusAtom,
  persistedLearningStateAtom,
} from '@/store/learning/atoms/learning-selector-atoms'
import { saveLearningState } from '@/store/learning/storage/learning-storage'
import {
  createMemoryStorageAdapter,
  type LearningPersistenceRuntime,
} from '@/store/learning/storage/memory-storage'

export function useLearningPersistence(
  persistenceRef: RefObject<LearningPersistenceRuntime>,
) {
  const state = useAtomValue(persistedLearningStateAtom)
  const hydration = useAtomValue(hydrationStatusAtom)
  const setDegraded = useSetAtom(setHydrationDegradedAtom)
  const previousValue = useRef<string | null>(null)

  useEffect(() => {
    if (hydration.status === 'hydrating') return
    if (!persistenceRef.current.enabled) return

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
  }, [hydration.status, persistenceRef, setDegraded, state])
}
