import type { LessonV2 } from '../schema/lesson-schema'
import { LessonV2Error, type LessonV2Issue } from './lesson-v2-errors'
import {
  type LessonV2ValidationContext,
  validateLessonV2,
} from './validate-lesson-v2'

export function auditLessonPublishability(
  input: unknown,
  context: LessonV2ValidationContext = {},
) {
  const lesson = validateLessonV2(input, context)
  return collectPublishabilityIssues(lesson)
}

export function assertLessonPublishable(
  input: unknown,
  context: LessonV2ValidationContext = {},
): LessonV2 {
  const lesson = validateLessonV2(input, context)
  const issues = collectPublishabilityIssues(lesson)
  if (issues.length > 0) {
    throw new LessonV2Error('Lesson is not publishable.', issues)
  }
  return lesson
}

function collectPublishabilityIssues(lesson: LessonV2) {
  const issues: LessonV2Issue[] = []
  lesson.resources.media.forEach((media, index) => {
    const path = ['resources', 'media', index, 'rights'] as PropertyKey[]
    if (
      media.rights.origin === 'generated-placeholder' ||
      media.rights.origin === 'restricted-reference'
    ) {
      issues.push({
        path: [...path, 'origin'],
        message: `Media ${media.id} uses non-publishable origin ${media.rights.origin}.`,
      })
    }
    if (!media.rights.publishable) {
      issues.push({
        path: [...path, 'publishable'],
        message: `Media ${media.id} is not approved for publishing.`,
      })
    }
    if (media.rights.mustReplaceBeforePublish) {
      issues.push({
        path: [...path, 'mustReplaceBeforePublish'],
        message: `Media ${media.id} must be replaced before publishing.`,
      })
    }
    if (
      media.rights.origin === 'licensed' &&
      (!media.rights.licenseId || !media.rights.attribution)
    ) {
      issues.push({
        path,
        message: `Licensed media ${media.id} requires licenseId and attribution.`,
      })
    }
  })
  return issues
}
