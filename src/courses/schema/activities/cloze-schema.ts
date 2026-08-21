import { z } from 'zod'

import { authorTextSchema, stableIdSchema } from '../base'
import {
  activityBaseShape,
  answerFeedbackSchema,
  answerPolicySchema,
  choiceOptionSchema,
  validateSingleAnswer,
} from './activity-base'

export const clozeActivitySchema = z
  .object({
    ...activityBaseShape,
    type: z.literal('cloze/v1'),
    responseMode: z.literal('choice'),
    prompt: authorTextSchema,
    textBefore: z.string().max(1000),
    textAfter: z.string().max(1000),
    translation: authorTextSchema.optional(),
    options: z.array(choiceOptionSchema).min(2).max(8),
    answer: stableIdSchema,
    feedback: answerFeedbackSchema,
    policy: answerPolicySchema.optional(),
  })
  .strict()
  .superRefine((activity, context) => {
    validateSingleAnswer(activity.options, activity.answer, context)
  })
