import { createStore } from 'jotai/vanilla'

import { hydrateLearningStateAtom } from '../atoms/learning-action-atoms'
import { createEmptyLearningState } from '../model/learning-state'
import type { LearningState } from '../model/learning-state-schema'
import type {
  ActiveLearningScenario,
  LearningHydrationState,
} from '../atoms/learning-base-atoms'

type CreateLearningStoreOptions = {
  state?: LearningState
  now?: string
  hydration?: LearningHydrationState
  scenario?: ActiveLearningScenario
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
    scenario: options.scenario,
  })

  return store
}

export type LearningStore = ReturnType<typeof createLearningStore>
