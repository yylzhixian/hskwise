import { atom } from 'jotai'

import {
  getCurrentLessonStep,
  getLessonProgressPercent,
} from '../model/lesson-session-machine'
import { lessonDefinitionAtom, lessonSessionAtom } from './lesson-base-atoms'

export type LessonCompletion = {
  eventId: string
  lessonId: string
  nodeId: string | null
  routeId: string | null
  completedAt: string | null
}

export const lessonSessionSummaryAtom = atom((get) => {
  const definition = get(lessonDefinitionAtom)
  const session = get(lessonSessionAtom)
  if (!definition || !session) return null

  return {
    lessonId: session.lessonId,
    title: definition.title,
    status: session.status,
    progressPercent: getLessonProgressPercent(definition, session),
    completedStepCount: definition.steps.filter(
      (step) => session.stepStates[step.id]?.status === 'completed',
    ).length,
    totalStepCount: definition.steps.length,
  }
})

export const currentLessonStepAtom = atom((get) => {
  const definition = get(lessonDefinitionAtom)
  const session = get(lessonSessionAtom)
  if (!definition || !session) return null

  const definitionStep = getCurrentLessonStep(definition, session)
  if (!definitionStep) return null

  const sessionStep = session.stepStates[definitionStep.id]
  if (!sessionStep) return null

  return {
    definition: definitionStep,
    session: sessionStep,
    index: session.activeStepIndex,
    total: definition.steps.length,
    isLast: session.activeStepIndex === definition.steps.length - 1,
  }
})

export const lessonFeedbackAtom = atom(
  (get) => get(lessonSessionAtom)?.feedback ?? null,
)

export const lessonCompletionAtom = atom<LessonCompletion | null>((get) => {
  const definition = get(lessonDefinitionAtom)
  const session = get(lessonSessionAtom)
  if (!definition || !session || session.status !== 'completed') return null

  const event = session.events.findLast(
    (item) => item.type === 'lesson.completed',
  )
  if (!event) return null

  return {
    eventId: event.id,
    lessonId: definition.id,
    nodeId: definition.nodeId ?? null,
    routeId: definition.routeId ?? null,
    completedAt: session.completedAt,
  }
})

export const lessonEventCountAtom = atom(
  (get) => get(lessonSessionAtom)?.events.length ?? 0,
)
