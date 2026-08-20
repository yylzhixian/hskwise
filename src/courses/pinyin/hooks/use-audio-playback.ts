'use client'

import { useCallback, useRef, useState } from 'react'

export type AudioPlaybackStatus = 'idle' | 'playing' | 'blocked' | 'error'

export function useAudioPlayback() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [status, setStatus] = useState<AudioPlaybackStatus>('idle')

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return false

    audio.currentTime = 0
    try {
      await audio.play()
      setStatus('playing')
      return true
    } catch {
      setStatus('blocked')
      return false
    }
  }, [])

  const markEnded = useCallback(() => setStatus('idle'), [])
  const markError = useCallback(() => setStatus('error'), [])

  return { audioRef, markEnded, markError, play, status }
}
