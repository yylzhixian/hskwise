import { describe, expect, test } from 'bun:test'

import {
  filterRuntimeEvents,
  getRuntimeEventGroup,
} from './runtime-event-utils.ts'

describe('Course Studio runtime event filters', () => {
  test('groups answer, media, custom, and scene events', () => {
    expect(getRuntimeEventGroup('interaction.incorrect')).toBe('answers')
    expect(getRuntimeEventGroup('media.error')).toBe('media')
    expect(getRuntimeEventGroup('custom')).toBe('custom')
    expect(getRuntimeEventGroup('timeline.cueEntered')).toBe('scene')
  })

  test('filters without changing event order', () => {
    const events = [
      { id: 'event_1', type: 'scene.started' },
      { id: 'event_2', type: 'interaction.submitted' },
      { id: 'event_3', type: 'interaction.incorrect' },
      { id: 'event_4', type: 'media.error' },
    ]

    expect(filterRuntimeEvents(events, 'answers').map((event) => event.id)).toEqual([
      'event_2',
      'event_3',
    ])
    expect(filterRuntimeEvents(events, 'all')).toBe(events)
  })
})
