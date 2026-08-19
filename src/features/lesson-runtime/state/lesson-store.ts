import { createStore } from 'jotai/vanilla'

import { initializeLessonSessionAtom } from '../atoms/lesson-action-atoms'
import type { LessonDefinition } from '../model/lesson-definition'

type CreateLessonStoreOptions = {
  definition: LessonDefinition
  now?: string
  sessionId?: string
}

export function createLessonStore({
  definition,
  now = new Date().toISOString(),
  sessionId = `lesson-session-${definition.id}`,
}: CreateLessonStoreOptions) {
  const store = createStore()

  store.set(initializeLessonSessionAtom, {
    definition,
    now,
    sessionId,
  })

  return store
}

export type LessonStore = ReturnType<typeof createLessonStore>
