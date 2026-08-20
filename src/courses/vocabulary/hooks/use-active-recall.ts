'use client'

import { useCallback, useState } from 'react'

export function useActiveRecall(
  onAssess: (result: { recalled: boolean }) => void,
) {
  const [revealed, setRevealed] = useState(false)

  const reveal = useCallback(() => setRevealed(true), [])
  const assess = useCallback(
    (recalled: boolean) => {
      if (!revealed) return
      onAssess({ recalled })
    },
    [onAssess, revealed],
  )

  return { assess, reveal, revealed }
}
