'use client'

import { useAtomValue } from 'jotai'

import { dueReviewItemsAtom } from '@/store/learning/atoms/learning-selector-atoms'

export function useReviewQueue() {
  const dueItems = useAtomValue(dueReviewItemsAtom)

  return {
    dueCount: dueItems.length,
    dueItems,
  }
}
