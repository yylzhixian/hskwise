'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type VoiceRecording = {
  url: string
  durationMs: number
  mimeType: string
  sizeBytes: number
}

export type VoiceRecorderStatus =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'recorded'
  | 'unsupported'
  | 'denied'
  | 'error'

const preferredMimeTypes = [
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/webm',
]

export function useVoiceRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef(0)
  const discardRef = useRef(false)
  const recordingUrlRef = useRef<string | null>(null)
  const [status, setStatus] = useState<VoiceRecorderStatus>('idle')
  const [recording, setRecording] = useState<VoiceRecording | null>(null)

  const revokeRecordingUrl = useCallback(() => {
    if (!recordingUrlRef.current) return
    URL.revokeObjectURL(recordingUrlRef.current)
    recordingUrlRef.current = null
  }, [])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const startRecording = useCallback(async () => {
    if (
      typeof MediaRecorder === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setStatus('unsupported')
      return
    }

    revokeRecordingUrl()
    setRecording(null)
    setStatus('requesting')
    discardRef.current = false
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = preferredMimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type),
      )
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      streamRef.current = stream
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onerror = () => {
        stopStream()
        setStatus('error')
      }
      recorder.onstop = () => {
        stopStream()
        recorderRef.current = null
        if (discardRef.current) {
          discardRef.current = false
          chunksRef.current = []
          return
        }

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || 'audio/webm',
        })
        chunksRef.current = []
        if (blob.size === 0) {
          setStatus('error')
          return
        }

        const url = URL.createObjectURL(blob)
        recordingUrlRef.current = url
        setRecording({
          url,
          durationMs: Math.max(1, Date.now() - startedAtRef.current),
          mimeType: blob.type,
          sizeBytes: blob.size,
        })
        setStatus('recorded')
      }

      startedAtRef.current = Date.now()
      recorder.start(250)
      setStatus('recording')
    } catch (error) {
      stopStream()
      const name = error instanceof DOMException ? error.name : ''
      setStatus(
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'denied'
          : 'error',
      )
    }
  }, [revokeRecordingUrl, stopStream])

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    recorder.stop()
  }, [])

  const resetRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      discardRef.current = true
      recorder.stop()
    } else {
      stopStream()
    }
    revokeRecordingUrl()
    setRecording(null)
    setStatus('idle')
  }, [revokeRecordingUrl, stopStream])

  useEffect(
    () => () => {
      discardRef.current = true
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      stopStream()
      revokeRecordingUrl()
    },
    [revokeRecordingUrl, stopStream],
  )

  return {
    status,
    recording,
    startRecording,
    stopRecording,
    resetRecording,
  }
}
