import type { AudioStatus } from '../media/audio-adapter'
import type { RecordingStatus } from '../media/recording-adapter'

export const runtimeMediaFixtureIds = [
  'normal',
  'audio-loading',
  'audio-playing',
  'audio-paused',
  'audio-unavailable',
  'audio-blocked',
  'audio-error',
  'microphone-requesting',
  'microphone-recording',
  'microphone-recorded',
  'microphone-denied',
  'microphone-unsupported',
  'microphone-error',
] as const

export type RuntimeMediaFixtureId = (typeof runtimeMediaFixtureIds)[number]

type RuntimeMediaFixture = {
  id: RuntimeMediaFixtureId
  label: string
  audioStatus: AudioStatus
  recordingStatus: RecordingStatus
}

const fixtures: Record<RuntimeMediaFixtureId, RuntimeMediaFixture> = {
  normal: {
    id: 'normal',
    label: 'Interactive media',
    audioStatus: 'idle',
    recordingStatus: 'idle',
  },
  'audio-loading': {
    id: 'audio-loading',
    label: 'Audio loading',
    audioStatus: 'loading',
    recordingStatus: 'idle',
  },
  'audio-playing': {
    id: 'audio-playing',
    label: 'Audio playing',
    audioStatus: 'playing',
    recordingStatus: 'idle',
  },
  'audio-paused': {
    id: 'audio-paused',
    label: 'Audio paused',
    audioStatus: 'paused',
    recordingStatus: 'idle',
  },
  'audio-unavailable': {
    id: 'audio-unavailable',
    label: 'Audio unavailable',
    audioStatus: 'unavailable',
    recordingStatus: 'idle',
  },
  'audio-blocked': {
    id: 'audio-blocked',
    label: 'Audio blocked',
    audioStatus: 'blocked',
    recordingStatus: 'idle',
  },
  'audio-error': {
    id: 'audio-error',
    label: 'Audio error',
    audioStatus: 'error',
    recordingStatus: 'idle',
  },
  'microphone-requesting': {
    id: 'microphone-requesting',
    label: 'Microphone requesting',
    audioStatus: 'idle',
    recordingStatus: 'requesting',
  },
  'microphone-recording': {
    id: 'microphone-recording',
    label: 'Microphone recording',
    audioStatus: 'idle',
    recordingStatus: 'recording',
  },
  'microphone-recorded': {
    id: 'microphone-recorded',
    label: 'Microphone recorded',
    audioStatus: 'idle',
    recordingStatus: 'recorded',
  },
  'microphone-denied': {
    id: 'microphone-denied',
    label: 'Microphone denied',
    audioStatus: 'idle',
    recordingStatus: 'denied',
  },
  'microphone-unsupported': {
    id: 'microphone-unsupported',
    label: 'Microphone unsupported',
    audioStatus: 'idle',
    recordingStatus: 'unsupported',
  },
  'microphone-error': {
    id: 'microphone-error',
    label: 'Microphone error',
    audioStatus: 'idle',
    recordingStatus: 'error',
  },
}

export const runtimeMediaFixtureOptions = runtimeMediaFixtureIds.map((id) => ({
  label: fixtures[id].label,
  value: id,
}))

export function isRuntimeMediaFixtureId(
  value: string | null | undefined,
): value is RuntimeMediaFixtureId {
  return runtimeMediaFixtureIds.includes(value as RuntimeMediaFixtureId)
}

export function getRuntimeMediaFixture(id: RuntimeMediaFixtureId) {
  return fixtures[id]
}
