import { z } from 'zod'

import {
  instructionSchema,
  knowledgeIdsSchema,
  stableIdSchema,
  titleSchema,
} from '../base'

export const activityBaseShape = {
  id: stableIdSchema,
  eyebrow: titleSchema.optional(),
  title: titleSchema,
  instruction: instructionSchema,
  knowledgeIds: knowledgeIdsSchema,
}

export const answerPolicySchema = z
  .object({
    completion: z.enum(['correct', 'submit']),
    feedback: z.enum(['immediate', 'after-submit']),
    maxAttempts: z.number().int().min(1).max(10).optional(),
  })
  .strict()

export const choiceOptionSchema = z
  .object({
    id: stableIdSchema,
    label: z.string().trim().min(1).max(400),
    supportingText: z.string().trim().min(1).max(400).optional(),
  })
  .strict()

export const answerFeedbackSchema = z
  .object({
    correct: z.string().trim().min(1).max(1000),
    retry: z.string().trim().min(1).max(1000),
  })
  .strict()

export function validateSingleAnswer(
  options: Array<{ id: string }>,
  answer: string,
  context: z.RefinementCtx,
) {
  const optionIds = options.map((option) => option.id)
  if (new Set(optionIds).size !== optionIds.length) {
    context.addIssue({
      code: 'custom',
      message: 'Choice option ids must be unique.',
      path: ['options'],
    })
  }
  if (!optionIds.includes(answer)) {
    context.addIssue({
      code: 'custom',
      message: `Answer does not reference an option: ${answer}`,
      path: ['answer'],
    })
  }
}
