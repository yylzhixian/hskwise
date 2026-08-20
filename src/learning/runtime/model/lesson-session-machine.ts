import type {
  LessonDefinition,
  LessonStepDefinition,
} from './lesson-definition'
import type {
  LessonAttempt,
  LessonFeedback,
  LessonRuntimeEvent,
  LessonSession,
  LessonStepSession,
} from './lesson-session-schema'

type SubmitLessonAttemptInput = {
  stepId: string
  interactionId: string
  isCorrect: boolean | null
  answer?: unknown
  now: string
  correctFeedback?: Omit<LessonFeedback, 'kind'>
  incorrectFeedback?: Omit<LessonFeedback, 'kind'>
}

type CompleteLessonMediaInput = {
  stepId: string
  mediaId: string
  now: string
  feedback?: Omit<LessonFeedback, 'kind'>
}

export function createLessonSession(
  definition: LessonDefinition,
  input: { sessionId: string; now: string },
): LessonSession {
  const stepStates = Object.fromEntries(
    definition.steps.map((step, index) => [
      step.id,
      {
        stepId: step.id,
        status: index === 0 ? 'current' : 'pending',
        isReady: index === 0 && step.completionRule.kind === 'continue',
        attempts: [],
      } satisfies LessonStepSession,
    ]),
  )

  return {
    sessionId: input.sessionId,
    lessonId: definition.id,
    status: 'active',
    activeStepIndex: 0,
    stepStates,
    feedback: null,
    events: [
      createEvent(input.sessionId, 1, 'lesson.started', input.now),
      createEvent(
        input.sessionId,
        2,
        'step.entered',
        input.now,
        definition.steps[0].id,
      ),
    ],
    completionEventEmitted: false,
    startedAt: input.now,
    completedAt: null,
  }
}

export function submitLessonAttempt(
  definition: LessonDefinition,
  session: LessonSession,
  input: SubmitLessonAttemptInput,
): LessonSession {
  const step = getCurrentLessonStep(definition, session)
  const stepState = step ? session.stepStates[step.id] : undefined

  if (
    session.status !== 'active' ||
    !step ||
    !stepState ||
    step.id !== input.stepId ||
    step.completionRule.kind !== 'interaction' ||
    step.completionRule.interactionId !== input.interactionId
  ) {
    return session
  }

  const attemptNo =
    stepState.attempts.reduce(
      (highest, attempt) =>
        attempt.interactionId === input.interactionId
          ? Math.max(highest, attempt.attemptNo)
          : highest,
      0,
    ) + 1
  const attempt: LessonAttempt = {
    id: `${session.sessionId}:${input.interactionId}:${attemptNo}`,
    stepId: step.id,
    interactionId: input.interactionId,
    attemptNo,
    isCorrect: input.isCorrect,
    answer: input.answer,
    occurredAt: input.now,
  }
  const isReady = step.completionRule.requireCorrect
    ? input.isCorrect === true
    : true
  const feedback: LessonFeedback = input.isCorrect
    ? {
        kind: 'correct',
        title: input.correctFeedback?.title ?? 'Correct',
        message:
          input.correctFeedback?.message ?? 'You are ready to continue.',
      }
    : {
        kind: 'incorrect',
        title: input.incorrectFeedback?.title ?? 'Try that again',
        message:
          input.incorrectFeedback?.message ??
          'Check the prompt and make another attempt.',
      }
  const events = appendEvents(session, input.now, [
    { type: 'interaction.submitted', stepId: step.id },
    {
      type:
        input.isCorrect === true
          ? 'interaction.correct'
          : 'interaction.incorrect',
      stepId: step.id,
    },
  ])

  return {
    ...session,
    stepStates: {
      ...session.stepStates,
      [step.id]: {
        ...stepState,
        isReady,
        attempts: [...stepState.attempts, attempt],
      },
    },
    feedback,
    events,
  }
}

