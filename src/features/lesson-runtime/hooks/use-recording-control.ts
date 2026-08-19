'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import type { RecordingAdapter } from '../media/recording-adapter'

export type {
  RecordingAdapter as RecordingControlAdapter,
  RecordingStatus as RecordingControlStatus,
} from '../media/recording-adapter'

export function useRecordingControl(adapter: RecordingAdapter) {
  const snapshot = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSnapshot,
    adapter.getSnapshot,
  )

  useEffect(() => () => adapter.dispose(), [adapter])

  return {
    ...snapshot,
    start: useCallback(() => adapter.start(), [adapter]),
    stop: useCallback(() => adapter.stop(), [adapter]),
    reset: useCallback(() => adapter.reset(), [adapter]),
  }
}
