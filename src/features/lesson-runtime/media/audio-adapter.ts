import { createObservableValue } from './observable-value'

export const audioStatusValues = [
  'idle',
  'loading',
  'playing',
  'paused',
  'unavailable',
  'blocked',
  'error',
] as const

export type AudioStatus = (typeof audioStatusValues)[number]

export type AudioAdapter = {
  getSnapshot: () => AudioStatus
  subscribe: (listener: () => void) => () => void
  play: () => Promise<AudioStatus>
  pause: () => AudioStatus
  reset: () => AudioStatus
  dispose: () => void
}

export function createBrowserAudioAdapter(source?: string): AudioAdapter {
  const observable = createObservableValue<AudioStatus>(
    source ? 'idle' : 'unavailable',
  )
  let audio: HTMLAudioElement | null = null

  function ensureAudio() {
    if (!source) return null
    if (audio) return audio

    audio = new Audio(source)
    audio.preload = 'metadata'
    audio.onended = () => observable.set('paused')
    audio.onerror = () => observable.set('error')
    return audio
  }

  return {
    getSnapshot: observable.getSnapshot,
    subscribe: observable.subscribe,
    play: async () => {
      const activeAudio = ensureAudio()
      if (!activeAudio) {
        observable.set('unavailable')
        return 'unavailable'
      }

      observable.set('loading')
      try {
        await activeAudio.play()
        observable.set('playing')
        return 'playing'
      } catch (error) {
        const status =
          error instanceof DOMException && error.name === 'NotAllowedError'
            ? 'blocked'
            : 'error'
        observable.set(status)
        return status
      }
    },
    pause: () => {
      audio?.pause()
      observable.set(source ? 'paused' : 'unavailable')
      return observable.getSnapshot()
    },
    reset: () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      observable.set(source ? 'idle' : 'unavailable')
      return observable.getSnapshot()
    },
    dispose: () => {
      if (audio) {
        audio.pause()
        audio.onended = null
        audio.onerror = null
        audio = null
      }
      observable.clear()
    },
  }
}

export function createFixtureAudioAdapter(options: {
  initialStatus?: AudioStatus
  playResult?: Extract<
    AudioStatus,
    'playing' | 'blocked' | 'error' | 'unavailable'
  >
} = {}): AudioAdapter {
  const initialStatus = options.initialStatus ?? 'idle'
  const observable = createObservableValue<AudioStatus>(initialStatus)

  return {
    getSnapshot: observable.getSnapshot,
    subscribe: observable.subscribe,
    play: async () => {
      if (initialStatus === 'unavailable') return 'unavailable'
      observable.set('loading')
      await Promise.resolve()
      const result = options.playResult ?? 'playing'
      observable.set(result)
      return result
    },
    pause: () => {
      if (observable.getSnapshot() === 'playing') observable.set('paused')
      return observable.getSnapshot()
    },
    reset: () => {
      observable.set(initialStatus)
      return initialStatus
    },
    dispose: observable.clear,
  }
}
