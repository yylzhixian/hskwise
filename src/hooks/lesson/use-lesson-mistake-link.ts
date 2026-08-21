'use client'

import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import type { LessonActivity } from '@/courses/schema/activities/lesson-activity-schema'
import type { LessonPlacement } from '@/learning/routes/model/route-schema'
import { recordLearningMistakeAtom } from '@/store/learning/atoms/learning-action-atoms'

export function useLessonMistakeLink({
  lessonId,
  placement,
}: {
  lessonId: string
  placement?: LessonPlacement
}) {
  const recordMistake = useSetAtom(recordLearningMistakeAtom)

  return useCallback(
    ({
      acceptedAnswers,
      activity,
      correction,
      interactionId,
      prompt,
    }: {
      acceptedAnswers: string[]
      activity: LessonActivity
      correction: string
      interactionId: string
      prompt: string
    }) => {
      if (!placement) return
      recordMistake({
        acceptedAnswers,
        correction,
        interactionId,
        knowledgeIds: activity.knowledgeIds,
        lessonId,
        nodeId: placement.nodeId,
        now: new Date().toISOString(),
        prompt,
        reviewLabel: activity.title,
        stepId: activity.id,
      })
    },
    [lessonId, placement, recordMistake],
  )
}
