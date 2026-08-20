import { describe, expect, test } from 'bun:test'

import { lessonDefinitionSchema } from '@/learning/runtime/model/lesson-definition.ts'
import {
  advanceLessonSession,
  completeLessonMedia,
  createLessonSession,
  getLessonProgressPercent,
  retryLessonStep,
  submitLessonAttempt,
} from '@/learning/runtime/model/lesson-session-machine.ts'

const definition = lessonDefinitionSchema.parse({
  id: 'runtime-test',
  title: 'Runtime test',
  description: 'Exercises the shared lesson state machine.',
  estimatedMinutes: 2,
  steps: [
    {
      id: 'intro',
      title: 'Intro',
      instruction: 'Continue when ready.',
      completionRule: { kind: 'continue' },
    },
    {
      id: 'choice',
      title: 'Choice',
      instruction: 'Choose the correct response.',
      completionRule: {
        kind: 'interaction',
        interactionId: 'choice-one',
        requireCorrect: true,
      },
    },
    {
      id: 'record',
      title: 'Record',
      instruction: 'Complete the recording task.',
      completionRule: { kind: 'media', mediaId: 'recording-one' },
    },
  ],
})

const at = (minute) => `2026-08-19T08:0${minute}:00.000Z`

describe('lesson session machine', () => {
  test('allows manual steps but does not skip a required correct answer', () => {
    let session = createLessonSession(definition, {
      sessionId: 'session-one',
      now: at(0),
    })

    session = advanceLessonSession(definition, session, at(1))
    expect(session.activeStepIndex).toBe(1)
    expect(getLessonProgressPercent(definition, session)).toBe(33)

    const unchanged = advanceLessonSession(definition, session, at(2))
    expect(unchanged).toBe(session)
  })

  test('keeps attempts across retry and unlocks only after a correct answer', () => {
    let session = advanceLessonSession(
      definition,
      createLessonSession(definition, {
        sessionId: 'session-two',
        now: at(0),
      }),
      at(1),
    )

    session = submitLessonAttempt(definition, session, {
      stepId: 'choice',
      interactionId: 'choice-one',
      answer: 'wrong',
      isCorrect: false,
      now: at(2),
    })
    expect(session.stepStates.choice.isReady).toBe(false)
    expect(session.feedback?.kind).toBe('incorrect')
    expect(session.stepStates.choice.attempts[0].attemptNo).toBe(1)

    session = retryLessonStep(definition, session, at(3))
    expect(session.feedback).toBeNull()

    session = submitLessonAttempt(definition, session, {
      stepId: 'choice',
      interactionId: 'choice-one',
      answer: 'correct',
      isCorrect: true,
      now: at(4),
    })
    expect(session.stepStates.choice.isReady).toBe(true)
    expect(session.stepStates.choice.attempts[1].attemptNo).toBe(2)
  })

  test('completes a media rule and emits lesson completion once', () => {
    let session = createLessonSession(definition, {
      sessionId: 'session-three',
      now: at(0),
    })
    session = advanceLessonSession(definition, session, at(1))
    session = submitLessonAttempt(definition, session, {
      stepId: 'choice',
      interactionId: 'choice-one',
      isCorrect: true,
      now: at(2),
    })
    session = advanceLessonSession(definition, session, at(3))
    session = completeLessonMedia(definition, session, {
      stepId: 'record',
      mediaId: 'recording-one',
      now: at(4),
      feedback: {
        title: 'Recording complete',
        message: 'Your recording is ready.',
      },
    })
    expect(session.feedback?.kind).toBe('completion')
    session = advanceLessonSession(definition, session, at(5))

    expect(session.status).toBe('completed')
    expect(session.completionEventEmitted).toBe(true)
    expect(
      session.events.filter((event) => event.type === 'lesson.completed'),
    ).toHaveLength(1)

    const completedAgain = advanceLessonSession(definition, session, at(6))
    expect(completedAgain).toBe(session)
    expect(
      completedAgain.events.filter(
        (event) => event.type === 'lesson.completed',
      ),
    ).toHaveLength(1)
  })

  test('ignores attempts for another step or interaction', () => {
    const session = createLessonSession(definition, {
      sessionId: 'session-four',
      now: at(0),
    })
    const unchanged = submitLessonAttempt(definition, session, {
      stepId: 'choice',
      interactionId: 'other-choice',
      isCorrect: true,
      now: at(1),
    })

    expect(unchanged).toBe(session)
  })
})
