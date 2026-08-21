'use client'

import { useCallback, useRef, useState } from 'react'

import type { DialogueLineView } from '@/courses/interactions/model/activity-view-models'

export type DialogueAudioStatus = 'idle' | 'playing' | 'blocked' | 'error'

export function useDialogueAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [activeLineId, setActiveLineId] = useState<string | null>(null)
  const [status, setStatus] = useState<DialogueAudioStatus>('idle')

  const playLine = useCallback(async (line: DialogueLineView) => {
    const audio = audioRef.current
    if (!audio) return false

    audio.src = line.audio.src
    audio.currentTime = 0
    setActiveLineId(line.id)
    try {
      await audio.play()
      setStatus('playing')
      return true
    } catch {
      setStatus('blocked')
      return false
    }
  }, [])

  const markEnded = useCallback(() => {
    setActiveLineId(null)
    setStatus('idle')
  }, [])
  const markError = useCallback(() => setStatus('error'), [])

  return {
    activeLineId,
    audioRef,
    markEnded,
    markError,
    playLine,
    status,
  }
}
