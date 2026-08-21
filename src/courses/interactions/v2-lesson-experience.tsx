'use client'

import { LessonFrame } from '@/components/lesson/lesson-frame'
import type { LessonV2Pilot } from '@/courses/content/v2-pilot-registry'
import { useLessonActivity } from '@/hooks/lesson/use-lesson-activity'
import { LessonStoreProvider } from '@/learning/runtime/provider/lesson-store-provider'

import { LessonActivityRenderer } from './activity-renderer'

export function V2LessonExperience({ pilot }: { pilot: LessonV2Pilot }) {
  return (
    <LessonStoreProvider definition={pilot.runtime} key={pilot.runtime.id}>
      <V2LessonSession pilot={pilot} />
    </LessonStoreProvider>
  )
}

function V2LessonSession({ pilot }: { pilot: LessonV2Pilot }) {
  const { actions, activity, state } = useLessonActivity({
    lesson: pilot.lesson,
    placement: pilot.placement,
    resources: pilot.resources,
  })
  if (!activity) return null

  return (
    <LessonFrame>
      <LessonActivityRenderer
        actions={actions}
        activity={activity}
        resources={pilot.resources}
        state={state}
      />
    </LessonFrame>
  )
}
