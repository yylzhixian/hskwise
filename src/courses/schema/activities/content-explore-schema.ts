import { z } from 'zod'

import { authorTextSchema, lessonResourceRefSchema } from '../base'
import { activityBaseShape } from './activity-base'

export const contentExploreActivitySchema = z
  .object({
    ...activityBaseShape,
    type: z.literal('content-explore/v1'),
    purpose: z.enum(['intro', 'context', 'focus', 'explain', 'summary']),
    resourceRefs: z.array(lessonResourceRefSchema),
    body: authorTextSchema.optional(),
    takeaways: z.array(authorTextSchema).max(8).optional(),
  })
  .strict()
  .superRefine((activity, context) => {
    const resourceKeys = activity.resourceRefs.map(
      (reference) => `${reference.kind}:${reference.id}`,
    )
    if (new Set(resourceKeys).size !== resourceKeys.length) {
      context.addIssue({
        code: 'custom',
        message: 'Content resource references must be unique.',
        path: ['resourceRefs'],
      })
    }
    if (
      activity.resourceRefs.length === 0 &&
      !activity.body &&
      !activity.takeaways?.length
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Content exploration requires a resource, body, or takeaway.',
        path: ['resourceRefs'],
      })
    }
  })
