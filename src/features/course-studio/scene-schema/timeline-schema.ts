import { z } from 'zod'

import {
  JsonRecordSchema,
  JsonValueSchema,
  LocalizedTextSchema,
  NonNegativeIntSchema,
  StableIdSchema,
} from './shared'

export const eventTriggerValues = [
  'scene.start',
  'scene.complete',
  'timeline.enter',
  'element.click',
  'element.hover',
  'media.ended',
  'interaction.submit',
  'interaction.correct',
  'interaction.incorrect',
  'state.change',
] as const

export const EventTriggerSchema = z.enum(eventTriggerValues)

const ComparisonConditionSchema = z
  .object({
    path: z.string().min(1).max(160),
    operator: z
      .enum(['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'includes', 'exists'])
      .default('equals'),
    value: JsonValueSchema.optional(),
  })
  .strict()

export type Condition =
  | z.infer<typeof ComparisonConditionSchema>
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }

export const ConditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    ComparisonConditionSchema,
    z
      .object({
        all: z.array(ConditionSchema).min(1),
      })
      .strict(),
    z
      .object({
        any: z.array(ConditionSchema).min(1),
      })
      .strict(),
    z
      .object({
        not: ConditionSchema,
      })
      .strict(),
  ]),
)

export const TimelineStepSchema = z
  .object({
    id: StableIdSchema,
    at: NonNegativeIntSchema,
    actionId: StableIdSchema,
    label: LocalizedTextSchema.optional(),
    durationMs: NonNegativeIntSchema.optional(),
    metadata: JsonRecordSchema.optional(),
  })
  .strict()

export const SceneEventSchema = z
  .object({
    id: StableIdSchema,
    on: EventTriggerSchema,
    targetId: StableIdSchema.optional(),
    when: ConditionSchema.optional(),
    actions: z.array(StableIdSchema).min(1),
    metadata: JsonRecordSchema.optional(),
  })
  .strict()

export type EventTrigger = z.infer<typeof EventTriggerSchema>
export type TimelineStep = z.infer<typeof TimelineStepSchema>
export type SceneEvent = z.infer<typeof SceneEventSchema>
