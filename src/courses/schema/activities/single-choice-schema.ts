import { z } from 'zod'

import { stableIdSchema } from '../base'
import {
  activityBaseShape,
  answerFeedbackSchema,
  answerPolicySchema,
  choiceOptionSchema,
  validateSingleAnswer,
} from './activity-base'

export const choiceStimulusSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('audio'), ref: stableIdSchema }).strict(),
  z.object({ kind: z.literal('dialogue'), ref: stableIdSchema }).strict(),
  z
    .object({
      kind: z.literal('dialogue-line'),
      dialogueRef: stableIdSchema,
      lineRef: stableIdSchema,
    })
    .strict(),
  z.object({ kind: z.literal('lexeme'), ref: stableIdSchema }).strict(),
])

export const singleChoiceActivitySchema = z
  .object({
    ...activityBaseShape,
    type: z.literal('single-choice/v1'),
    presentation: z.enum(['default', 'binary']).optional(),
    prompt: z.string().trim().min(1).max(800),
    stimulus: choiceStimulusSchema.optional(),
    options: z.array(choiceOptionSchema).min(2).max(8),
    answer: stableIdSchema,
    feedback: answerFeedbackSchema,
    policy: answerPolicySchema.optional(),
  })
  .strict()
  .superRefine((activity, context) => {
    validateSingleAnswer(activity.options, activity.answer, context)
  })
