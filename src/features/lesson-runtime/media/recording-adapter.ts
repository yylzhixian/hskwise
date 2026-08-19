import { createObservableValue } from './observable-value'

export const recordingStatusValues = [
  'idle',
  'requesting',
  'recording',
  'recorded',
  'denied',
  'unsupported',
  'error',
] as const

export type RecordingStatus = (typeof recordingStatusValues)[number]

export type RecordingResult = {
  url: string
  durationMs: number
  mimeType: string
  sizeBytes: number
}

export type RecordingSnapshot = {
  status: RecordingStatus
  recording: RecordingResult | null
}

export type RecordingAdapter = {
  getSnapshot: () => RecordingSnapshot
  subscribe: (listener: () => void) => () => void
  start: () => Promise<RecordingStatus>
  stop: () => Promise<RecordingStatus>
  reset: () => RecordingStatus
  dispose: () => void
}

const preferredMimeTypes = [
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/webm',
]

export function createBrowserRecordingAdapter(): RecordingAdapter {
  const observable = createObservableValue<RecordingSnapshot>({
    status: 'idle',
    recording: null,
  })
  let recorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  let chunks: Blob[] = []
  let startedAt = 0
  let recordingUrl: string | null = null
  let discardRecording = false
  let resolveStop: ((status: RecordingStatus) => void) | null = null

  function publish(status: RecordingStatus, recording: RecordingResult | null = null) {
    observable.set({ status, recording })
    resolveStop?.(status)
    resolveStop = null
  }

  function stopStream() {
    stream?.getTracks().forEach((track) => track.stop())
    stream = null
  }

  function revokeRecordingUrl() {
    if (!recordingUrl) return
    URL.revokeObjectURL(recordingUrl)
    recordingUrl = null
  }

  function reset() {
    if (recorder && recorder.state !== 'inactive') {
      discardRecording = true
      recorder.stop()
    } else {
      stopStream()
    }
    revokeRecordingUrl()
    chunks = []
    publish('idle')
    return 'idle' as const
  }

  return {
    getSnapshot: observable.getSnapshot,
    subscribe: observable.subscribe,
    start: async () => {
      if (
        typeof MediaRecorder === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        publish('unsupported')
        return 'unsupported'
      }

      revokeRecordingUrl()
      chunks = []
      discardRecording = false
      publish('requesting')

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mimeType = preferredMimeTypes.find((type) =>
          MediaRecorder.isTypeSupported(type),
        )
        recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream)

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data)
        }
        recorder.onerror = () => {
          stopStream()
          publish('error')
        }
        recorder.onstop = () => {
          stopStream()
          const stoppedRecorder = recorder
          recorder = null
          if (discardRecording) {
            discardRecording = false
            chunks = []
            return
          }

          const blob = new Blob(chunks, {
            type: stoppedRecorder?.mimeType || mimeType || 'audio/webm',
          })
          chunks = []
          if (blob.size === 0) {
            publish('error')
            return
          }

          recordingUrl = URL.createObjectURL(blob)
          publish('recorded', {
            url: recordingUrl,
            durationMs: Math.max(1, Date.now() - startedAt),
            mimeType: blob.type,
            sizeBytes: blob.size,
          })
        }

        startedAt = Date.now()
        recorder.start(250)
        publish('recording')
        return 'recording'
      } catch (error) {
        stopStream()
        const name = error instanceof DOMException ? error.name : ''
        const status =
          name === 'NotAllowedError' || name === 'SecurityError'
            ? 'denied'
            : 'error'
        publish(status)
        return status
      }
    },
    stop: async () => {
      if (!recorder || recorder.state === 'inactive') {
        return observable.getSnapshot().status
      }

      return new Promise<RecordingStatus>((resolve) => {
        resolveStop = resolve
        recorder?.stop()
      })
    },
    reset,
    dispose: () => {
      discardRecording = true
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      stopStream()
      revokeRecordingUrl()
      observable.clear()
    },
  }
}

export function createFixtureRecordingAdapter(options: {
  initialStatus?: RecordingStatus
  startResult?: Extract<
    RecordingStatus,
    'recording' | 'denied' | 'unsupported' | 'error'
  >
} = {}): RecordingAdapter {
  const initialStatus = options.initialStatus ?? 'idle'
  const observable = createObservableValue<RecordingSnapshot>({
    status: initialStatus,
    recording: null,
  })

  function publish(status: RecordingStatus) {
    observable.set({ status, recording: null })
    return status
  }

  return {
    getSnapshot: observable.getSnapshot,
    subscribe: observable.subscribe,
    start: async () => {
      if (['denied', 'unsupported', 'error'].includes(initialStatus)) {
        return initialStatus
      }
      publish('requesting')
      await Promise.resolve()
      return publish(options.startResult ?? 'recording')
    },
    stop: async () =>
      observable.getSnapshot().status === 'recording'
        ? publish('recorded')
        : observable.getSnapshot().status,
    reset: () => publish('idle'),
    dispose: observable.clear,
  }
}
