import { z } from 'zod'

import {
  ElementPositionSchema,
  JsonRecordSchema,
  JsonValueSchema,
  LocalizedTextSchema,
  NonNegativeIntSchema,
  StableIdSchema,
} from './shared'

export const actionKindValues = [
  'show',
  'hide',
  'highlight',
  'playAudio',
  'speak',
  'pause',
  'wait',
  'pauseUntilInteraction',
  'setState',
  'emitLearningEvent',
  'move',
  'animate',
] as const

export const ActionKindSchema = z.enum(actionKindValues)

const ActionBaseFields = {
  id: StableIdSchema,
  label: z.string().min(1).max(120).optional(),
  metadata: JsonRecordSchema.optional(),
}

export const ShowActionSchema = z
  .object({
    ...ActionBaseFields,
    kind: z.literal('show'),
    targetId: StableIdSchema,
  })
  .strict()

export const HideActionSchema = z
  .object({
    ...ActionBaseFields,
    kind: z.literal('hide'),
    targetId: StableIdSchema,
  })
  .strict()

export const HighlightActionSchema = z
  .object({
    ...ActionBaseFields,
    kind: z.literal('highlight'),
    targetId: StableIdSchema,
    effect: z.enum(['pulse', 'outline', 'glow', 'underline']).default('pulse'),
    durationMs: NonNegativeIntSchema.optional(),
  })
  .strict()

export const PlayAudioActionSchema = z
  .object({
    ...ActionBaseFields,
    kind: z.literal('playAudio'),
    assetId: StableIdSchema.optional(),
    url: z.string().url().optional(),
    targetId: StableIdSchema.optional(),
    startMs: NonNegativeIntSchema.optional(),
    endMs: NonNegativeIntSchema.optional(),
  })
  .strict()

export const SpeakActionSchema = z
  .object({
    ...ActionBaseFields,
    kind: z.literal('speak'),
    targetId: StableIdSchema,
    text: LocalizedTextSchema,
    voiceKey: z.string().min(1).max(64).optional(),
    durationMs: NonNegativeIntSchema.optional(),
  })
  .strict()

export const PauseActionSchema = z
  .object({
    ...ActionBaseFields,
    kind: z.literal('pause'),
  })
  .strict()

export const WaitActionSchema = z
  .object({
    ...ActionBaseFields,
    kind: z.literal('wait'),
    durationMs: NonNegativeIntSchema,
  })
  .strict()

export const PauseUntilInteractionActionSchema = z
  .object({
    ...ActionBaseFields,
    kind: z.literal('pauseUntilInteraction'),
    interactionId: StableIdSchema,
  })
  .strict()

export const SetStateActionSchema = z
  .object({
    ...ActionBaseFields,
    kind: z.literal('setState'),
    path: z.string().min(1).max(160),
    value: JsonValueSchema,
  })
  .strict()

export const EmitLearningEventActionSchema = z
  .object({
    ...ActionBaseFields,
    kind: z.literal('emitLearningEvent'),
    eventName: z.string().min(1).max(120),
    payload: JsonRecordSchema.optional(),
  })
  .strict()

export const MoveActionSchema = z
  .object({
    ...ActionBaseFields,
    kind: z.literal('move'),
    targetId: StableIdSchema,
    to: ElementPositionSchema,
    durationMs: NonNegativeIntSchema.default(300),
    easing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut']).default('easeOut'),
  })
  .strict()

export const AnimateActionSchema = z
  .object({
    ...ActionBaseFields,
    kind: z.literal('animate'),
    targetId: StableIdSchema,
    animation: z.enum(['fadeIn', 'fadeOut', 'slideIn', 'slideOut', 'scale', 'shake']),
    durationMs: NonNegativeIntSchema.default(300),
  })
  .strict()

export const SceneActionSchema = z.discriminatedUnion('kind', [
  ShowActionSchema,
  HideActionSchema,
  HighlightActionSchema,
  PlayAudioActionSchema,
  SpeakActionSchema,
  PauseActionSchema,
  WaitActionSchema,
  PauseUntilInteractionActionSchema,
  SetStateActionSchema,
  EmitLearningEventActionSchema,
  MoveActionSchema,
  AnimateActionSchema,
])

export type ActionKind = z.infer<typeof ActionKindSchema>
export type SceneAction = z.infer<typeof SceneActionSchema>
