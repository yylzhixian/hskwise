import type {
  MistakeRecord,
  ReviewItem,
} from './learning-state-schema'

export const reviewRetryDelayMinutes = 10
export type LearningReviewResult = 'recalled' | 'needs-review'

export function getReviewRetryDueAt(now: string): string {
  return new Date(
    Date.parse(now) + reviewRetryDelayMinutes * 60 * 1000,
  ).toISOString()
}

export function reviewItemMatchesMistake(
  item: ReviewItem,
  mistake: MistakeRecord,
): boolean {
  return (
    item.lessonId === mistake.lessonId &&
    item.sourceNodeId === mistake.nodeId &&
    item.sourceStepId === mistake.stepId &&
    item.sourceInteractionId === mistake.interactionId &&
    item.knowledgeId === mistake.knowledgeId
  )
}
