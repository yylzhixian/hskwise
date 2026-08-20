import { z } from 'zod'

const stableIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const courseTypeSchema = z.enum([
  'pinyin',
  'dialogue',
  'vocabulary',
  'checkpoint',
])

export const routeNodeKindSchema = z.enum([
  'lesson',
  'practice',
  'review',
  'checkpoint',
  'challenge',
])

export const routeNodeSchema = z.object({
  id: stableIdSchema,
  lessonId: stableIdSchema,
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  description: z.string().min(1),
  kind: routeNodeKindSchema,
  courseType: courseTypeSchema,
  estimatedMinutes: z.number().int().positive(),
  knowledgeIds: z.array(z.string().min(1)).min(1),
  prerequisiteNodeIds: z.array(stableIdSchema),
})

export const routeStageSchema = z.object({
  id: stableIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  nodes: z.array(routeNodeSchema).min(1),
})

export const learningRouteSchema = z.object({
  id: stableIdSchema,
  title: z.string().min(1),
  level: z.string().min(1),
  description: z.string().min(1),
  stages: z.array(routeStageSchema).min(1),
})

export type CourseType = z.infer<typeof courseTypeSchema>
export type LearningRoute = z.infer<typeof learningRouteSchema>
export type RouteNode = z.infer<typeof routeNodeSchema>
export type RouteNodeKind = z.infer<typeof routeNodeKindSchema>

export function getRouteNodes(route: LearningRoute) {
  return route.stages.flatMap((stage) => stage.nodes)
}
