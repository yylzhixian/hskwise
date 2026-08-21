'use client'

import { useCallback, useState } from 'react'

export function useActivityChoice({
  answer,
  onSubmit,
}: {
  answer: string
  onSubmit: (result: { answer: string; isCorrect: boolean }) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const select = useCallback((values: string[]) => {
    const selected = values[0]
    if (selected) setSelectedId(selected)
  }, [])
  const submit = useCallback(() => {
    if (!selectedId) return
    onSubmit({ answer: selectedId, isCorrect: selectedId === answer })
  }, [answer, onSubmit, selectedId])

  return { select, selectedId, submit }
}
