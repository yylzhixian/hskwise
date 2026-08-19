'use client'

import { useState } from 'react'

import { useLearningScenario } from '@/features/learning-state/hooks/use-learning-scenario'

import {
  getRuntimeMediaFixture,
  type RuntimeMediaFixtureId,
} from '../fixtures/runtime-media-fixtures'
import { createFixtureAudioAdapter } from '../media/audio-adapter'
import { createFixtureRecordingAdapter } from '../media/recording-adapter'

export function useRuntimeMediaFixture(fixtureId: RuntimeMediaFixtureId) {
  const { capabilities } = useLearningScenario()
  const fixture = getRuntimeMediaFixture(fixtureId)
  const audioStatus =
    fixtureId === 'normal' && capabilities.audio === 'unavailable'
      ? 'unavailable'
      : fixture.audioStatus
  const recordingStatus =
    fixtureId === 'normal' && capabilities.microphone === 'denied'
      ? 'denied'
      : fixture.recordingStatus
  const [adapters] = useState(() => ({
    audio: createFixtureAudioAdapter({ initialStatus: audioStatus }),
    recording: createFixtureRecordingAdapter({
      initialStatus: recordingStatus,
    }),
  }))

  return adapters
}
