import { z } from 'zod'

import { authorTextSchema, stableIdSchema } from '../base'
import { activityBaseShape } from './activity-base'

export const activeRecallActivitySchema = z
  .object({
    ...activityBaseShape,
    type: z.literal('active-recall/v1'),
    targetRef: z
      .object({ kind: z.literal('lexeme'), id: stableIdSchema })
      .strict(),
    cue: authorTextSchema,
    revealLabel: authorTextSchema,
    feedback: z
      .object({
        mastered: authorTextSchema,
        review: authorTextSchema,
      })
      .strict(),
  })
  .strict()
