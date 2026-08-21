import type { ResolvedLessonResources } from '@/courses/compiler/resolve-lesson-resources'
import type { LessonActivity } from '@/courses/schema/activities/lesson-activity-schema'
import { createChoiceAnswerCandidates } from '@/lib/learning/review-answer'

export function getActivityReviewAnswers(
  activity: LessonActivity,
  resources: ResolvedLessonResources,
) {
  if (activity.type === 'active-recall/v1') {
    const lexeme = resources.lexemesById[activity.targetRef.id]
    return lexeme
      ? [lexeme.text, lexeme.pinyin, `${lexeme.text} ${lexeme.pinyin}`]
      : []
  }

  if (
    activity.type === 'single-choice/v1' ||
    activity.type === 'cloze/v1'
  ) {
    const option = activity.options.find(
      (candidate) => candidate.id === activity.answer,
    )
    return option ? createChoiceAnswerCandidates(option) : []
  }

  if (activity.type !== 'ordering/v1') return []

  const itemsById = new Map(activity.items.map((item) => [item.id, item]))
  const labels = activity.answer.flatMap((itemId) => {
    const item = itemsById.get(itemId)
    if (!item) return []
    if (item.label) return [item.label]
    if (!item.dialogueLineRef) return []

    const dialogue = resources.dialoguesById[item.dialogueLineRef.dialogueRef]
    const line = dialogue?.lines.find(
      (candidate) => candidate.id === item.dialogueLineRef?.lineRef,
    )
    return line ? [line.tokens.map((token) => token.text).join('')] : []
  })

  return labels.length === activity.answer.length ? [labels.join(' ')] : []
}
