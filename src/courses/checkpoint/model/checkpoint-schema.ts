import { z } from 'zod'

import {
  type LessonDefinition,
  lessonDefinitionSchema,
} from '@/learning/runtime/model/lesson-definition'
import { lessonAudioAssetSchema } from '@/lib/media/lesson-audio-asset'

// Frozen v1 contract: new course activities belong in lesson/v2 after CP0.
const stableIdSchema = z.string().min(1).max(128)

const checkpointOptionSchema = z
  .object({
    id: stableIdSchema,
    label: z.string().min(1),
    supportingText: z.string().min(1).optional(),
    isCorrect: z.boolean(),
  })
  .strict()

const checkpointStepBase = {
  id: stableIdSchema,
  eyebrow: z.string().min(1).optional(),
  title: z.string().min(1),
  instruction: z.string().min(1),
  knowledgeIds: z.array(stableIdSchema).default([]),
}

const checkpointIntroStepSchema = z
  .object({
    ...checkpointStepBase,
    kind: z.literal('checkpoint-intro'),
    reviewedLessonIds: z.array(stableIdSchema).min(1),
  })
  .strict()

const checkpointChoiceStepSchema = z
  .object({
    ...checkpointStepBase,
    kind: z.enum(['meaning-choice', 'dialogue-choice']),
    sourceLessonId: stableIdSchema,
    prompt: z.string().min(1),
    options: z.array(checkpointOptionSchema).min(2).max(4),
    correctFeedback: z.string().min(1),
    incorrectFeedback: z.string().min(1),
  })
  .strict()

const checkpointListeningStepSchema = z
  .object({
    ...checkpointStepBase,
    kind: z.literal('listening-choice'),
    sourceLessonId: stableIdSchema,
    prompt: z.string().min(1),
    audio: lessonAudioAssetSchema,
    fallbackCue: z.string().min(1),
    options: z.array(checkpointOptionSchema).min(2).max(4),
    correctFeedback: z.string().min(1),
    incorrectFeedback: z.string().min(1),
  })
  .strict()

const checkpointOrderItemSchema = z
  .object({
    id: stableIdSchema,
    label: z.string().min(1),
    supportingText: z.string().min(1).optional(),
  })
  .strict()

const checkpointLineOrderStepSchema = z
  .object({
    ...checkpointStepBase,
    kind: z.literal('line-order'),
    sourceLessonId: stableIdSchema,
    prompt: z.string().min(1),
    items: z.array(checkpointOrderItemSchema).min(3).max(5),
    startingOrder: z.array(stableIdSchema).min(3).max(5),
    correctOrder: z.array(stableIdSchema).min(3).max(5),
    correctFeedback: z.string().min(1),
    incorrectFeedback: z.string().min(1),
  })
  .strict()

const checkpointSummaryStepSchema = z
  .object({
    ...checkpointStepBase,
    kind: z.literal('checkpoint-summary'),
    takeaways: z.array(z.string().min(1)).min(1),
  })
  .strict()

export const checkpointStepSchema = z.discriminatedUnion('kind', [
  checkpointIntroStepSchema,
  checkpointChoiceStepSchema,
  checkpointListeningStepSchema,
  checkpointLineOrderStepSchema,
  checkpointSummaryStepSchema,
])

export const checkpointSchema = z
  .object({
    schemaVersion: z.literal('checkpoint/v1'),
    kind: z.literal('checkpoint'),
    id: stableIdSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    routeId: stableIdSchema.optional(),
    nodeId: stableIdSchema.optional(),
    estimatedMinutes: z.number().int().positive(),
    reviewedLessonIds: z.array(stableIdSchema).min(1),
    steps: z.array(checkpointStepSchema).min(1),
  })
  .strict()
  .superRefine((checkpoint, context) => {
    const reviewedLessonIds = new Set(checkpoint.reviewedLessonIds)
    const stepIds = new Set<string>()

    checkpoint.steps.forEach((step, index) => {
      if (stepIds.has(step.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate checkpoint step id: ${step.id}`,
          path: ['steps', index, 'id'],
        })
      }
      stepIds.add(step.id)

      if ('sourceLessonId' in step && !reviewedLessonIds.has(step.sourceLessonId)) {
        context.addIssue({
          code: 'custom',
          message: `Checkpoint step references an unreviewed lesson: ${step.sourceLessonId}`,
          path: ['steps', index, 'sourceLessonId'],
        })
      }

      if ('options' in step) {
        if (new Set(step.options.map((option) => option.id)).size !== step.options.length) {
          context.addIssue({
            code: 'custom',
            message: 'Checkpoint choice option ids must be unique.',
            path: ['steps', index, 'options'],
          })
        }
        if (step.options.filter((option) => option.isCorrect).length !== 1) {
          context.addIssue({
            code: 'custom',
            message: 'Checkpoint choice must have exactly one answer.',
            path: ['steps', index, 'options'],
          })
        }
      }

      if (step.kind === 'line-order') {
        const itemIds = step.items.map((item) => item.id)
        const expected = [...itemIds].sort().join('|')
        if (
          new Set(itemIds).size !== itemIds.length ||
          [...step.startingOrder].sort().join('|') !== expected ||
          [...step.correctOrder].sort().join('|') !== expected
        ) {
          context.addIssue({
            code: 'custom',
            message: 'Checkpoint order lists must contain every item exactly once.',
            path: ['steps', index],
          })
        }
      }
    })
  })

export type CheckpointStep = z.infer<typeof checkpointStepSchema>
export type CheckpointDefinition = z.infer<typeof checkpointSchema>

export function defineCheckpoint(input: unknown): CheckpointDefinition {
  const checkpoint = checkpointSchema.parse(input)
  createCheckpointRuntimeDefinition(checkpoint)
  return checkpoint
}

export function createCheckpointRuntimeDefinition(
  checkpoint: CheckpointDefinition,
): LessonDefinition {
  return lessonDefinitionSchema.parse({
    id: checkpoint.id,
    title: checkpoint.title,
    description: checkpoint.description,
    routeId: checkpoint.routeId,
    nodeId: checkpoint.nodeId,
    estimatedMinutes: checkpoint.estimatedMinutes,
    steps: checkpoint.steps.map((step) => ({
      id: step.id,
      eyebrow: step.eyebrow,
      title: step.title,
      instruction: step.instruction,
      knowledgeIds: step.knowledgeIds,
      completionRule:
        step.kind === 'checkpoint-intro' || step.kind === 'checkpoint-summary'
          ? { kind: 'continue' as const }
          : {
              kind: 'interaction' as const,
              interactionId: `${step.id}:answer`,
              requireCorrect: true,
            },
    })),
  })
}
