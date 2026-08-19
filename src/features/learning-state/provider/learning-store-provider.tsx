'use client'

import { Provider } from 'jotai'
import { type ReactNode, type RefObject, useRef, useState } from 'react'

import { DevScenarioSwitcher } from '@/features/learning-simulator/components/dev-scenario-switcher'

import { useLearningHydration } from '../hooks/use-learning-hydration'
import { useLearningPersistence } from '../hooks/use-learning-persistence'
import { useLearningRuntimeStatus } from '../hooks/use-learning-runtime-status'
import { createLearningStore } from '../state/learning-store'
import {
  createLearningPersistenceRuntime,
  type LearningPersistenceRuntime,
} from '../storage/memory-storage'

type LearningStoreProviderProps = {
  children: ReactNode
  fallback: ReactNode
  showScenarioSwitcher?: boolean
}

export function LearningStoreProvider({
  children,
  fallback,
  showScenarioSwitcher = true,
}: LearningStoreProviderProps) {
  const [store] = useState(createLearningStore)
  const persistenceRef = useRef<LearningPersistenceRuntime>(
    createLearningPersistenceRuntime(),
  )

  return (
    <Provider store={store}>
      <LearningRuntimeGate
        fallback={fallback}
        persistenceRef={persistenceRef}
        showScenarioSwitcher={showScenarioSwitcher}
      >
        {children}
      </LearningRuntimeGate>
    </Provider>
  )
}

function LearningRuntimeGate({
  children,
  fallback,
  persistenceRef,
  showScenarioSwitcher,
}: LearningStoreProviderProps & {
  persistenceRef: RefObject<LearningPersistenceRuntime>
}) {
  useLearningHydration(persistenceRef)
  useLearningPersistence(persistenceRef)
  const { hydration } = useLearningRuntimeStatus()

  if (hydration.status === 'hydrating') return fallback

  return (
    <>
      {children}
      {showScenarioSwitcher ? <DevScenarioSwitcher /> : null}
    </>
  )
}
