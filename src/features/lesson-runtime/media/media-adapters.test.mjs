import { describe, expect, test } from 'bun:test'

import { createFixtureAudioAdapter } from './audio-adapter.ts'
import { createFixtureRecordingAdapter } from './recording-adapter.ts'

describe('lesson media adapters', () => {
  test('maps audio loading, playing, paused, blocked, and unavailable states', async () => {
    const playing = createFixtureAudioAdapter()
    const observed = []
    playing.subscribe(() => observed.push(playing.getSnapshot()))

    expect(await playing.play()).toBe('playing')
    expect(observed).toEqual(['loading', 'playing'])
    expect(playing.pause()).toBe('paused')

    const blocked = createFixtureAudioAdapter({ playResult: 'blocked' })
    expect(await blocked.play()).toBe('blocked')

    const unavailable = createFixtureAudioAdapter({
      initialStatus: 'unavailable',
    })
    expect(await unavailable.play()).toBe('unavailable')
  })

  test('maps recording request, active, recorded, denied, unsupported, and error states', async () => {
    const recording = createFixtureRecordingAdapter()
    const observed = []
    recording.subscribe(() => observed.push(recording.getSnapshot().status))

    expect(await recording.start()).toBe('recording')
    expect(observed).toEqual(['requesting', 'recording'])
    expect(await recording.stop()).toBe('recorded')

    for (const status of ['denied', 'unsupported', 'error']) {
      const adapter = createFixtureRecordingAdapter({
        initialStatus: status,
      })
      expect(await adapter.start()).toBe(status)
    }
  })
})
