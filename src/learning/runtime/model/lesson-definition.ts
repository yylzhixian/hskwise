import { z } from 'zod'

const stableIdSchema = z.string().min(1).max(128)

export const lessonCompletionRuleSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('continue') }).strict(),
  z
    .object({
      kind: z.literal('interaction'),
      interactionId: stableIdSchema,
      requireCorrect: z.boolean().default(true),
    })
    .strict(),
  z
    .object({
      kind: z.literal('media'),
      mediaId: stableIdSchema,
    })
    .strict(),
])

export const lessonStepDefinitionSchema = z
  .object({
    id: stableIdSchema,
    title: z.string().min(1),
    eyebrow: z.string().min(1).optional(),
    instruction: z.string().min(1),
    completionRule: lessonCompletionRuleSchema,
    knowledgeIds: z.array(stableIdSchema).default([]),
  })
  .strict()

export const lessonDefinitionSchema = z
  .object({
    id: stableIdSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    routeId: stableIdSchema.optional(),
    nodeId: stableIdSchema.optional(),
    estimatedMinutes: z.number().int().positive(),
    steps: z.array(lessonStepDefinitionSchema).min(1),
  })
  .strict()
  .superRefine((lesson, context) => {
    const stepIds = new Set<string>()
    const interactionIds = new Set<string>()
    const mediaIds = new Set<string>()

    lesson.steps.forEach((step, index) => {
      if (stepIds.has(step.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate lesson step id: ${step.id}`,
          path: ['steps', index, 'id'],
        })
      }
      stepIds.add(step.id)

      if (step.completionRule.kind === 'interaction') {
        const { interactionId } = step.completionRule
        if (interactionIds.has(interactionId)) {
          context.addIssue({
            code: 'custom',
            message: `Duplicate interaction id: ${interactionId}`,
            path: ['steps', index, 'completionRule', 'interactionId'],
          })
        }
        interactionIds.add(interactionId)
      }

      if (step.completionRule.kind === 'media') {
        const { mediaId } = step.completionRule
        if (mediaIds.has(mediaId)) {
          context.addIssue({
            code: 'custom',
            message: `Duplicate media id: ${mediaId}`,
            path: ['steps', index, 'completionRule', 'mediaId'],
          })
        }
        mediaIds.add(mediaId)
      }
    })
  })

export type LessonCompletionRule = z.infer<typeof lessonCompletionRuleSchema>
export type LessonDefinition = z.infer<typeof lessonDefinitionSchema>
export type LessonStepDefinition = z.infer<typeof lessonStepDefinitionSchema>
