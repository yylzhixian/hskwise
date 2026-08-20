'use client'

import { useAtomValue } from 'jotai'

import { hydrationStatusAtom } from '@/store/learning/atoms/learning-selector-atoms'

export function useLearningRuntimeStatus() {
  return {
    hydration: useAtomValue(hydrationStatusAtom),
  }
}
