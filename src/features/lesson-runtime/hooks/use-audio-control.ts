'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import type { AudioAdapter } from '../media/audio-adapter'

export type {
  AudioAdapter as AudioControlAdapter,
  AudioStatus as AudioControlStatus,
} from '../media/audio-adapter'

export function useAudioControl(adapter: AudioAdapter) {
  const status = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSnapshot,
    adapter.getSnapshot,
  )

  useEffect(() => () => adapter.dispose(), [adapter])

  return {
    status,
    play: useCallback(() => adapter.play(), [adapter]),
    pause: useCallback(() => adapter.pause(), [adapter]),
    reset: useCallback(() => adapter.reset(), [adapter]),
  }
}
