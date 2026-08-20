'use client'

import { useCallback, useState } from 'react'

import type { ChoiceOption } from '@/learning/runtime/model/interaction-types'

export function useChoiceInteraction(
  options: ChoiceOption[],
  onSubmit: (result: {
    selectedId: string
    isCorrect: boolean
  }) => void,
) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const select = useCallback((values: string[]) => {
    const nextValue = values[0]
    if (nextValue) setSelectedId(nextValue)
  }, [])

  const submit = useCallback(() => {
    if (!selectedId) return
    const selectedOption = options.find((option) => option.id === selectedId)
    if (!selectedOption) return

    onSubmit({
      selectedId,
      isCorrect: selectedOption.isCorrect,
    })
  }, [onSubmit, options, selectedId])

  return { selectedId, select, submit }
}
