'use client'

import { useCallback, useState } from 'react'

import { areOrderedIdsEqual } from '@/features/learning-core/model/answer-evaluation'

import type { OrderingItem } from '../model/interaction-types'

export function useOrderingInteraction(
  items: OrderingItem[],
  onSubmit: (result: { itemIds: string[]; isCorrect: boolean }) => void,
) {
  const [itemIds, setItemIds] = useState(() => items.map((item) => item.id))

  const move = useCallback((index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    setItemIds((current) => {
      if (targetIndex < 0 || targetIndex >= current.length) return current
      const next = [...current]
      const [itemId] = next.splice(index, 1)
      next.splice(targetIndex, 0, itemId)
      return next
    })
  }, [])

  const submit = useCallback(() => {
    const expectedIds = [...items]
      .sort((left, right) => left.correctOrder - right.correctOrder)
      .map((item) => item.id)

    onSubmit({
      itemIds,
      isCorrect: areOrderedIdsEqual(expectedIds, itemIds),
    })
  }, [itemIds, items, onSubmit])

  return { itemIds, move, submit }
}
