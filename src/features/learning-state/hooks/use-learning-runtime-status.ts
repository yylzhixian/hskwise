'use client'

import { useAtomValue } from 'jotai'

import {
  hydrationStatusAtom,
  learningScenarioAtom,
} from '../atoms/learning-selector-atoms'

export function useLearningRuntimeStatus() {
  return {
    hydration: useAtomValue(hydrationStatusAtom),
    scenario: useAtomValue(learningScenarioAtom),
  }
}
