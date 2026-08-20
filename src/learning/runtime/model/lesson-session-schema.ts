import { z } from 'zod'

const timestampSchema = z.string().datetime()

export const lessonFeedbackSchema = z
  .object({
    kind: z.enum(['completion', 'correct', 'incorrect', 'info']),
    title: z.string().min(1),
    message: z.string().min(1),
  })
  .strict()

export const lessonAttemptSchema = z
  .object({
    id: z.string().min(1),
    stepId: z.string().min(1),
    interactionId: z.string().min(1),
    attemptNo: z.number().int().positive(),
    isCorrect: z.boolean().nullable(),
    answer: z.unknown().optional(),
    occurredAt: timestampSchema,
  })
  .strict()

export const lessonRuntimeEventSchema = z
  .object({
    id: z.string().min(1),
    sequence: z.number().int().positive(),
    type: z.enum([
      'lesson.started',
      'step.entered',
      'step.completed',
      'interaction.submitted',
      'interaction.correct',
      'interaction.incorrect',
      'interaction.retried',
      'media.completed',
      'lesson.completed',
    ]),
    stepId: z.string().min(1).optional(),
    occurredAt: timestampSchema,
  })
  .strict()

export const lessonStepSessionSchema = z
  .object({
    stepId: z.string().min(1),
    status: z.enum(['pending', 'current', 'completed']),
    isReady: z.boolean(),
    attempts: z.array(lessonAttemptSchema),
  })
  .strict()

export const lessonSessionSchema = z
  .object({
    sessionId: z.string().min(1),
    lessonId: z.string().min(1),
    status: z.enum(['active', 'completed']),
    activeStepIndex: z.number().int().nonnegative(),
    stepStates: z.record(z.string(), lessonStepSessionSchema),
    feedback: lessonFeedbackSchema.nullable(),
    events: z.array(lessonRuntimeEventSchema),
    completionEventEmitted: z.boolean(),
    startedAt: timestampSchema,
    completedAt: timestampSchema.nullable(),
  })
  .strict()

export type LessonAttempt = z.infer<typeof lessonAttemptSchema>
export type LessonFeedback = z.infer<typeof lessonFeedbackSchema>
export type LessonRuntimeEvent = z.infer<typeof lessonRuntimeEventSchema>
export type LessonSession = z.infer<typeof lessonSessionSchema>
export type LessonStepSession = z.infer<typeof lessonStepSessionSchema>
