import { atom } from 'jotai'

import {
  advanceLessonSession,
  completeLessonMedia,
  createLessonSession,
  retryLessonStep,
  submitLessonAttempt,
} from '../model/lesson-session-machine'
import type { LessonDefinition } from '../model/lesson-definition'
import type { LessonFeedback } from '../model/lesson-session-schema'
import { lessonDefinitionAtom, lessonSessionAtom } from './lesson-base-atoms'

type InitializeLessonInput = {
  sessionId: string
  now: string
  definition: LessonDefinition
}

type SubmitAttemptAction = {
  stepId: string
  interactionId: string
  isCorrect: boolean | null
  answer?: unknown
  now: string
  correctFeedback?: Omit<LessonFeedback, 'kind'>
  infoFeedback?: Omit<LessonFeedback, 'kind'>
  incorrectFeedback?: Omit<LessonFeedback, 'kind'>
}

type CompleteMediaAction = {
  stepId: string
  mediaId: string
  now: string
  feedback?: Omit<LessonFeedback, 'kind'>
}

export const initializeLessonSessionAtom = atom(
  null,
  (_get, set, input: InitializeLessonInput) => {
    set(lessonDefinitionAtom, input.definition)
    set(
      lessonSessionAtom,
      () =>
        createLessonSession(input.definition, {
          sessionId: input.sessionId,
          now: input.now,
        }),
    )
  },
)

export const submitLessonAttemptAtom = atom(
  null,
  (get, set, input: SubmitAttemptAction) => {
    const definition = get(lessonDefinitionAtom)
    const session = get(lessonSessionAtom)
    if (!definition || !session) return

    set(lessonSessionAtom, () =>
      submitLessonAttempt(definition, session, input),
    )
  },
)

export const retryLessonStepAtom = atom(
  null,
  (get, set, now: string) => {
    const definition = get(lessonDefinitionAtom)
    const session = get(lessonSessionAtom)
    if (!definition || !session) return

    set(lessonSessionAtom, () =>
      retryLessonStep(definition, session, now),
    )
  },
)

export const completeLessonMediaAtom = atom(
  null,
  (get, set, input: CompleteMediaAction) => {
    const definition = get(lessonDefinitionAtom)
    const session = get(lessonSessionAtom)
    if (!definition || !session) return

    set(lessonSessionAtom, () =>
      completeLessonMedia(definition, session, input),
    )
  },
)

export const advanceLessonSessionAtom = atom(
  null,
  (get, set, now: string) => {
    const definition = get(lessonDefinitionAtom)
    const session = get(lessonSessionAtom)
    if (!definition || !session) return

    set(lessonSessionAtom, () =>
      advanceLessonSession(definition, session, now),
    )
  },
)
