'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CirclePause,
  Pause,
  Play,
  RotateCcw,
  StepForward,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SceneAction } from '@/features/course-studio/scene-schema/action-schema'
import type { MockAsset } from '@/features/course-studio/scene-schema/project-schema'
import type {
  InteractionAttempt,
  LearningRuntimeEvent,
  PlayerContext,
  RuntimeEventKind,
  SceneProgress,
} from '@/features/course-studio/scene-schema/runtime-schema'
import type { SceneData } from '@/features/course-studio/scene-schema/scene-schema'
import type {
  JsonValue,
  TargetLocator,
} from '@/features/course-studio/scene-schema/shared'
import type { SceneEvent } from '@/features/course-studio/scene-schema/timeline-schema'
import {
  getClipDuration,
  getTimelineDuration,
} from '@/features/course-studio/scene-schema/timeline-utils'
import {
  createInteractionAttempt,
  evaluateSceneProgress,
  getLatestAttempts,
} from './runtime-state'
import type { MockReviewItem } from './learning-progress'
import { RuntimeEventPanel } from './runtime-event-panel'
import {
  ElementRenderer,
  type ElementRuntimeVisual,
} from './element-renderer'
import {
  type AudioTransportStatus,
  type ResolvedAudioDuration,
  useAudioTransport,
} from './use-audio-transport'

type ScenePlayerProps = {
  scene: SceneData
  sceneId?: string
  context?: PlayerContext
  title?: string
  locale?: string
  assets?: MockAsset[]
  compact?: boolean
  currentTimeMs?: number
  seekVersion?: number
  onCurrentTimeChange?: (currentTimeMs: number) => void
  onAudioDurationChange?: (duration: ResolvedAudioDuration) => void
  onRuntimeEvent?: (event: LearningRuntimeEvent) => void
  onProgressChange?: (progress: SceneProgress) => void
  initialProgress?: SceneProgress
  reviewItems?: MockReviewItem[]
}

type PlayerLog = {
  id: string
  kind: string
  message: string
}

type RuntimeRefs = {
  elementIds: Set<string>
  interactionIds: Set<string>
  actionIds: Set<string>
}

type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'waiting' | 'complete'

type HighlightState = {
  targetId: string
  effect: Extract<SceneAction, { kind: 'highlight' }>['effect']
}

