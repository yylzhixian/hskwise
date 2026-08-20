'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useAudioRecorder } from '@/hooks/media/use-audio-recorder'

import type { DialogueLine } from '../model/dialogue-lesson-schema'
import { useDialogueAudio } from './use-dialogue-audio'

export type DialogueRolePracticePhase =
  | 'ready'
  | 'playing-partner'
  | 'countdown-user'
  | 'requesting-microphone'
  | 'recording-user'
  | 'handoff-user'
  | 'audio-unavailable'
  | 'microphone-unavailable'
  | 'complete'

export const ROLE_RECORDING_COUNTDOWN_SECONDS = 3
export const ROLE_TURN_HANDOFF_DELAY_MS = 1000

export type DialogueTurnRecording = {
  durationMs: number
  lineId: string
  url: string
}

export function useDialogueRolePractice({
  completed,
  initialRoleId,
  lines,
  onComplete,
}: {
  completed: boolean
  initialRoleId: string
  lines: DialogueLine[]
  onComplete: () => void
}) {
  const {
    activeLineId,
    audioRef,
    markEnded: finishAudioPlayback,
    markError: markAudioError,
    playLine,
    status: audioStatus,
  } = useDialogueAudio()
  const {
    durationMs: recordingDurationMs,
    recordingBlob,
    recordingUrl,
    reset: resetRecording,
    start: startRecording,
    status: recorderStatus,
    stop: stopRecording,
  } = useAudioRecorder()
  const [practiceRoleId, setPracticeRoleId] = useState(initialRoleId)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [sessionId, setSessionId] = useState(0)
  const [turnAttempt, setTurnAttempt] = useState(0)
  const [started, setStarted] = useState(false)
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(
    null,
  )
  const [handoffPending, setHandoffPending] = useState(false)
  const [turnRecordings, setTurnRecordings] = useState<
    DialogueTurnRecording[]
  >([])
  const startedTurnRef = useRef<string | null>(null)
  const handledRecordingUrlRef = useRef<string | null>(null)
  const recordingStartRequestedRef = useRef(false)
  const retainedRecordingUrlsRef = useRef<Set<string>>(new Set())

  const currentLine = lines[currentLineIndex] ?? null
  const isUserTurn = currentLine?.speakerId === practiceRoleId
  const isFinished = started && currentLineIndex >= lines.length

  const prepareTurn = useCallback(
    (lineIndex: number) => {
      const nextLine = lines[lineIndex]
      recordingStartRequestedRef.current = false
      setCurrentLineIndex(lineIndex)
      setCountdownRemaining(
        nextLine?.speakerId === practiceRoleId
          ? ROLE_RECORDING_COUNTDOWN_SECONDS
          : null,
      )
      setHandoffPending(false)
    },
    [lines, practiceRoleId],
  )

  const advanceTurn = useCallback(() => {
    prepareTurn(Math.min(currentLineIndex + 1, lines.length))
    setTurnAttempt(0)
  }, [currentLineIndex, lines.length, prepareTurn])

  useEffect(() => {
    if (!started || !currentLine || isFinished) return

    const turnKey = `${sessionId}:${currentLineIndex}:${turnAttempt}`
    if (startedTurnRef.current === turnKey) return
    startedTurnRef.current = turnKey

    if (isUserTurn) return

    void playLine(currentLine)
  }, [
    currentLine,
    currentLineIndex,
    isFinished,
    isUserTurn,
    playLine,
    sessionId,
    started,
    turnAttempt,
  ])

  const beginRecording = useCallback(() => {
    if (recordingStartRequestedRef.current) return
    recordingStartRequestedRef.current = true
    setCountdownRemaining(null)
    void startRecording()
  }, [startRecording])

  useEffect(() => {
    if (
      !started ||
      !isUserTurn ||
      handoffPending ||
      countdownRemaining === null
    ) {
      return
    }

    const timer = window.setTimeout(() => {
      if (countdownRemaining <= 1) {
        beginRecording()
        return
      }
      setCountdownRemaining((current) =>
        current === null ? null : current - 1,
      )
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [
    beginRecording,
    countdownRemaining,
    handoffPending,
    isUserTurn,
    started,
  ])

  useEffect(() => {
    if (
      !started ||
      recorderStatus !== 'recorded' ||
      !recordingBlob ||
      !recordingUrl ||
      recordingDurationMs === null ||
      !currentLine ||
      handledRecordingUrlRef.current === recordingUrl
    ) {
      return
    }

    handledRecordingUrlRef.current = recordingUrl
    const retainedUrl = URL.createObjectURL(recordingBlob)
    retainedRecordingUrlsRef.current.add(retainedUrl)
    setTurnRecordings((current) => [
      ...current.filter((recording) => recording.lineId !== currentLine.id),
      {
        durationMs: recordingDurationMs,
        lineId: currentLine.id,
        url: retainedUrl,
      },
    ])
    setHandoffPending(true)
  }, [
    currentLine,
    recorderStatus,
    recordingBlob,
    recordingDurationMs,
    recordingUrl,
    started,
  ])

  useEffect(() => {
    if (!handoffPending) return
    const timer = window.setTimeout(advanceTurn, ROLE_TURN_HANDOFF_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [advanceTurn, handoffPending])

  useEffect(() => {
    if (isFinished && !completed) onComplete()
  }, [completed, isFinished, onComplete])

  const selectRole = useCallback(
    (values: string[]) => {
      const roleId = values[0]
      if (!roleId || started) return
      resetRecording()
      setPracticeRoleId(roleId)
    },
    [resetRecording, started],
  )

  const startConversation = useCallback(() => {
    resetRecording()
    for (const url of retainedRecordingUrlsRef.current) {
      URL.revokeObjectURL(url)
    }
    retainedRecordingUrlsRef.current.clear()
    setTurnRecordings([])
    handledRecordingUrlRef.current = null
    startedTurnRef.current = null
    prepareTurn(0)
    setTurnAttempt(0)
    setSessionId((current) => current + 1)
    setStarted(true)
  }, [prepareTurn, resetRecording])

  const markAudioEnded = useCallback(() => {
    finishAudioPlayback()
    if (!isFinished) advanceTurn()
  }, [advanceTurn, finishAudioPlayback, isFinished])

  const retryCurrentTurn = useCallback(() => {
    resetRecording()
    startedTurnRef.current = null
    recordingStartRequestedRef.current = false
    setHandoffPending(false)
    setCountdownRemaining(
      isUserTurn ? ROLE_RECORDING_COUNTDOWN_SECONDS : null,
    )
    setTurnAttempt((current) => current + 1)
  }, [isUserTurn, resetRecording])

  const skipUnavailableTurn = useCallback(() => {
    resetRecording()
    advanceTurn()
  }, [advanceTurn, resetRecording])

  const resetConversation = useCallback(() => {
    resetRecording()
    for (const url of retainedRecordingUrlsRef.current) {
      URL.revokeObjectURL(url)
    }
    retainedRecordingUrlsRef.current.clear()
    setTurnRecordings([])
    handledRecordingUrlRef.current = null
    startedTurnRef.current = null
    recordingStartRequestedRef.current = false
    setCurrentLineIndex(0)
    setTurnAttempt(0)
    setCountdownRemaining(null)
    setHandoffPending(false)
    setStarted(false)
  }, [resetRecording])

  useEffect(
    () => () => {
      for (const url of retainedRecordingUrlsRef.current) {
        URL.revokeObjectURL(url)
      }
      retainedRecordingUrlsRef.current.clear()
    },
    [],
  )

  return {
    activeLineId,
    audioRef,
    audioStatus,
    completedLineCount: Math.min(currentLineIndex, lines.length),
    countdownRemaining,
    currentLine,
    currentLineIndex,
    isFinished,
    isUserTurn,
    markAudioEnded,
    markAudioError,
    phase: getRolePracticePhase({
      audioStatus,
      countdownRemaining,
      handoffPending,
      isFinished,
      isUserTurn,
      recorderStatus,
      started,
    }),
    practiceRoleId,
    playReferenceLine: playLine,
    resetConversation,
    retryCurrentTurn,
    selectRole,
    skipUnavailableTurn,
    skipCountdown: beginRecording,
    startConversation,
    started,
    stopRecording,
    turnRecordings,
  }
}

export function getRolePracticePhase({
  audioStatus,
  countdownRemaining,
  handoffPending,
  isFinished,
  isUserTurn,
  recorderStatus,
  started,
}: {
  audioStatus: 'idle' | 'playing' | 'blocked' | 'error'
  countdownRemaining: number | null
  handoffPending: boolean
  isFinished: boolean
  isUserTurn: boolean
  recorderStatus:
    | 'idle'
    | 'requesting'
    | 'recording'
    | 'recorded'
    | 'denied'
    | 'unsupported'
    | 'error'
  started: boolean
}): DialogueRolePracticePhase {
  if (!started) return 'ready'
  if (isFinished) return 'complete'

  if (isUserTurn) {
    if (handoffPending) return 'handoff-user'
    if (countdownRemaining !== null) return 'countdown-user'
    if (recorderStatus === 'requesting') return 'requesting-microphone'
    if (recorderStatus === 'recording') return 'recording-user'
    if (
      recorderStatus === 'denied' ||
      recorderStatus === 'unsupported' ||
      recorderStatus === 'error'
    ) {
      return 'microphone-unavailable'
    }
    return 'requesting-microphone'
  }

  if (audioStatus === 'blocked' || audioStatus === 'error') {
    return 'audio-unavailable'
  }
  return 'playing-partner'
}
