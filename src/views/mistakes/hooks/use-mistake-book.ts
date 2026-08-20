'use client'

import { useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'

import { allMistakesAtom } from '@/store/learning/atoms/learning-selector-atoms'

export type MistakeStatusFilter = 'all' | 'open' | 'resolved'

export function useMistakeBook() {
  const mistakes = useAtomValue(allMistakesAtom)
  const [status, setStatus] = useState<MistakeStatusFilter>('open')
  const [source, setSource] = useState('all')
  const sources = useMemo(
    () => Array.from(new Set(mistakes.map((mistake) => mistake.lessonId))),
    [mistakes],
  )
  const filteredItems = useMemo(
    () =>
      mistakes.filter(
        (mistake) =>
          (status === 'all' ||
            (status === 'open' && !mistake.resolved) ||
            (status === 'resolved' && mistake.resolved)) &&
          (source === 'all' || mistake.lessonId === source),
      ),
    [mistakes, source, status],
  )

  return {
    filteredItems,
    openCount: mistakes.filter((mistake) => !mistake.resolved).length,
    resolvedCount: mistakes.filter((mistake) => mistake.resolved).length,
    setSource,
    setStatus,
    source,
    sources,
    status,
    totalCount: mistakes.length,
  }
}
