import { z } from 'zod'

import { stableIdSchema } from '../base'
import { activityBaseShape } from './activity-base'

export const rolePlayActivitySchema = z
  .object({
    ...activityBaseShape,
    type: z.literal('role-play/v1'),
    dialogueRef: stableIdSchema,
    roleRefs: z.array(stableIdSchema).min(2),
    lineRefs: z.array(stableIdSchema).min(2),
    countdownSeconds: z.number().int().min(0).max(5).optional(),
    handoffDelayMs: z.number().int().min(0).max(3000).optional(),
  })
  .strict()
  .superRefine((activity, context) => {
    if (new Set(activity.roleRefs).size !== activity.roleRefs.length) {
      context.addIssue({
        code: 'custom',
        message: 'Role-play role references must be unique.',
        path: ['roleRefs'],
      })
    }
    if (new Set(activity.lineRefs).size !== activity.lineRefs.length) {
      context.addIssue({
        code: 'custom',
        message: 'Role-play line references must be unique.',
        path: ['lineRefs'],
      })
    }
  })