export function ScenePlayer({
  scene,
  sceneId = 'scene_preview',
  context = 'editor',
  title,
  locale = 'en',
  assets = [],
  compact = false,
  currentTimeMs,
  seekVersion,
  onCurrentTimeChange,
  onAudioDurationChange,
  onRuntimeEvent,
  onProgressChange,
  initialProgress,
  reviewItems = [],
}: ScenePlayerProps) {
  const restoredProgress =
    initialProgress?.sceneId === sceneId && initialProgress.context === context
      ? initialProgress
      : undefined
  const restoredComplete = restoredProgress?.status === 'completed'
  const restoredTimelineComplete =
    restoredComplete &&
    scene.completionRule.kind === 'viewed' &&
    scene.completionRule.minTimelineMs === undefined
  const restoredStarted =
    restoredProgress !== undefined && restoredProgress.status !== 'notStarted'
  const restoredAttempts = restoredProgress?.attempts ?? []
  const initialTime = Math.max(
    0,
    currentTimeMs ?? 0,
    restoredProgress?.maxPlayedTimeMs ?? 0,
  )
  const frameRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef(0)
  const currentTimeRef = useRef(initialTime)
  const cursorRef = useRef(restoredTimelineComplete ? scene.timeline.length : 0)
  const playingRef = useRef(false)
  const waitingInteractionIdRef = useRef<string | null>(null)
  const completedInteractionIdsRef = useRef(
    new Set(restoredProgress?.completedInteractionIds ?? []),
  )
  const visualTimersRef = useRef<number[]>([])
  const animationTokenRef = useRef(0)
  const lastNotifiedTimeRef = useRef(-Infinity)
  const appliedSeekVersionRef = useRef(-1)
  const startPlaybackRef = useRef<() => void>(() => undefined)
  const stepTimelineRef = useRef<() => void>(() => undefined)
  const attemptsRef = useRef<InteractionAttempt[]>(restoredAttempts)
  const maxPlayedTimeRef = useRef(restoredProgress?.maxPlayedTimeMs ?? 0)
  const lastPublishedMaxPlayedTimeRef = useRef(
    restoredProgress?.maxPlayedTimeMs ?? 0,
  )
  const sessionIdRef = useRef(createRuntimeId('session'))
  const eventSequenceRef = useRef(0)
  const sceneStartedRef = useRef(restoredStarted)
  const completionEmittedRef = useRef(restoredComplete)

  const [visibleElementIds, setVisibleElementIds] = useState<string[]>(() =>
    getInitialVisibleElementIds(scene),
  )
  const [highlight, setHighlight] = useState<HighlightState | null>(null)
  const [elementVisuals, setElementVisuals] = useState<
    Record<string, ElementRuntimeVisual>
  >({})
  const [timelineCursor, setTimelineCursor] = useState(
    restoredTimelineComplete ? scene.timeline.length : 0,
  )
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>(
    restoredTimelineComplete ? 'complete' : 'idle',
  )
  const [waitingInteractionId, setWaitingInteractionId] = useState<
    string | null
  >(null)
  const [displayTimeMs, setDisplayTimeMs] = useState(initialTime)
  const [runtimeState, setRuntimeState] = useState<Record<string, unknown>>(
    scene.state,
  )
  const [attempts, setAttempts] = useState<InteractionAttempt[]>(
    restoredAttempts,
  )
  const [maxPlayedTimeMs, setMaxPlayedTimeMs] = useState(
    restoredProgress?.maxPlayedTimeMs ?? 0,
  )
  const [timelineComplete, setTimelineComplete] = useState(
    restoredTimelineComplete,
  )
  const [started, setStarted] = useState(restoredStarted)
  const [runtimeEvents, setRuntimeEvents] = useState<LearningRuntimeEvent[]>([])
  const [, setLogs] = useState<PlayerLog[]>([])

  const sortedTimeline = useMemo(
    () => [...scene.timeline].sort((a, b) => a.at - b.at),
    [scene.timeline],
  )
  const actionMap = useMemo(
    () => new Map(scene.actions.map((action) => [action.id, action])),
    [scene.actions],
  )
  const interactionsById = useMemo(
    () =>
      new Map(
        scene.interactions.map((interaction) => [interaction.id, interaction]),
      ),
    [scene.interactions],
  )
  const assetsById = useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset])),
    [assets],
  )
  const timelineDuration = useMemo(
    () => getTimelineDuration(scene, assetsById),
    [assetsById, scene],
  )
  const runtimeRefs = useMemo<RuntimeRefs>(
    () => ({
      elementIds: new Set(scene.elements.map((element) => element.id)),
      interactionIds: new Set(
        scene.interactions.map((interaction) => interaction.id),
      ),
      actionIds: new Set(scene.actions.map((action) => action.id)),
    }),
    [scene.actions, scene.elements, scene.interactions],
  )

  const visibleSet = useMemo(
    () => new Set(visibleElementIds),
    [visibleElementIds],
  )
  const latestAttempts = useMemo(() => getLatestAttempts(attempts), [attempts])
  const progress = useMemo(
    () =>
      evaluateSceneProgress({
        sceneId,
        context,
        scene,
        attempts,
        maxPlayedTimeMs,
        timelineComplete,
        started,
      }),
    [attempts, context, maxPlayedTimeMs, scene, sceneId, started, timelineComplete],
  )
  const isComplete = progress.status === 'completed'

  const appendLog = useCallback((kind: string, message: string) => {
    setLogs((current) =>
      [
        {
          id: `${Date.now()}_${current.length}`,
          kind,
          message,
        },
        ...current,
      ].slice(0, 12),
    )
  }, [])

  const emitRuntimeEvent = useCallback(
    (
      type: RuntimeEventKind,
      options: {
        interactionId?: string
        attemptNo?: number
        targetLocator?: TargetLocator
        payload?: Record<string, JsonValue>
      } = {},
    ) => {
      const event: LearningRuntimeEvent = {
        version: 1,
        id: createRuntimeId('event'),
        sessionId: sessionIdRef.current,
        sequence: ++eventSequenceRef.current,
        context,
        sceneId,
        sceneVersion: scene.version,
        type,
        occurredAt: new Date().toISOString(),
        playheadMs: Math.max(0, Math.round(currentTimeRef.current)),
        interactionId: options.interactionId,
        attemptNo: options.attemptNo,
        targetLocator: options.targetLocator,
        payload: options.payload,
      }

      setRuntimeEvents((current) => [event, ...current].slice(0, 50))
      onRuntimeEvent?.(event)
      return event
    },
    [context, onRuntimeEvent, scene.version, sceneId],
  )

  const ensureSceneStarted = useCallback(() => {
    if (sceneStartedRef.current) return
    sceneStartedRef.current = true
    setStarted(true)
    emitRuntimeEvent('scene.started')
  }, [emitRuntimeEvent])

  const recordPlayedTime = useCallback(
    (playedTimeMs: number, forcePublish = false) => {
      const nextMax = Math.max(
        maxPlayedTimeRef.current,
        Math.min(timelineDuration, Math.round(playedTimeMs)),
      )
      maxPlayedTimeRef.current = nextMax
      if (
        forcePublish ||
        nextMax - lastPublishedMaxPlayedTimeRef.current >= 100
      ) {
        lastPublishedMaxPlayedTimeRef.current = nextMax
        setMaxPlayedTimeMs(nextMax)
      }
    },
    [timelineDuration],
  )

  useEffect(() => {
    onProgressChange?.(progress)
  }, [onProgressChange, progress])

  useEffect(() => {
    if (!started || !isComplete || completionEmittedRef.current) return
    completionEmittedRef.current = true
    emitRuntimeEvent('scene.completed', {
      payload: {
        attempts: progress.attempts.length,
        maxPlayedTimeMs: progress.maxPlayedTimeMs,
      },
    })
  }, [emitRuntimeEvent, isComplete, progress, started])

  const handleAudioLog = useCallback(
    (kind: string, message: string) => {
      appendLog(kind, message)
      if (kind === 'media.ended') {
        emitRuntimeEvent('media.ended', { payload: { source: message } })
      } else if (kind === 'audio.error') {
        emitRuntimeEvent('media.error', { payload: { message } })
      }
    },
    [appendLog, emitRuntimeEvent],
  )

  const {
    status: audioStatus,
    loadCue: loadAudioCue,
    pause: pauseAudio,
    primeCue: primeAudioCue,
    resumeAt: resumeAudioAt,
    syncToTime: syncAudioToTime,
    stop: stopAudio,
  } = useAudioTransport({
    assetsById,
    onDurationChange: onAudioDurationChange,
    onLog: handleAudioLog,
  })

  const primeNextAudioCue = useCallback(
    (timelineTimeMs: number) => {
      for (const step of sortedTimeline) {
        const action = actionMap.get(step.actionId)
        if (action?.kind !== 'playAudio') continue
        const clipDurationMs = getClipDuration(step, action, assetsById)
        if (step.at <= timelineTimeMs && timelineTimeMs < step.at + clipDurationMs) {
          return
        }
        if (step.at < timelineTimeMs) continue
        primeAudioCue({
          action,
          timelineStartMs: step.at,
          timelineDurationMs: clipDurationMs,
        })
        return
      }
    },
    [actionMap, assetsById, primeAudioCue, sortedTimeline],
  )

  const clearClock = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    playingRef.current = false
  }, [])

  const clearVisualTimers = useCallback(() => {
    visualTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    visualTimersRef.current = []
  }, [])

  const publishTime = useCallback(
    (nextTime: number, forceNotify = false) => {
      const normalizedTime = Math.max(
        0,
        Math.min(timelineDuration, Math.round(nextTime)),
      )
      currentTimeRef.current = normalizedTime
      setDisplayTimeMs(normalizedTime)
      if (
        forceNotify ||
        normalizedTime === 0 ||
        normalizedTime === timelineDuration ||
        normalizedTime - lastNotifiedTimeRef.current >= 32
      ) {
        lastNotifiedTimeRef.current = normalizedTime
        onCurrentTimeChange?.(normalizedTime)
      }
    },
    [onCurrentTimeChange, timelineDuration],
  )

  const executeAction = useCallback(
    (
      action: SceneAction,
      logAction = true,
      timelineAtMs = currentTimeRef.current,
      timelineClipDurationMs?: number,
    ) => {
      switch (action.kind) {
        case 'show':
          setVisibleElementIds((current) =>
            current.includes(action.targetId)
              ? current
              : [...current, action.targetId],
          )
          if (logAction) appendLog('action.show', `Show ${action.targetId}`)
          break

        case 'hide':
          setVisibleElementIds((current) =>
            current.filter((elementId) => elementId !== action.targetId),
          )
          if (logAction) appendLog('action.hide', `Hide ${action.targetId}`)
          break

        case 'highlight': {
          setHighlight({ targetId: action.targetId, effect: action.effect })
          if (logAction) {
            appendLog('action.highlight', `Highlight ${action.targetId}`)
          }
          const timerId = window.setTimeout(() => {
            setHighlight((current) =>
              current?.targetId === action.targetId ? null : current,
            )
          }, action.durationMs ?? 900)
          visualTimersRef.current.push(timerId)
          break
        }

        case 'playAudio': {
          const clipDurationMs = timelineClipDurationMs ?? getClipDuration(
            { id: action.id, actionId: action.id, at: timelineAtMs },
            action,
            assetsById,
          )
          loadAudioCue(
            {
              action,
              timelineStartMs: timelineAtMs,
              timelineDurationMs: clipDurationMs,
            },
            timelineAtMs,
            playingRef.current,
          )
          if (logAction) {
            appendLog(
              'action.playAudio',
              action.assetId
                ? `Play audio ${action.assetId}`
                : action.url
                  ? 'Play remote audio'
                  : 'Audio missing',
            )
          }
          break
        }

        case 'speak':
          if (logAction) appendLog('action.speak', readText(action.text, locale))
          break

        case 'pause':
          if (logAction) appendLog('action.pause', 'Timeline paused')
          break

        case 'wait':
          if (logAction) {
            appendLog('action.wait', `Wait ${action.durationMs}ms`)
          }
          break

        case 'pauseUntilInteraction':
          if (logAction) {
            appendLog(
              'action.pauseUntilInteraction',
              completedInteractionIdsRef.current.has(action.interactionId)
                ? `${action.interactionId} already completed`
                : `Waiting for ${action.interactionId}`,
            )
          }
          break

        case 'setState':
          setRuntimeState((current) =>
            setRuntimePath(current, action.path, action.value),
          )
          if (logAction) appendLog('action.setState', `Set ${action.path}`)
          break

        case 'emitLearningEvent':
          emitRuntimeEvent('custom', {
            payload: { eventName: action.eventName, ...action.payload },
          })
          if (logAction) appendLog('learningEvent', action.eventName)
          break

        case 'move': {
          const token = ++animationTokenRef.current
          setElementVisuals((current) => ({
            ...current,
            [action.targetId]: {
              ...current[action.targetId],
              position: action.to,
              move: {
                durationMs: action.durationMs,
                easing: action.easing,
                token,
              },
            },
          }))
          if (logAction) appendLog('action.move', `Move ${action.targetId}`)
          break
        }

        case 'animate': {
          const token = ++animationTokenRef.current
          setElementVisuals((current) => ({
            ...current,
            [action.targetId]: {
              ...current[action.targetId],
              animation: {
                kind: action.animation,
                durationMs: action.durationMs,
                token,
              },
            },
          }))
          const timerId = window.setTimeout(() => {
            setElementVisuals((current) => {
              const visual = current[action.targetId]
              if (visual?.animation?.token !== token) return current
              return {
                ...current,
                [action.targetId]: { ...visual, animation: undefined },
              }
            })
          }, action.durationMs)
          visualTimersRef.current.push(timerId)
          if (logAction) {
            appendLog('action.animate', `${action.animation} ${action.targetId}`)
          }
          break
        }
      }
    },
    [appendLog, assetsById, emitRuntimeEvent, loadAudioCue, locale],
  )

  const runActions = useCallback(
    (actionIds: string[]) => {
      actionIds.forEach((actionId) => {
        const action = actionMap.get(actionId)
        if (!action) {
          appendLog('missing.action', `Missing action ${actionId}`)
          return
        }
        executeAction(action)
      })
    },
    [actionMap, appendLog, executeAction],
  )

  const runEvents = useCallback(
    (
      trigger: SceneEvent['on'],
      targetId: string | undefined,
      payload: Record<string, unknown> = {},
    ) => {
      scene.events.forEach((event) => {
        if (event.on !== trigger) return
        if (event.targetId && targetId && event.targetId !== targetId) return
        if (event.when && !evaluateCondition(event.when, payload)) return
        runActions(event.actions)
      })
    },
    [runActions, scene.events],
  )

  const applyTimelineSnapshot = useCallback(
    (timeMs: number) => {
      clearClock()
      clearVisualTimers()

      const visibleIds = new Set(getInitialVisibleElementIds(scene))
      let nextRuntimeState: Record<string, unknown> = scene.state
      let nextHighlight: HighlightState | null = null
      const nextVisuals: Record<string, ElementRuntimeVisual> = {}
      let activeAudioCue: {
        action: Extract<SceneAction, { kind: 'playAudio' }>
        timelineStartMs: number
        timelineDurationMs: number
      } | null = null
      let nextCursor = 0

      sortedTimeline.forEach((step, index) => {
        if (step.at > timeMs) return
        nextCursor = index + 1
        const action = actionMap.get(step.actionId)
        if (!action) return

        switch (action.kind) {
          case 'show':
            visibleIds.add(action.targetId)
            break
          case 'hide':
            visibleIds.delete(action.targetId)
            break
          case 'setState':
            nextRuntimeState = setRuntimePath(
              nextRuntimeState,
              action.path,
              action.value,
            )
            break
          case 'highlight':
            if (timeMs < step.at + (action.durationMs ?? 900)) {
              nextHighlight = {
                targetId: action.targetId,
                effect: action.effect,
              }
            }
            break
          case 'move':
            nextVisuals[action.targetId] = {
              ...nextVisuals[action.targetId],
              position: action.to,
            }
            break
          case 'animate': {
            const elapsedMs = timeMs - step.at
            if (elapsedMs < action.durationMs) {
              nextVisuals[action.targetId] = {
                ...nextVisuals[action.targetId],
                animation: {
                  kind: action.animation,
                  durationMs: action.durationMs,
                  elapsedMs,
                  paused: true,
                  token: ++animationTokenRef.current,
                },
              }
            }
            break
          }
          case 'playAudio': {
            const clipDurationMs = getClipDuration(step, action, assetsById)
            if (timeMs < step.at + clipDurationMs) {
              activeAudioCue = {
                action,
                timelineStartMs: step.at,
                timelineDurationMs: clipDurationMs,
              }
            }
            break
          }
        }
      })

      if (activeAudioCue) loadAudioCue(activeAudioCue, timeMs, false)
      else stopAudio()

      cursorRef.current = nextCursor
      setTimelineCursor(nextCursor)
      setVisibleElementIds([...visibleIds])
      setRuntimeState(nextRuntimeState)
      setHighlight(nextHighlight)
      setElementVisuals(nextVisuals)
      setWaitingInteractionId(null)
      waitingInteractionIdRef.current = null
      setPlaybackStatus(timeMs > 0 ? 'paused' : 'idle')
      playingRef.current = false
      currentTimeRef.current = timeMs
      setDisplayTimeMs(timeMs)
    },
    [
      actionMap,
      assetsById,
      clearClock,
      clearVisualTimers,
      loadAudioCue,
      scene,
      sortedTimeline,
      stopAudio,
    ],
  )

  const processTimelineUntil = useCallback(
    (targetTime: number) => {
      while (cursorRef.current < sortedTimeline.length) {
        const step = sortedTimeline[cursorRef.current]
        if (!step || step.at > targetTime) break

        const action = actionMap.get(step.actionId)
        emitRuntimeEvent('timeline.cueEntered', {
          targetLocator: { timelineId: step.id },
          payload: {
            actionId: step.actionId,
            ...(action ? { actionKind: action.kind } : {}),
          },
        })
        if (action) {
          executeAction(
            action,
            true,
            step.at,
            getClipDuration(step, action, assetsById),
          )
        }
        else appendLog('missing.action', `Missing action ${step.actionId}`)
        runEvents('timeline.enter', step.id)

        cursorRef.current += 1
        setTimelineCursor(cursorRef.current)

        if (action?.kind === 'pause') {
          clearClock()
          pauseAudio()
          setPlaybackStatus('paused')
          publishTime(step.at, true)
          emitRuntimeEvent('playback.paused', {
            targetLocator: { timelineId: step.id },
            payload: { reason: 'timelineAction' },
          })
          return true
        }

        if (
          action?.kind === 'pauseUntilInteraction' &&
          !completedInteractionIdsRef.current.has(action.interactionId)
        ) {
          clearClock()
          pauseAudio()
          waitingInteractionIdRef.current = action.interactionId
          setWaitingInteractionId(action.interactionId)
          setPlaybackStatus('waiting')
          publishTime(step.at, true)
          emitRuntimeEvent('playback.paused', {
            interactionId: action.interactionId,
            targetLocator: { interactionId: action.interactionId },
            payload: { reason: 'interaction' },
          })
          return true
        }
      }

      return false
    },
    [
      actionMap,
      appendLog,
      assetsById,
      clearClock,
      emitRuntimeEvent,
      executeAction,
      pauseAudio,
      publishTime,
      runEvents,
      sortedTimeline,
    ],
  )

  const startPlayback = useCallback(() => {
    if (playingRef.current || waitingInteractionIdRef.current) return

    ensureSceneStarted()

    if (timelineDuration === 0) {
      setPlaybackStatus('complete')
      setTimelineComplete(true)
      emitRuntimeEvent('timeline.completed')
      return
    }

    if (currentTimeRef.current >= timelineDuration) {
      if (!scene.playback.allowReplay) return
      applyTimelineSnapshot(0)
      cursorRef.current = 0
      setTimelineCursor(0)
      setTimelineComplete(false)
    }

    if (scene.playback.mode === 'manual') {
      emitRuntimeEvent('playback.started', {
        payload: { mode: scene.playback.mode },
      })
      playingRef.current = true
      stepTimelineRef.current()
      playingRef.current = false
      return
    }

    playingRef.current = true
    setPlaybackStatus('playing')
    emitRuntimeEvent('playback.started', {
      payload: { mode: scene.playback.mode },
    })
    lastFrameTimeRef.current = performance.now()
    resumeAudioAt(currentTimeRef.current)
    primeNextAudioCue(currentTimeRef.current)

    if (processTimelineUntil(currentTimeRef.current)) return

    const tick = (frameTime: number) => {
      if (!playingRef.current) return
      const elapsed = Math.min(frameTime - lastFrameTimeRef.current, 100)
      lastFrameTimeRef.current = frameTime
      const nextTime = Math.min(
        timelineDuration,
        currentTimeRef.current + Math.max(0, elapsed),
      )

      if (processTimelineUntil(nextTime)) return
      publishTime(nextTime)
      recordPlayedTime(nextTime)
      syncAudioToTime(nextTime)

      if (nextTime >= timelineDuration) {
        clearClock()
        stopAudio()
        setPlaybackStatus('complete')
        setTimelineComplete(true)
        recordPlayedTime(nextTime, true)
        appendLog('timeline.complete', 'Timeline complete')
        emitRuntimeEvent('timeline.completed')
        runEvents('scene.complete', undefined)
        return
      }

      frameRef.current = window.requestAnimationFrame(tick)
    }

    frameRef.current = window.requestAnimationFrame(tick)
  }, [
    appendLog,
    applyTimelineSnapshot,
    clearClock,
    emitRuntimeEvent,
    ensureSceneStarted,
    processTimelineUntil,
    primeNextAudioCue,
    publishTime,
    recordPlayedTime,
    resumeAudioAt,
    runEvents,
    scene.playback.allowReplay,
    scene.playback.mode,
    stopAudio,
    syncAudioToTime,
    timelineDuration,
  ])

  useEffect(() => {
    startPlaybackRef.current = startPlayback
  }, [startPlayback])

  const pausePlayback = useCallback(() => {
    if (!playingRef.current || !scene.playback.allowPause) return
    clearClock()
    pauseAudio()
    setPlaybackStatus('paused')
    appendLog('timeline.pause', 'Playback paused')
    emitRuntimeEvent('playback.paused', { payload: { reason: 'user' } })
  }, [
    appendLog,
    clearClock,
    emitRuntimeEvent,
    pauseAudio,
    scene.playback.allowPause,
  ])

  const submitInteraction = useCallback(
    (
      interactionId: string,
      isCorrect: boolean | null = true,
      answer?: JsonValue,
    ) => {
      const interaction = interactionsById.get(interactionId)
      if (!interaction) {
        appendLog('missing.interaction', `Missing interaction ${interactionId}`)
        return
      }

      ensureSceneStarted()
      const targetLocator = interaction.targetLocator ?? { interactionId }
      const attempt = createInteractionAttempt(attemptsRef.current, {
        interactionId,
        answer,
        isCorrect,
        playheadMs: currentTimeRef.current,
        targetLocator,
      })
      const nextAttempts = [...attemptsRef.current, attempt]
      attemptsRef.current = nextAttempts
      setAttempts(nextAttempts)

      completedInteractionIdsRef.current.add(interactionId)
      if (attempt.attemptNo > 1) {
        emitRuntimeEvent('interaction.retried', {
          interactionId,
          attemptNo: attempt.attemptNo,
          targetLocator,
        })
      }
      emitRuntimeEvent('interaction.submitted', {
        interactionId,
        attemptNo: attempt.attemptNo,
        targetLocator,
        payload: {
          isCorrect,
          ...(answer === undefined ? {} : { answer }),
        },
      })
      if (isCorrect !== null) {
        emitRuntimeEvent(
          isCorrect ? 'interaction.correct' : 'interaction.incorrect',
          {
            interactionId,
            attemptNo: attempt.attemptNo,
            targetLocator,
          },
        )
      }

      appendLog(
        isCorrect === null
          ? 'interaction.submitted'
          : isCorrect
            ? 'interaction.correct'
            : 'interaction.incorrect',
        `${interactionId} submitted`,
      )
      runEvents('interaction.submit', interactionId, { isCorrect })
      if (isCorrect !== null) {
        runEvents(
          isCorrect ? 'interaction.correct' : 'interaction.incorrect',
          interactionId,
          { isCorrect },
        )
      }

      if (waitingInteractionId === interactionId) {
        waitingInteractionIdRef.current = null
        setWaitingInteractionId(null)
        setPlaybackStatus('paused')
        window.setTimeout(() => startPlaybackRef.current(), 0)
      }
    },
    [
      appendLog,
      emitRuntimeEvent,
      ensureSceneStarted,
      interactionsById,
      runEvents,
      waitingInteractionId,
    ],
  )

  const resetPlayer = useCallback(() => {
    emitRuntimeEvent('playback.reset')
    clearClock()
    clearVisualTimers()
    stopAudio()
    completedInteractionIdsRef.current.clear()
    cursorRef.current = 0
    setVisibleElementIds(getInitialVisibleElementIds(scene))
    setHighlight(null)
    setElementVisuals({})
    setTimelineCursor(0)
    setPlaybackStatus('idle')
    waitingInteractionIdRef.current = null
    setWaitingInteractionId(null)
    setRuntimeState(scene.state)
    attemptsRef.current = []
    setAttempts([])
    maxPlayedTimeRef.current = 0
    lastPublishedMaxPlayedTimeRef.current = 0
    setMaxPlayedTimeMs(0)
    setTimelineComplete(false)
    sceneStartedRef.current = false
    completionEmittedRef.current = false
    setStarted(false)
    setLogs([])
    publishTime(0, true)
  }, [
    clearClock,
    clearVisualTimers,
    emitRuntimeEvent,
    publishTime,
    scene,
    stopAudio,
  ])

  const stepTimeline = useCallback(() => {
    if (playbackStatus === 'waiting') return
    ensureSceneStarted()
    const step = sortedTimeline[cursorRef.current]
    if (!step) {
      setPlaybackStatus('complete')
      setTimelineComplete(true)
      recordPlayedTime(timelineDuration, true)
      appendLog('timeline.complete', 'Timeline complete')
      emitRuntimeEvent('timeline.completed')
      runEvents('scene.complete', undefined)
      return
    }

    const blocked = processTimelineUntil(step.at)
    recordPlayedTime(step.at, true)
    if (!blocked) {
      publishTime(step.at, true)
      setPlaybackStatus('paused')
    }
  }, [
    appendLog,
    emitRuntimeEvent,
    ensureSceneStarted,
    playbackStatus,
    processTimelineUntil,
    publishTime,
    recordPlayedTime,
    runEvents,
    sortedTimeline,
    timelineDuration,
  ])

  useEffect(() => {
    stepTimelineRef.current = stepTimeline
  }, [stepTimeline])

  useEffect(() => {
    if (currentTimeMs === undefined || seekVersion === undefined) return
    if (appliedSeekVersionRef.current === seekVersion) return
    appliedSeekVersionRef.current = seekVersion

    const normalizedTime = Math.max(
      0,
      Math.min(timelineDuration, Math.round(currentTimeMs)),
    )
    if (normalizedTime === currentTimeRef.current) return
    applyTimelineSnapshot(normalizedTime)
    emitRuntimeEvent('playback.seeked', {
      payload: { toMs: normalizedTime },
    })
  }, [
    applyTimelineSnapshot,
    currentTimeMs,
    emitRuntimeEvent,
    seekVersion,
    timelineDuration,
  ])

  useEffect(() => {
    if (
      restoredComplete ||
      !scene.playback.autoStart ||
      scene.playback.mode === 'manual'
    ) {
      return
    }
    const timerId = window.setTimeout(() => startPlaybackRef.current(), 0)
    return () => window.clearTimeout(timerId)
  }, [restoredComplete, scene.playback.autoStart, scene.playback.mode])

  useEffect(() => {
    return () => {
      clearClock()
      clearVisualTimers()
    }
  }, [clearClock, clearVisualTimers])

  const isPlaying = playbackStatus === 'playing'
  const playDisabled =
    playbackStatus === 'waiting' ||
    (playbackStatus === 'complete' && !scene.playback.allowReplay)

  return (
    <section className="flex min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Scene Player
            </p>
            <Badge variant="outline">{getPlaybackStatusLabel(playbackStatus)}</Badge>
            <Badge variant="secondary">{context}</Badge>
            <Badge variant="outline">{scene.playback.mode}</Badge>
            {audioStatus !== 'idle' ? (
              <Badge variant="outline" aria-live="polite">
                {audioStatus === 'unavailable' ||
                audioStatus === 'blocked' ||
                audioStatus === 'error' ? (
                  <VolumeX data-icon="inline-start" />
                ) : (
                  <Volume2 data-icon="inline-start" />
                )}
                {getAudioStatusLabel(audioStatus)}
              </Badge>
            ) : null}
          </div>
          <h2 className="truncate text-lg font-semibold">
            {title ?? 'Untitled scene'}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="min-w-24 text-right text-xs tabular-nums text-muted-foreground">
            {formatPlayerTime(displayTimeMs)} / {formatPlayerTime(timelineDuration)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={resetPlayer}
            disabled={!scene.playback.allowReplay}
          >
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
          {context === 'editor' && scene.playback.mode !== 'manual' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={stepTimeline}
              disabled={isPlaying || playbackStatus === 'waiting'}
            >
              <StepForward data-icon="inline-start" />
              Step
            </Button>
          ) : null}
          <Button
            size="sm"
            onClick={isPlaying ? pausePlayback : startPlayback}
            disabled={playDisabled || (isPlaying && !scene.playback.allowPause)}
          >
            {isPlaying ? (
              <Pause data-icon="inline-start" />
            ) : playbackStatus === 'waiting' ? (
              <CirclePause data-icon="inline-start" />
            ) : (
              <Play data-icon="inline-start" />
            )}
            {getPlayButtonLabel(playbackStatus, scene.playback.mode)}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'grid min-h-0 gap-4',
          compact ? '' : 'xl:grid-cols-[minmax(0,1fr)_320px]',
        )}
      >
        <div className="flex min-w-0 flex-col gap-3">
          <div
            className={cn(
              'relative overflow-hidden rounded-lg border border-border shadow-sm',
              scene.canvas.safeArea === 'responsive'
                ? 'min-h-[420px] sm:min-h-0'
                : '',
            )}
            style={{
              aspectRatio: getAspectRatio(scene.canvas.aspectRatio),
              background: getCanvasBackground(scene.canvas.background),
            }}
          >
            {scene.elements.map((element) =>
              visibleSet.has(element.id) ? (
                <ElementRenderer
                  key={`${element.id}:${elementVisuals[element.id]?.animation?.token ?? 0}`}
                  element={element}
                  locale={locale}
                  highlightEffect={
                    highlight?.targetId === element.id ? highlight.effect : null
                  }
                  runtimeVisual={elementVisuals[element.id]}
                  interactionsById={interactionsById}
                  interactionAttempts={latestAttempts}
                  assetsById={assetsById}
                  onRunActions={runActions}
                  onSubmitInteraction={submitInteraction}
                />
              ) : null,
            )}
          </div>

          {waitingInteractionId ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CirclePause className="size-3.5" aria-hidden="true" />
              Waiting for {waitingInteractionId}
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-3">
            <Metric
              label="Timeline"
              value={`${timelineCursor}/${sortedTimeline.length}`}
            />
            <Metric
              label="Interactions"
              value={`${progress.completedInteractionIds.length}/${scene.interactions.length}`}
            />
            <Metric label="Progress" value={getProgressStatusLabel(progress.status)} />
          </div>

          {compact ? (
            <details className="rounded-md border border-border bg-card text-card-foreground">
              <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                Learning activity ({runtimeEvents.length} events, {reviewItems.length} review)
              </summary>
              <div className="border-t border-border p-2">
                <RuntimeEventPanel
                  events={runtimeEvents}
                  reviewItems={reviewItems}
                  locale={locale}
                />
              </div>
            </details>
          ) : null}
        </div>

        {compact ? null : (
          <aside className="flex min-h-0 flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Runtime
              </p>
              <h3 className="text-sm font-semibold">Learning events</h3>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <Metric label="Elements" value={String(runtimeRefs.elementIds.size)} />
              <Metric label="Attempts" value={String(attempts.length)} />
              <Metric label="Events" value={String(runtimeEvents.length)} />
            </div>

            <div className="min-h-44 overflow-auto rounded-md bg-background p-2">
              <RuntimeEventPanel
                events={runtimeEvents}
                reviewItems={reviewItems}
                locale={locale}
              />
            </div>

            <div className="rounded-md bg-background p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-normal text-muted-foreground">
                State
              </p>
              <pre className="max-h-32 overflow-auto text-xs text-muted-foreground">
                {JSON.stringify(runtimeState, null, 2)}
              </pre>
            </div>
          </aside>
        )}
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}

