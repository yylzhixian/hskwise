import { createStore } from 'jotai/vanilla'

import { hydrateLearningStateAtom } from './atoms/learning-action-atoms'
import type { LearningHydrationState } from './atoms/learning-base-atoms'
import { createEmptyLearningState } from './model/learning-state'
import type { LearningState } from './model/learning-state-schema'

type CreateLearningStoreOptions = {
  state?: LearningState
  now?: string
  hydration?: LearningHydrationState
}

export function createLearningStore(options: CreateLearningStoreOptions = {}) {
  const store = createStore()

  store.set(hydrateLearningStateAtom, {
    state: options.state ?? createEmptyLearningState(),
    now: options.now ?? new Date().toISOString(),
    hydration: options.hydration ?? {
      status: 'hydrating',
      source: 'initial',
      diagnostic: null,
    },
  })

  return store
}

export type LearningStore = ReturnType<typeof createLearningStore>
