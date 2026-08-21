import {
  type LessonDefinition,
  lessonDefinitionSchema,
} from '@/learning/runtime/model/lesson-definition'

import type { LessonActivity } from '../schema/activities/lesson-activity-schema'
import type { LessonV2 } from '../schema/lesson-schema'
import { LessonV2Error } from './lesson-v2-errors'
import {
  type LessonV2ValidationContext,
  validateLessonV2,
} from './validate-lesson-v2'

export function compileLessonV2(
  input: unknown,
  context: LessonV2ValidationContext = {},
): LessonDefinition {
  const lesson = validateLessonV2(input, context)

  const result = lessonDefinitionSchema.safeParse({
    id: lesson.id,
    title: lesson.meta.title,
    description: lesson.meta.description,
    estimatedMinutes: lesson.meta.estimatedMinutes,
    steps: lesson.steps.map((activity) => ({
      id: activity.id,
      eyebrow: activity.eyebrow,
      title: activity.title,
      instruction: activity.instruction,
      knowledgeIds: activity.knowledgeIds,
      completionRule: createCompletionRule(lesson, activity),
    })),
  })
  if (!result.success) {
    throw new LessonV2Error(
      'Lesson compiler produced an invalid runtime definition.',
      result.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    )
  }
  return result.data
}

function createCompletionRule(lesson: LessonV2, activity: LessonActivity) {
  if (
    activity.type === 'single-choice/v1' ||
    activity.type === 'ordering/v1' ||
    activity.type === 'cloze/v1'
  ) {
    return {
      kind: 'interaction' as const,
      interactionId: `${lesson.id}:${activity.id}:answer`,
      requireCorrect: activity.policy?.completion !== 'submit',
    }
  }
  if (activity.type === 'active-recall/v1') {
    return {
      kind: 'interaction' as const,
      interactionId: `${lesson.id}:${activity.id}:answer`,
      requireCorrect: false,
    }
  }
  if (
    activity.type === 'audio-explore/v1' ||
    activity.type === 'role-play/v1'
  ) {
    return {
      kind: 'media' as const,
      mediaId: `${lesson.id}:${activity.id}:media`,
    }
  }
  return { kind: 'continue' as const }
}