function getInitialVisibleElementIds(scene: SceneData) {
  return scene.elements
    .filter((element) => !element.hidden)
    .map((element) => element.id)
}

function getAspectRatio(value: SceneData['canvas']['aspectRatio']) {
  switch (value) {
    case '4:3':
      return '4 / 3'
    case '1:1':
      return '1 / 1'
    case '9:16':
      return '9 / 16'
    case 'responsive':
      return '16 / 9'
    case '16:9':
    default:
      return '16 / 9'
  }
}

function getCanvasBackground(background: SceneData['canvas']['background']) {
  switch (background.kind) {
    case 'color':
      return background.value
    case 'image':
      return background.url
        ? `center / ${background.fit} no-repeat url("${background.url}")`
        : 'var(--card)'
    case 'gradient':
      return `linear-gradient(${background.angle}deg, ${background.from}, ${background.to})`
  }
}

function getPlaybackStatusLabel(status: PlaybackStatus) {
  switch (status) {
    case 'playing':
      return 'Playing'
    case 'paused':
      return 'Paused'
    case 'waiting':
      return 'Waiting'
    case 'complete':
      return 'Complete'
    case 'idle':
    default:
      return 'Ready'
  }
}

function getAudioStatusLabel(status: AudioTransportStatus) {
  switch (status) {
    case 'loading':
      return 'Audio loading'
    case 'playing':
      return 'Audio playing'
    case 'paused':
      return 'Audio paused'
    case 'unavailable':
      return 'Audio unavailable'
    case 'blocked':
      return 'Audio blocked'
    case 'error':
      return 'Audio error'
    case 'idle':
    default:
      return 'Audio ready'
  }
}

