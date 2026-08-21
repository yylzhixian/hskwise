'use client'

import { VocabularyActiveRecall } from '@/courses/vocabulary/components/vocabulary-active-recall'
import type { LessonActivity } from '@/courses/schema/activities/lesson-activity-schema'

import type { ActivityRendererProps } from '../model/renderer-contract'

type RecallActivity = Extract<LessonActivity, { type: 'active-recall/v1' }>

export function ActiveRecallRenderer({
  activity,
  actions,
  resources,
  state,
}: ActivityRendererProps<RecallActivity>) {
  const lexeme = resources.lexemesById[activity.targetRef.id]
  if (!lexeme) return null

  return (
    <VocabularyActiveRecall
      disabled={state.disabled}
      item={lexeme}
      onAssess={({ recalled }) =>
        actions.assessRecall(
          recalled,
          `${lexeme.text} · ${lexeme.pinyin} · ${lexeme.meaning}`,
        )
      }
      step={activity}
    />
  )
}
