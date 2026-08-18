import type {
  LearningRuntimeEvent,
  RuntimeEventKind,
} from '../scene-schema/runtime-schema'

export type RuntimeEventFilter =
  | 'all'
  | 'scene'
  | 'answers'
  | 'media'
  | 'custom'

export function filterRuntimeEvents(
  events: LearningRuntimeEvent[],
  filter: RuntimeEventFilter,
) {
  if (filter === 'all') return events
  return events.filter((event) => getRuntimeEventGroup(event.type) === filter)
}

export function getRuntimeEventGroup(
  type: RuntimeEventKind,
): Exclude<RuntimeEventFilter, 'all'> {
  if (type.startsWith('interaction.')) return 'answers'
  if (type.startsWith('media.')) return 'media'
  if (type === 'custom') return 'custom'
  return 'scene'
}