export function retryLessonStep(
  definition: LessonDefinition,
  session: LessonSession,
  now: string,
): LessonSession {
  const step = getCurrentLessonStep(definition, session)
  if (!step || session.feedback?.kind !== 'incorrect') return session

  return {
    ...session,
    feedback: null,
    events: appendEvents(session, now, [
      { type: 'interaction.retried', stepId: step.id },
    ]),
  }
}

export function completeLessonMedia(
  definition: LessonDefinition,
  session: LessonSession,
  input: CompleteLessonMediaInput,
): LessonSession {
  const step = getCurrentLessonStep(definition, session)
  const stepState = step ? session.stepStates[step.id] : undefined

  if (
    session.status !== 'active' ||
    !step ||
    !stepState ||
    step.id !== input.stepId ||
    step.completionRule.kind !== 'media' ||
    step.completionRule.mediaId !== input.mediaId ||
    stepState.isReady
  ) {
    return session
  }

  return {
    ...session,
    stepStates: {
      ...session.stepStates,
      [step.id]: { ...stepState, isReady: true },
    },
    feedback: input.feedback
      ? { kind: 'completion', ...input.feedback }
      : session.feedback,
    events: appendEvents(session, input.now, [
      { type: 'media.completed', stepId: step.id },
    ]),
  }
}

export function advanceLessonSession(
  definition: LessonDefinition,
  session: LessonSession,
  now: string,
): LessonSession {
  if (session.status === 'completed') return session

  const currentStep = getCurrentLessonStep(definition, session)
  const currentState = currentStep
    ? session.stepStates[currentStep.id]
    : undefined
  if (!currentStep || !currentState?.isReady) return session

  const nextIndex = session.activeStepIndex + 1
  const nextStep = definition.steps[nextIndex]
  const nextStepState = nextStep ? session.stepStates[nextStep.id] : undefined
  const stepStates = {
    ...session.stepStates,
    [currentStep.id]: {
      ...currentState,
      status: 'completed' as const,
    },
  }

  if (nextStep && nextStepState) {
    stepStates[nextStep.id] = {
      ...nextStepState,
      status: 'current',
      isReady: nextStep.completionRule.kind === 'continue',
    }

    return {
      ...session,
      activeStepIndex: nextIndex,
      stepStates,
      feedback: null,
      events: appendEvents(session, now, [
        { type: 'step.completed', stepId: currentStep.id },
        { type: 'step.entered', stepId: nextStep.id },
      ]),
    }
  }

  return {
    ...session,
    status: 'completed',
    stepStates,
    feedback: null,
    completionEventEmitted: true,
    completedAt: now,
    events: appendEvents(session, now, [
      { type: 'step.completed', stepId: currentStep.id },
      { type: 'lesson.completed', stepId: currentStep.id },
    ]),
  }
}

export function getCurrentLessonStep(
  definition: LessonDefinition,
  session: LessonSession,
): LessonStepDefinition | null {
  return definition.steps[session.activeStepIndex] ?? null
}

export function getLessonProgressPercent(
  definition: LessonDefinition,
  session: LessonSession,
) {
  const completedCount = definition.steps.reduce(
    (count, step) =>
      session.stepStates[step.id]?.status === 'completed' ? count + 1 : count,
    0,
  )

  return Math.round((completedCount / definition.steps.length) * 100)
}

function appendEvents(
  session: LessonSession,
  now: string,
  inputs: Array<Pick<LessonRuntimeEvent, 'type' | 'stepId'>>,
) {
  const events = [...session.events]
  for (const input of inputs) {
    events.push(
      createEvent(
        session.sessionId,
        events.length + 1,
        input.type,
        now,
        input.stepId,
      ),
    )
  }
  return events
}

function createEvent(
  sessionId: string,
  sequence: number,
  type: LessonRuntimeEvent['type'],
  occurredAt: string,
  stepId?: string,
): LessonRuntimeEvent {
  return {
    id: `${sessionId}:event:${sequence}`,
    sequence,
    type,
    occurredAt,
    stepId,
  }
}
