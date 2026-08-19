import { atom } from 'jotai'
import { atomWithImmer } from 'jotai-immer'

import type { LessonDefinition } from '../model/lesson-definition'
import type { LessonSession } from '../model/lesson-session-schema'

export const lessonDefinitionAtom = atom<LessonDefinition | null>(null)
export const lessonSessionAtom = atomWithImmer<LessonSession | null>(null)
