'use client'

import { Provider } from 'jotai'
import { type ReactNode, type RefObject, useRef, useState } from 'react'

import { useLearningRuntimeStatus } from '@/hooks/learning/use-learning-runtime-status'

import { useLearningHydration } from './hooks/use-learning-hydration'
import { useLearningPersistence } from './hooks/use-learning-persistence'
import { createLearningStore } from './learning-store'
import {
  createLearningPersistenceRuntime,
  type LearningPersistenceRuntime,
} from './storage/memory-storage'

type LearningStoreProviderProps = {
  children: ReactNode
  fallback: ReactNode
}

export function LearningStoreProvider({
  children,
  fallback,
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
}: LearningStoreProviderProps & {
  persistenceRef: RefObject<LearningPersistenceRuntime>
}) {
  useLearningHydration(persistenceRef)
  useLearningPersistence(persistenceRef)
  const { hydration } = useLearningRuntimeStatus()

  if (hydration.status === 'hydrating') return fallback

  return children
}
