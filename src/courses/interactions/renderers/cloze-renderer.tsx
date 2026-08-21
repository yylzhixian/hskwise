'use client'

import type { LessonActivity } from '@/courses/schema/activities/lesson-activity-schema'

import { ActivityChoiceField } from '../components/activity-choice-field'
import type { ActivityRendererProps } from '../model/renderer-contract'

type ClozeActivity = Extract<LessonActivity, { type: 'cloze/v1' }>

export function ClozeRenderer({
  activity,
  actions,
  state,
}: ActivityRendererProps<ClozeActivity>) {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="border-y py-6 text-center">
        <p className="text-3xl leading-10 font-semibold">
          {activity.textBefore}
          <span className="mx-2 inline-block min-w-16 border-b-2 border-focus text-focus">
            ?
          </span>
          {activity.textAfter}
        </p>
        {activity.translation ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {activity.translation}
          </p>
        ) : null}
      </div>
      <ActivityChoiceField
        answer={activity.answer}
        description="Choose the word that makes the sentence complete."
        disabled={state.disabled}
        onSubmit={({ answer, isCorrect }) =>
          actions.submitResponse({ answer, isCorrect })
        }
        options={activity.options}
        prompt={activity.prompt}
      />
    </div>
  )
}
