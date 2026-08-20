import {
  learningStateSchema,
  type LearningState,
} from '../model/learning-state-schema'

export const learningStorageKey = 'hskwise.learning:v1'

export type LearningStorageAdapter = {
  read: () => string | null
  write: (value: string) => void
  remove: () => void
}

export type LearningStorageLoadResult =
  | { kind: 'empty' }
  | { kind: 'loaded'; state: LearningState }
  | { kind: 'invalid'; diagnostic: string }
  | { kind: 'unavailable'; diagnostic: string }

export function createWebStorageAdapter(storage: Storage): LearningStorageAdapter {
  return {
    read: () => storage.getItem(learningStorageKey),
    write: (value) => storage.setItem(learningStorageKey, value),
    remove: () => storage.removeItem(learningStorageKey),
  }
}

export function loadLearningState(
  adapter: LearningStorageAdapter,
): LearningStorageLoadResult {
  let serialized: string | null

  try {
    serialized = adapter.read()
  } catch {
    return {
      kind: 'unavailable',
      diagnostic: 'Browser storage is unavailable. Progress is held in memory.',
    }
  }

  if (serialized === null) return { kind: 'empty' }

  try {
    const parsed = learningStateSchema.safeParse(JSON.parse(serialized))

    if (!parsed.success) {
      return {
        kind: 'invalid',
        diagnostic: 'Saved progress was invalid and has been reset safely.',
      }
    }

    return { kind: 'loaded', state: parsed.data }
  } catch {
    return {
      kind: 'invalid',
      diagnostic: 'Saved progress could not be read and has been reset safely.',
    }
  }
}

export function saveLearningState(
  adapter: LearningStorageAdapter,
  state: LearningState,
): { ok: true } | { ok: false; diagnostic: string } {
  const parsed = learningStateSchema.safeParse(state)

  if (!parsed.success) {
    return { ok: false, diagnostic: 'Progress did not match the storage schema.' }
  }

  try {
    adapter.write(JSON.stringify(parsed.data))
    return { ok: true }
  } catch {
    return {
      ok: false,
      diagnostic: 'Progress could not be saved and is held in memory.',
    }
  }
}
