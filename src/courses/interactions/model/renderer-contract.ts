import type { LessonActivity } from '@/courses/schema/activities/lesson-activity-schema'
import type { ResolvedLessonResources } from '@/courses/compiler/resolve-lesson-resources'

export type ActivityState = {
  disabled: boolean
  ready: boolean
}

export type ActivityActions = {
  submitResponse: (input: {
    answer: unknown
    isCorrect: boolean
  }) => void
  completeMedia: () => void
  assessRecall: (recalled: boolean, revealedAnswer: string) => void
}

export type ActivityRendererProps<
  TActivity extends LessonActivity = LessonActivity,
> = {
  activity: TActivity
  actions: ActivityActions
  resources: ResolvedLessonResources
  state: ActivityState
}