function getPlayButtonLabel(
  status: PlaybackStatus,
  mode: SceneData['playback']['mode'],
) {
  if (mode === 'manual' && status !== 'waiting' && status !== 'complete') {
    return 'Next cue'
  }

  switch (status) {
    case 'playing':
      return 'Pause'
    case 'paused':
      return 'Continue'
    case 'waiting':
      return 'Waiting'
    case 'complete':
      return 'Replay'
    case 'idle':
    default:
      return 'Play'
  }
}

function getProgressStatusLabel(status: SceneProgress['status']) {
  switch (status) {
    case 'completed':
      return 'Complete'
    case 'inProgress':
      return 'In progress'
    case 'notStarted':
    default:
      return 'Not started'
  }
}

function createRuntimeId(prefix: 'event' | 'session') {
  const randomId =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}_${Math.random().toString(36).slice(2)}`
  return `${prefix}_${randomId}`
}

function formatPlayerTime(milliseconds: number) {
  const seconds = Math.max(0, milliseconds) / 1_000
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds - minutes * 60
  return `${minutes}:${remainder.toFixed(1).padStart(4, '0')}`
}

function readText(value: Record<string, string>, locale: string) {
  return (
    value[locale] ?? value.en ?? value.zhHans ?? Object.values(value)[0] ?? ''
  )
}

function setRuntimePath(
  current: Record<string, unknown>,
  path: string,
  value: unknown,
) {
  const key = path.replace(/^\$\./, '')
  return {
    ...current,
    [key]: value,
  }
}

function evaluateCondition(
  condition: NonNullable<SceneEvent['when']>,
  payload: Record<string, unknown>,
): boolean {
  if ('all' in condition) {
    return condition.all.every((child) => evaluateCondition(child, payload))
  }

  if ('any' in condition) {
    return condition.any.some((child) => evaluateCondition(child, payload))
  }

  if ('not' in condition) {
    return !evaluateCondition(condition.not, payload)
  }

  const actual = getRuntimePath(payload, condition.path)

  switch (condition.operator) {
    case 'notEquals':
      return actual !== condition.value
    case 'gt':
      return Number(actual) > Number(condition.value)
    case 'gte':
      return Number(actual) >= Number(condition.value)
    case 'lt':
      return Number(actual) < Number(condition.value)
    case 'lte':
      return Number(actual) <= Number(condition.value)
    case 'includes':
      return Array.isArray(actual) ? actual.includes(condition.value) : false
    case 'exists':
      return actual !== undefined
    case 'equals':
    default:
      return actual === condition.value
  }
}

function getRuntimePath(value: Record<string, unknown>, path: string) {
  const key = path.replace(/^\$\./, '')
  return value[key]
}
