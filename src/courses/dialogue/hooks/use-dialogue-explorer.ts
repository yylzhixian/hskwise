'use client'

import { useCallback, useEffect, useState } from 'react'

import type { DialogueLine } from '../model/dialogue-lesson-schema'
import { useDialogueAudio } from './use-dialogue-audio'

export function useDialogueExplorer({
  completed,
  lines,
  onComplete,
}: {
  completed: boolean
  lines: DialogueLine[]
  onComplete: () => void
}) {
  const {
    activeLineId,
    audioRef,
    markEnded: finishAudioPlayback,
    markError,
    playLine,
    status,
  } = useDialogueAudio()
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null)
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null)
  const [showMeaning, setShowMeaning] = useState(false)
  const [showPinyin, setShowPinyin] = useState(false)
  const [playedLineIds, setPlayedLineIds] = useState<Set<string>>(
    () => new Set(),
  )
  const hasCompletedPlayback = hasListenedToAllLines(playedLineIds, lines)

  useEffect(() => {
    if (!completed && hasCompletedPlayback) {
      onComplete()
    }
  }, [completed, hasCompletedPlayback, onComplete])

  const selectLine = useCallback((lineId: string) => {
    setSelectedLineId(lineId)
    setSelectedTokenId(null)
    setShowMeaning(false)
    setShowPinyin(false)
  }, [])
  const markEnded = useCallback(() => {
    if (activeLineId) {
      setPlayedLineIds((current) => {
        if (current.has(activeLineId)) return current
        const next = new Set(current)
        next.add(activeLineId)
        return next
      })
    }
    finishAudioPlayback()
  }, [activeLineId, finishAudioPlayback])

  return {
    activeLineId,
    audioRef,
    markEnded,
    markError,
    playLine,
    playedCount: lines.reduce(
      (count, line) => count + Number(playedLineIds.has(line.id)),
      0,
    ),
    selectLine,
    selectedLineId,
    selectedTokenId,
    selectToken: setSelectedTokenId,
    showMeaning,
    showPinyin,
    status,
    toggleMeaning: () => setShowMeaning((current) => !current),
    togglePinyin: () => setShowPinyin((current) => !current),
  }
}

export function hasListenedToAllLines(
  playedLineIds: ReadonlySet<string>,
  lines: DialogueLine[],
) {
  return lines.length > 0 && lines.every((line) => playedLineIds.has(line.id))
}
