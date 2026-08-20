'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { PinyinTone } from '../model/pinyin-lesson-schema'
import {
  getToneFrequency,
  getTonePlaybackDurationMs,
} from '../model/tone-contour'

type PitchGuideStatus = 'idle' | 'playing' | 'unsupported'

export function useTonePitchGuide(
  requiredToneCount: number,
  onAllPlayed: () => void,
) {
  const [status, setStatus] = useState<PitchGuideStatus>('idle')
  const [playingTone, setPlayingTone] = useState<number | null>(null)
  const [playedToneNumbers, setPlayedToneNumbers] = useState<Set<number>>(
    () => new Set(),
  )
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const completionDeliveredRef = useRef(false)

  useEffect(
    () => () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.onended = null
        oscillatorRef.current.stop()
        oscillatorRef.current = null
      }
      void audioContextRef.current?.close()
    },
    [],
  )

  useEffect(() => {
    if (
      playedToneNumbers.size < requiredToneCount ||
      completionDeliveredRef.current
    ) {
      return
    }
    completionDeliveredRef.current = true
    onAllPlayed()
  }, [onAllPlayed, playedToneNumbers, requiredToneCount])

  const playTone = useCallback(
    async (tone: PinyinTone) => {
      if (typeof window.AudioContext === 'undefined') {
        setStatus('unsupported')
        return
      }

      const context = audioContextRef.current ?? new window.AudioContext()
      audioContextRef.current = context

      try {
        await context.resume()
      } catch {
        setStatus('unsupported')
        return
      }

      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const startedAt = context.currentTime + 0.03
      const segmentCount = Math.max(1, tone.contour.length - 1)
      const durationSeconds = getTonePlaybackDurationMs(tone.contour) / 1000
      const segmentDuration = durationSeconds / segmentCount
      const endsAt = startedAt + durationSeconds

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(
        getToneFrequency(tone.contour[0]),
        startedAt,
      )
      tone.contour.slice(1).forEach((level, index) => {
        oscillator.frequency.exponentialRampToValueAtTime(
          getToneFrequency(level),
          startedAt + segmentDuration * (index + 1),
        )
      })

      gain.gain.setValueAtTime(0.0001, startedAt)
      gain.gain.exponentialRampToValueAtTime(0.12, startedAt + 0.04)
      gain.gain.setValueAtTime(0.12, Math.max(startedAt + 0.04, endsAt - 0.05))
      gain.gain.exponentialRampToValueAtTime(0.0001, endsAt)

      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillatorRef.current = oscillator
      setPlayingTone(tone.number)
      setStatus('playing')

      oscillator.onended = () => {
        if (oscillatorRef.current !== oscillator) return
        oscillatorRef.current = null
        setPlayingTone(null)
        setStatus('idle')
        setPlayedToneNumbers((current) => {
          const next = new Set(current)
          next.add(tone.number)
          return next
        })
      }

      oscillator.start(startedAt)
      oscillator.stop(endsAt)
    },
    [],
  )

  return {
    playedToneNumbers,
    playingTone,
    playTone,
    status,
  }
}
