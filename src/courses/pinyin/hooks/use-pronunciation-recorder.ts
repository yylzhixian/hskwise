'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type PronunciationRecorderStatus =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'recorded'
  | 'denied'
  | 'unsupported'
  | 'error'

type Recording = {
  mimeType: string
  url: string
}

export function usePronunciationRecorder() {
  const [status, setStatus] =
    useState<PronunciationRecorderStatus>('idle')
  const [recording, setRecording] = useState<Recording | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const mountedRef = useRef(true)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const start = useCallback(async () => {
    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      !window.MediaRecorder
    ) {
      setStatus('unsupported')
      return
    }

    setRecording(null)
    setStatus('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorderRef.current = recorder
      streamRef.current = stream

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      })
      recorder.addEventListener(
        'stop',
        () => {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          })
          releaseStream()
          recorderRef.current = null

          if (!mountedRef.current) return
          if (blob.size === 0) {
            setStatus('error')
            return
          }

          setRecording({
            mimeType: blob.type,
            url: URL.createObjectURL(blob),
          })
          setStatus('recorded')
        },
        { once: true },
      )

      recorder.start()
      setStatus('recording')
    } catch (error) {
      releaseStream()
      recorderRef.current = null
      if (!mountedRef.current) return
      setStatus(
        error instanceof DOMException &&
          (error.name === 'NotAllowedError' ||
            error.name === 'PermissionDeniedError')
          ? 'denied'
          : 'error',
      )
    }
  }, [releaseStream])

  const stop = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder?.state === 'recording') recorder.stop()
  }, [])

  const reset = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
    releaseStream()
    setRecording(null)
    setStatus('idle')
  }, [releaseStream])

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.stop()
      }
      releaseStream()
    }
  }, [releaseStream])

  useEffect(() => {
    const recordingUrl = recording?.url
    return () => {
      if (recordingUrl) URL.revokeObjectURL(recordingUrl)
    }
  }, [recording?.url])

  return {
    mimeType: recording?.mimeType ?? null,
    recordingUrl: recording?.url ?? null,
    reset,
    start,
    status,
    stop,
  }
}
