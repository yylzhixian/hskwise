'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { SceneAction } from '../scene-schema/action-schema'
import type { MockAsset } from '../scene-schema/project-schema'

type PlayAudioAction = Extract<SceneAction, { kind: 'playAudio' }>

export type AudioTransportStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'unavailable'
  | 'blocked'
  | 'error'

export type ResolvedAudioDuration = {
  actionId: string
  assetId?: string
  durationMs: number
  assetDurationMs: number
}

type AudioCue = {
  action: PlayAudioAction
  timelineStartMs: number
  timelineDurationMs: number
}

type ActiveAudioTrack = {
  actionId: string
  assetId?: string
  audio: HTMLAudioElement
  timelineStartMs: number
  timelineDurationMs: number
  mediaStartMs: number
  playIntent: boolean
}

type AudioTransportOptions = {
  assetsById: ReadonlyMap<string, MockAsset>
  onDurationChange?: (duration: ResolvedAudioDuration) => void
  onLog?: (kind: string, message: string) => void
}

export function useAudioTransport({
  assetsById,
  onDurationChange,
  onLog,
}: AudioTransportOptions) {
  const activeTrackRef = useRef<ActiveAudioTrack | null>(null)
  const [status, setStatus] = useState<AudioTransportStatus>('idle')

  const dispose = useCallback((publishStatus = true) => {
    const track = activeTrackRef.current
    if (track) {
      track.playIntent = false
      track.audio.pause()
      track.audio.onloadedmetadata = null
      track.audio.onended = null
      track.audio.onerror = null
      activeTrackRef.current = null
    }
    if (publishStatus) setStatus('idle')
  }, [])

  const seekTrack = useCallback((track: ActiveAudioTrack, timelineTimeMs: number) => {
    const elapsedMs = Math.max(0, timelineTimeMs - track.timelineStartMs)
    const mediaTimeSeconds = (track.mediaStartMs + elapsedMs) / 1000
    if (Math.abs(track.audio.currentTime - mediaTimeSeconds) < 0.25) return

    try {
      track.audio.currentTime = mediaTimeSeconds
    } catch {
      // Metadata may not be ready yet. onloadedmetadata applies the same seek.
    }
  }, [])

  const playTrack = useCallback(
    (track: ActiveAudioTrack) => {
      track.playIntent = true
      track.audio.loop = false
      track.audio.muted = false
      setStatus('loading')
      void track.audio.play().then(
        () => {
          if (activeTrackRef.current !== track) return
          if (track.playIntent) setStatus('playing')
          else {
            track.audio.pause()
            setStatus('paused')
          }
        },
        () => {
          if (activeTrackRef.current !== track) return
          if (!track.playIntent) {
            setStatus('paused')
            return
          }
          setStatus('blocked')
          onLog?.('audio.blocked', 'Browser blocked audio playback')
        },
      )
    },
    [onLog],
  )

  const loadCue = useCallback(
    (cue: AudioCue, timelineTimeMs: number, shouldPlay: boolean) => {
      const existingTrack = activeTrackRef.current
      if (
        existingTrack?.actionId === cue.action.id &&
        existingTrack.timelineStartMs === cue.timelineStartMs
      ) {
        existingTrack.timelineDurationMs = cue.timelineDurationMs
        seekTrack(existingTrack, timelineTimeMs)
        if (shouldPlay) playTrack(existingTrack)
        else {
          existingTrack.playIntent = false
          existingTrack.audio.loop = false
          existingTrack.audio.muted = false
          existingTrack.audio.pause()
          setStatus('paused')
        }
        return true
      }

      dispose()

      const asset = cue.action.assetId
        ? assetsById.get(cue.action.assetId)
        : undefined
      const source = cue.action.url ?? asset?.url ?? undefined
      if (!source) {
        setStatus('unavailable')
        return false
      }

      const audio = new Audio(source)
      audio.preload = 'auto'
      const track: ActiveAudioTrack = {
        actionId: cue.action.id,
        assetId: cue.action.assetId,
        audio,
        timelineStartMs: cue.timelineStartMs,
        timelineDurationMs: cue.timelineDurationMs,
        mediaStartMs: cue.action.startMs ?? 0,
        playIntent: false,
      }
      activeTrackRef.current = track

      audio.onloadedmetadata = () => {
        if (activeTrackRef.current !== track) return
        seekTrack(track, timelineTimeMs)

        const naturalDurationMs = Number.isFinite(audio.duration)
          ? Math.round(audio.duration * 1000)
          : 0
        const requestedEndMs = cue.action.endMs ?? naturalDurationMs
        const mediaEndMs = naturalDurationMs > 0
          ? Math.min(requestedEndMs, naturalDurationMs)
          : requestedEndMs
        const resolvedDurationMs = Math.max(0, mediaEndMs - track.mediaStartMs)
        if (resolvedDurationMs > 0) {
          onDurationChange?.({
            actionId: track.actionId,
            assetId: track.assetId,
            durationMs: resolvedDurationMs,
            assetDurationMs: naturalDurationMs,
          })
        }
      }
      audio.onended = () => {
        if (activeTrackRef.current !== track) return
        activeTrackRef.current = null
        setStatus('idle')
        onLog?.('media.ended', track.assetId ?? track.actionId)
      }
      audio.onerror = () => {
        if (activeTrackRef.current !== track) return
        setStatus('error')
        onLog?.('audio.error', `Unable to load ${track.assetId ?? 'remote audio'}`)
      }

      seekTrack(track, timelineTimeMs)
      if (shouldPlay) playTrack(track)
      else setStatus('paused')
      return true
    },
    [assetsById, dispose, onDurationChange, onLog, playTrack, seekTrack],
  )

  const pause = useCallback(() => {
    const track = activeTrackRef.current
    if (!track) return
    const wasPlaying = track.playIntent
    track.playIntent = false
    track.audio.loop = false
    track.audio.muted = false
    track.audio.pause()
    setStatus(wasPlaying ? 'paused' : 'idle')
  }, [])

  const primeCue = useCallback(
    (cue: AudioCue) => {
      if (!loadCue(cue, cue.timelineStartMs, false)) return
      const track = activeTrackRef.current
      if (!track) return

      track.playIntent = false
      track.audio.loop = true
      track.audio.muted = true
      setStatus('idle')
      void track.audio.play().then(
        () => {
          if (activeTrackRef.current === track && !track.playIntent) {
            setStatus('idle')
          }
        },
        () => {
          if (activeTrackRef.current !== track) return
          track.audio.loop = false
          track.audio.muted = false
        },
      )
    },
    [loadCue],
  )

  const resumeAt = useCallback(
    (timelineTimeMs: number) => {
      const track = activeTrackRef.current
      if (!track) return
      const cueEndMs = track.timelineStartMs + track.timelineDurationMs
      if (timelineTimeMs < track.timelineStartMs || timelineTimeMs >= cueEndMs) {
        dispose()
        return
      }
      seekTrack(track, timelineTimeMs)
      playTrack(track)
    },
    [dispose, playTrack, seekTrack],
  )

  const syncToTime = useCallback(
    (timelineTimeMs: number) => {
      const track = activeTrackRef.current
      if (!track) return
      const cueEndMs = track.timelineStartMs + track.timelineDurationMs
      if (timelineTimeMs < track.timelineStartMs || timelineTimeMs >= cueEndMs) {
        dispose()
        return
      }
      seekTrack(track, timelineTimeMs)
    },
    [dispose, seekTrack],
  )

  useEffect(() => () => dispose(false), [dispose])

  return {
    status,
    loadCue,
    pause,
    primeCue,
    resumeAt,
    syncToTime,
    stop: dispose,
  }
}
