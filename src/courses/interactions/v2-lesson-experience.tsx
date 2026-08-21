'use client'

import { LessonFrame } from '@/components/lesson/lesson-frame'
import type { LessonV2Definition } from '@/courses/content/lesson-v2-registry'
import { useLessonActivity } from '@/hooks/lesson/use-lesson-activity'
import { LessonStoreProvider } from '@/learning/runtime/provider/lesson-store-provider'
import type { LessonPlacement } from '@/learning/routes/model/route-schema'

import { LessonActivityRenderer } from './activity-renderer'

export function V2LessonExperience({
  definition,
  placement,
}: {
  definition: LessonV2Definition
  placement?: LessonPlacement
}) {
  const runtime = placement
    ? { ...definition.runtime, ...placement }
    : definition.runtime

  return (
    <LessonStoreProvider definition={runtime} key={runtime.id}>
      <V2LessonSession definition={definition} placement={placement} />
    </LessonStoreProvider>
  )
}

function V2LessonSession({
  definition,
  placement,
}: {
  definition: LessonV2Definition
  placement?: LessonPlacement
}) {
  const { actions, activity, state } = useLessonActivity({
    lesson: definition.lesson,
    placement,
    resources: definition.resources,
  })
  if (!activity) return null

  return (
    <LessonFrame>
      <LessonActivityRenderer
        actions={actions}
        activity={activity}
        resources={definition.resources}
        state={state}
      />
    </LessonFrame>
  )
}
