import { z } from 'zod'

import {
  JsonRecordSchema,
  JsonValueSchema,
  NonNegativeIntSchema,
  StableIdSchema,
  TargetLocatorSchema,
} from './shared'

export const runtimeEventSchemaVersion = 1

export const PlayerContextSchema = z.enum(['editor', 'learner'])

export const RuntimeEventKindSchema = z.enum([
  'scene.started',
  'scene.completed',
  'playback.started',
  'playback.paused',
  'playback.seeked',
  'playback.reset',
  'timeline.cueEntered',
  'timeline.completed',
  'interaction.submitted',
  'interaction.correct',
  'interaction.incorrect',
  'interaction.retried',
  'media.ended',
  'media.error',
  'custom',
])

export const InteractionAttemptSchema = z
  .object({
    interactionId: StableIdSchema,
    attemptNo: z.number().int().positive(),
    answer: JsonValueSchema.optional(),
    isCorrect: z.boolean().nullable(),
    playheadMs: NonNegativeIntSchema,
    submittedAt: z.string().datetime(),
    targetLocator: TargetLocatorSchema.optional(),
  })
  .strict()

export const LearningRuntimeEventSchema = z
  .object({
    version: z.literal(runtimeEventSchemaVersion),
    id: StableIdSchema,
    sessionId: StableIdSchema,
    sequence: NonNegativeIntSchema,
    context: PlayerContextSchema,
    sceneId: StableIdSchema,
    sceneVersion: z.number().int().positive(),
    type: RuntimeEventKindSchema,
    occurredAt: z.string().datetime(),
    playheadMs: NonNegativeIntSchema,
    interactionId: StableIdSchema.optional(),
    attemptNo: z.number().int().positive().optional(),
    targetLocator: TargetLocatorSchema.optional(),
    payload: JsonRecordSchema.optional(),
  })
  .strict()

export const SceneProgressSchema = z
  .object({
    sceneId: StableIdSchema,
    context: PlayerContextSchema,
    status: z.enum(['notStarted', 'inProgress', 'completed']),
    maxPlayedTimeMs: NonNegativeIntSchema,
    completedInteractionIds: z.array(StableIdSchema),
    correctInteractionIds: z.array(StableIdSchema),
    attempts: z.array(InteractionAttemptSchema),
  })
  .strict()

export const SceneProgressStoreSchema = z.record(z.string(), SceneProgressSchema)

export type PlayerContext = z.infer<typeof PlayerContextSchema>
export type RuntimeEventKind = z.infer<typeof RuntimeEventKindSchema>
export type InteractionAttempt = z.infer<typeof InteractionAttemptSchema>
export type LearningRuntimeEvent = z.infer<typeof LearningRuntimeEventSchema>
export type SceneProgress = z.infer<typeof SceneProgressSchema>
export type SceneProgressStore = z.infer<typeof SceneProgressStoreSchema>
