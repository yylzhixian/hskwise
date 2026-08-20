import { z } from 'zod'

import {
  learningStateSchema,
  type LearningState,
} from '../model/learning-state-schema'

export const learningStorageKey = 'hskwise.learning:v2'
export const legacyLearningStorageKey = 'hskwise.learning:v1'

const legacyLearningStateSchema = learningStateSchema
  .omit({ version: true, mistakes: true, reviewQueue: true })
  .extend({
    version: z.literal(1),
    mistakes: z.array(
      learningStateSchema.shape.mistakes.element.omit({
        stepId: true,
        interactionId: true,
      }),
    ),
    reviewQueue: z.array(
      learningStateSchema.shape.reviewQueue.element.omit({
        sourceStepId: true,
        sourceInteractionId: true,
      }),
    ),
  })

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
    read: () =>
      storage.getItem(learningStorageKey) ??
      storage.getItem(legacyLearningStorageKey),
    write: (value) => {
      storage.setItem(learningStorageKey, value)
      storage.removeItem(legacyLearningStorageKey)
    },
    remove: () => {
      storage.removeItem(learningStorageKey)
      storage.removeItem(legacyLearningStorageKey)
    },
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
    const rawState: unknown = JSON.parse(serialized)
    const parsed = learningStateSchema.safeParse(rawState)

    if (parsed.success) return { kind: 'loaded', state: parsed.data }

    const legacy = legacyLearningStateSchema.safeParse(rawState)
    if (legacy.success) {
      return { kind: 'loaded', state: migrateLearningStateV1(legacy.data) }
    }

    return {
      kind: 'invalid',
      diagnostic: 'Saved progress was invalid and has been reset safely.',
    }
  } catch {
    return {
      kind: 'invalid',
      diagnostic: 'Saved progress could not be read and has been reset safely.',
    }
  }
}

function migrateLearningStateV1(
  legacy: z.infer<typeof legacyLearningStateSchema>,
): LearningState {
  return learningStateSchema.parse({
    ...legacy,
    version: 2,
    mistakes: legacy.mistakes.map((mistake) => ({
      ...mistake,
      stepId: 'legacy-unlinked',
      interactionId: 'legacy-unlinked',
    })),
    reviewQueue: legacy.reviewQueue.map((item) => ({
      ...item,
      sourceStepId: 'legacy-unlinked',
      sourceInteractionId: 'legacy-unlinked',
    })),
  })
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
