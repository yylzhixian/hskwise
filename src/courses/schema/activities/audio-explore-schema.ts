import { z } from 'zod'

import { stableIdSchema } from '../base'
import { activityBaseShape } from './activity-base'

export const audioExploreActivitySchema = z
  .object({
    ...activityBaseShape,
    type: z.literal('audio-explore/v1'),
    mode: z.enum(['sequence', 'focus', 'contrast']),
    dialogueRef: stableIdSchema,
    lineRefs: z.array(stableIdSchema).min(1),
  })
  .strict()
  .superRefine((activity, context) => {
    if (new Set(activity.lineRefs).size !== activity.lineRefs.length) {
      context.addIssue({
        code: 'custom',
        message: 'Audio exploration line references must be unique.',
        path: ['lineRefs'],
      })
    }
  })
