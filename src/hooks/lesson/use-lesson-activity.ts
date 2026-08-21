'use client'

import { useCallback } from 'react'

import type {
  ActivityActions,
  ActivityState,
} from '@/courses/interactions/model/renderer-contract'
import type { LessonActivity } from '@/courses/schema/activities/lesson-activity-schema'
import type { LessonV2 } from '@/courses/schema/lesson-schema'
import type { ResolvedLessonResources } from '@/courses/compiler/resolve-lesson-resources'
import { getActivityReviewAnswers } from '@/courses/interactions/model/activity-review-answers'
import type { LessonPlacement } from '@/learning/routes/model/route-schema'

import { useLessonMistakeLink } from './use-lesson-mistake-link'
import { useLessonStep } from './use-lesson-step'

export function useLessonActivity({
  lesson,
  placement,
  resources,
}: {
  lesson: LessonV2
  placement?: LessonPlacement
  resources: ResolvedLessonResources
}) {
  const { completeMedia, feedback, step, submitAnswer } = useLessonStep()
  const activity = step
    ? lesson.steps.find((candidate) => candidate.id === step.definition.id) ?? null
    : null
  const recordMistake = useLessonMistakeLink({ lessonId: lesson.id, placement })

  const submitResponse = useCallback(
    ({ answer, isCorrect }: { answer: unknown; isCorrect: boolean }) => {
      if (!activity || !step) return
      const rule = step.definition.completionRule
      if (rule.kind !== 'interaction' || !hasAnswerFeedback(activity)) return
      const titles = getAnswerFeedbackTitles(activity)
      if (!isCorrect) {
        recordMistake({
          acceptedAnswers: getActivityReviewAnswers(activity, resources),
          activity,
          correction: activity.feedback.correct,
          interactionId: rule.interactionId,
          prompt: getActivityPrompt(activity),
        })
      }
      submitAnswer({
        interactionId: rule.interactionId,
        answer,
        isCorrect,
        correctFeedback: {
          title: titles.correct,
          message: activity.feedback.correct,
        },
        incorrectFeedback: {
          title: titles.incorrect,
          message: activity.feedback.retry,
        },
      })
    },
    [activity, recordMistake, resources, step, submitAnswer],
  )

  const completeActivityMedia = useCallback(() => {
    if (!activity || !step) return
    const rule = step.definition.completionRule
    if (rule.kind !== 'media') return
    const feedbackCopy =
      activity.type === 'role-play/v1'
        ? {
            title: 'Role practice complete',
            message: 'You carried one side of the exchange from start to finish.',
          }
        : {
            title: 'Every line heard',
            message: 'You listened to the required audio from start to finish.',
          }
    completeMedia({ mediaId: rule.mediaId, feedback: feedbackCopy })
  }, [activity, completeMedia, step])

  const assessRecall = useCallback(
    (recalled: boolean, revealedAnswer: string) => {
      if (!activity || activity.type !== 'active-recall/v1' || !step) return
      const rule = step.definition.completionRule
      if (rule.kind !== 'interaction') return
      if (!recalled) {
        recordMistake({
          acceptedAnswers: getActivityReviewAnswers(activity, resources),
          activity,
          correction: revealedAnswer,
          interactionId: rule.interactionId,
          prompt: activity.cue,
        })
      }
      submitAnswer({
        interactionId: rule.interactionId,
        answer: recalled ? 'recalled' : 'needs-review',
        isCorrect: recalled ? true : null,
        correctFeedback: {
          title: 'Recall confirmed',
          message: activity.feedback.mastered,
        },
        infoFeedback: {
          title: 'Added to review',
          message: activity.feedback.review,
        },
      })
    },
    [activity, recordMistake, resources, step, submitAnswer],
  )

  const actions: ActivityActions = {
    assessRecall,
    completeMedia: completeActivityMedia,
    submitResponse,
  }
  const state: ActivityState = {
    disabled: Boolean(feedback),
    ready: step?.session.isReady ?? false,
  }

  return { actions, activity, state }
}

type AnswerActivity = Extract<
  LessonActivity,
  { type: 'single-choice/v1' | 'ordering/v1' | 'cloze/v1' }
>

function hasAnswerFeedback(activity: LessonActivity): activity is AnswerActivity {
  return (
    activity.type === 'single-choice/v1' ||
    activity.type === 'ordering/v1' ||
    activity.type === 'cloze/v1'
  )
}

function getAnswerFeedbackTitles(activity: AnswerActivity) {
  if (activity.type === 'ordering/v1') {
    return { correct: 'Order restored', incorrect: 'Reorder and try again' }
  }
  if (activity.type === 'cloze/v1') {
    return { correct: 'Sentence complete', incorrect: 'Reconnect the sentence' }
  }
  if (activity.stimulus?.kind === 'audio') {
    return { correct: 'Sound recognized', incorrect: 'Listen once more' }
  }
  if (
    activity.stimulus?.kind === 'dialogue' ||
    activity.stimulus?.kind === 'dialogue-line'
  ) {
    return { correct: 'Exchange understood', incorrect: 'Follow the exchange again' }
  }
  return { correct: 'Answer connected', incorrect: 'Try once more' }
}

function getActivityPrompt(activity: AnswerActivity) {
  return activity.prompt
}
