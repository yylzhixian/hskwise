import { z } from 'zod'

import { learningGoalIds } from './learning-goal'

export const learningStateVersion = 1 as const

const timestampSchema = z.string().datetime()
const learningGoalSchema = z.enum(learningGoalIds)

export const routeProgressSchema = z.object({
  routeId: z.string().min(1),
  completedNodeIds: z.array(z.string().min(1)),
  currentNodeId: z.string().min(1).nullable(),
  startedAt: timestampSchema.nullable(),
  updatedAt: timestampSchema.nullable(),
})

export const mistakeRecordSchema = z.object({
  id: z.string().min(1),
  lessonId: z.string().min(1),
  nodeId: z.string().min(1),
  knowledgeId: z.string().min(1),
  prompt: z.string().min(1),
  correction: z.string().min(1),
  occurredAt: timestampSchema,
  resolved: z.boolean(),
})

export const reviewItemSchema = z.object({
  id: z.string().min(1),
  lessonId: z.string().min(1),
  sourceNodeId: z.string().min(1),
  knowledgeId: z.string().min(1),
  label: z.string().min(1),
  dueAt: timestampSchema,
  status: z.enum(['queued', 'completed']),
  attemptCount: z.number().int().nonnegative(),
})

export const recentActivitySchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['lesson-completed', 'review-completed', 'route-completed']),
  label: z.string().min(1),
  nodeId: z.string().min(1),
  occurredAt: timestampSchema,
})

export const learningStateSchema = z.object({
  version: z.literal(learningStateVersion),
  goalId: learningGoalSchema.nullable(),
  currentRouteId: z.string().min(1).nullable(),
  routeProgress: z.record(z.string(), routeProgressSchema),
  mistakes: z.array(mistakeRecordSchema),
  reviewQueue: z.array(reviewItemSchema),
  recentActivity: z.array(recentActivitySchema),
})

export const learningCapabilitiesSchema = z.object({
  audio: z.enum(['available', 'unavailable']),
  microphone: z.enum(['prompt', 'denied']),
  storage: z.enum(['available', 'unavailable']),
})

export type LearningCapabilities = z.infer<typeof learningCapabilitiesSchema>
export type LearningState = z.infer<typeof learningStateSchema>
export type MistakeRecord = z.infer<typeof mistakeRecordSchema>
export type RecentActivity = z.infer<typeof recentActivitySchema>
export type ReviewItem = z.infer<typeof reviewItemSchema>
export type RouteProgress = z.infer<typeof routeProgressSchema>
