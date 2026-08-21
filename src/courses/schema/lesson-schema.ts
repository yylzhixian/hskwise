import { z } from 'zod'

import { lessonActivitySchema } from './activities/lesson-activity-schema'
import {
  authorTextSchema,
  stableIdSchema,
  titleSchema,
} from './base'
import { lessonResourcesSchema } from './resources/lesson-resources-schema'

export const lessonArchetypeSchema = z.enum([
  'pronunciation',
  'dialogue',
  'vocabulary',
  'checkpoint',
  'grammar',
  'listening',
  'reading',
  'character',
  'speaking',
  'writing',
])

const lessonMetadataSchema = z
  .object({
    title: titleSchema,
    description: authorTextSchema,
    level: z
      .object({
        standard: z.enum(['hsk2', 'hsk3', 'custom']),
        value: z.string().trim().min(1).max(40),
      })
      .strict(),
    estimatedMinutes: z.number().int().positive().max(120),
    topics: z.array(stableIdSchema).min(1).max(20),
  })
  .strict()

const lessonObjectiveSchema = z
  .object({
    knowledgeId: stableIdSchema,
    canDo: authorTextSchema,
  })
  .strict()

export const lessonV2Schema = z
  .object({
    $schema: z.string().trim().min(1).optional(),
    schemaVersion: z.literal('lesson/v2'),
    id: stableIdSchema,
    type: lessonArchetypeSchema,
    meta: lessonMetadataSchema,
    objectives: z.array(lessonObjectiveSchema).min(1),
    resources: lessonResourcesSchema,
    steps: z.array(lessonActivitySchema).min(1),
  })
  .strict()
  .superRefine((lesson, context) => {
    addDuplicateIssues(
      lesson.objectives.map((objective) => objective.knowledgeId),
      context,
      ['objectives'],
      'lesson objective knowledge id',
    )
    addDuplicateIssues(
      lesson.steps.map((step) => step.id),
      context,
      ['steps'],
      'lesson activity id',
    )
    lesson.steps.forEach((step, index) => {
      addDuplicateIssues(
        step.knowledgeIds,
        context,
        ['steps', index, 'knowledgeIds'],
        'activity knowledge id',
      )
    })
  })

function addDuplicateIssues(
  ids: string[],
  context: z.RefinementCtx,
  path: PropertyKey[],
  label: string,
) {
  const seen = new Set<string>()
  ids.forEach((id, index) => {
    if (seen.has(id)) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate ${label}: ${id}`,
        path: [...path, index],
      })
    }
    seen.add(id)
  })
}

export type LessonV2 = z.infer<typeof lessonV2Schema>
