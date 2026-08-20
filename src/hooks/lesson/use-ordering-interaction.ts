'use client'

import { useCallback, useState } from 'react'

export function useOrderingInteraction({
  correctOrder,
  initialOrder,
  onSubmit,
}: {
  correctOrder: string[]
  initialOrder: string[]
  onSubmit: (result: { orderedIds: string[]; isCorrect: boolean }) => void
}) {
  const [orderedIds, setOrderedIds] = useState(initialOrder)

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setOrderedIds((current) => reorderItems(current, fromIndex, toIndex))
  }, [])

  const submit = useCallback(() => {
    onSubmit({
      orderedIds,
      isCorrect:
        orderedIds.length === correctOrder.length &&
        orderedIds.every((itemId, index) => itemId === correctOrder[index]),
    })
  }, [correctOrder, onSubmit, orderedIds])

  return { orderedIds, reorder, submit }
}

export function reorderItems<T>(
  items: T[],
  fromIndex: number,
  toIndex: number,
) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items
  }

  const next = [...items]
  const [movedItem] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, movedItem)
  return next
}
