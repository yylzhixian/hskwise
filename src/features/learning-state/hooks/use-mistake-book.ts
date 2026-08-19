'use client'

import { useAtomValue } from 'jotai'

import { unresolvedMistakesAtom } from '../atoms/learning-selector-atoms'

export function useMistakeBook() {
  const unresolvedMistakes = useAtomValue(unresolvedMistakesAtom)

  return {
    count: unresolvedMistakes.length,
    items: unresolvedMistakes,
  }
}
