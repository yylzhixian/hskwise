import { z } from 'zod'

import { authorTextSchema, stableIdSchema } from '../base'
import {
  activityBaseShape,
  answerFeedbackSchema,
  answerPolicySchema,
} from './activity-base'

const orderingItemSchema = z
  .object({
    id: stableIdSchema,
    label: authorTextSchema.optional(),
    dialogueLineRef: z
      .object({
        dialogueRef: stableIdSchema,
        lineRef: stableIdSchema,
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((item, context) => {
    if (!item.label && !item.dialogueLineRef) {
      context.addIssue({
        code: 'custom',
        message: 'Ordering items require a label or dialogue line reference.',
        path: ['label'],
      })
    }
  })

export const orderingActivitySchema = z
  .object({
    ...activityBaseShape,
    type: z.literal('ordering/v1'),
    prompt: authorTextSchema,
    presentation: z.enum(['text', 'dialogue-lines']),
    items: z.array(orderingItemSchema).min(2).max(12),
    initialOrder: z.array(stableIdSchema).min(2).max(12),
    answer: z.array(stableIdSchema).min(2).max(12),
    feedback: answerFeedbackSchema,
    policy: answerPolicySchema.optional(),
  })
  .strict()
  .superRefine((activity, context) => {
    const itemIds = activity.items.map((item) => item.id)
    const expected = new Set(itemIds)
    const hasSameItems = (ids: string[]) =>
      ids.length === itemIds.length &&
      new Set(ids).size === ids.length &&
      ids.every((id) => expected.has(id))

    if (expected.size !== itemIds.length) {
      context.addIssue({
        code: 'custom',
        message: 'Ordering item ids must be unique.',
        path: ['items'],
      })
    }
    if (!hasSameItems(activity.initialOrder)) {
      context.addIssue({
        code: 'custom',
        message: 'Initial order must contain every ordering item exactly once.',
        path: ['initialOrder'],
      })
    }
    if (!hasSameItems(activity.answer)) {
      context.addIssue({
        code: 'custom',
        message: 'Ordering answer must contain every ordering item exactly once.',
        path: ['answer'],
      })
    }
  })
