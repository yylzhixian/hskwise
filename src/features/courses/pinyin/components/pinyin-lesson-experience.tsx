'use client'

import { useCallback, useMemo } from 'react'

import { useLessonSession } from '@/features/lesson-runtime/hooks/use-lesson-session'
import { useLessonStep } from '@/features/lesson-runtime/hooks/use-lesson-step'
import { LessonStoreProvider } from '@/features/lesson-runtime/provider/lesson-store-provider'
import { LessonFrame } from '@/features/lesson-runtime/components/lesson-frame'

import {
  createPinyinRuntimeDefinition,
  type PinyinLessonDefinition,
  type PinyinLessonStep,
  type PinyinTone,
} from '../model/pinyin-lesson-schema'
import { PinyinLessonSummary } from './pinyin-lesson-summary'
import { ToneChoiceInteraction } from './tone-choice-interaction'
import { ToneOverview } from './tone-overview'
import { TonePitchGuide } from './tone-pitch-guide'

export function PinyinLessonExperience({
  lesson,
}: {
  lesson: PinyinLessonDefinition
}) {
  const runtimeDefinition = useMemo(
    () => createPinyinRuntimeDefinition(lesson),
    [lesson],
  )

  return (
    <LessonStoreProvider definition={runtimeDefinition} key={lesson.id}>
      <PinyinLessonSession lesson={lesson} />
    </LessonStoreProvider>
  )
}

function PinyinLessonSession({
  lesson,
}: {
  lesson: PinyinLessonDefinition
}) {
  const session = useLessonSession()
  const { completeMedia, feedback, step, submitAnswer } = useLessonStep()
  const contentStep = step
    ? lesson.steps.find((item) => item.id === step.definition.id)
    : null
  const completePitchGuide = useCallback(() => {
    if (!contentStep || contentStep.kind !== 'pitch-guide') return
    completeMedia({
      mediaId: `${contentStep.id}:pitch-guide`,
      feedback: {
        title: 'Four paths heard',
        message: 'Keep the direction in mind as you identify the tone shapes.',
      },
    })
  }, [completeMedia, contentStep])

  if (!step || !contentStep) return null

  return (
    <LessonFrame>
      <PinyinStepView
        completed={session?.status === 'completed'}
        disabled={Boolean(feedback)}
        key={contentStep.id}
        lesson={lesson}
        onCompletePitchGuide={completePitchGuide}
        onSubmitAnswer={submitAnswer}
        runtimeReady={step.session.isReady}
        step={contentStep}
      />
    </LessonFrame>
  )
}

function PinyinStepView({
  completed,
  disabled,
  lesson,
  onCompletePitchGuide,
  onSubmitAnswer,
  runtimeReady,
  step,
}: {
  completed: boolean
  disabled: boolean
  lesson: PinyinLessonDefinition
  onCompletePitchGuide: () => void
  onSubmitAnswer: ReturnType<typeof useLessonStep>['submitAnswer']
  runtimeReady: boolean
  step: PinyinLessonStep
}) {
  switch (step.kind) {
    case 'tone-overview':
      return <ToneOverview tones={lesson.tones} />
    case 'pitch-guide':
      return (
        <TonePitchGuide
          completed={runtimeReady}
          onComplete={onCompletePitchGuide}
          tones={selectTones(lesson.tones, step.toneNumbers)}
        />
      )
    case 'tone-choice':
      return (
        <ToneChoiceInteraction
          correctToneNumber={step.correctToneNumber}
          disabled={disabled}
          onSubmit={(result) =>
            onSubmitAnswer({
              interactionId: `${step.id}:answer`,
              answer: result.selectedId,
              isCorrect: result.isCorrect,
              correctFeedback: {
                title: 'Path identified',
                message: step.correctFeedback,
              },
              incorrectFeedback: {
                title: 'Trace the line again',
                message: step.incorrectFeedback,
              },
            })
          }
          prompt={step.prompt}
          tones={selectTones(lesson.tones, step.optionToneNumbers)}
        />
      )
    case 'lesson-summary':
      return (
        <PinyinLessonSummary
          completed={completed}
          takeaways={step.takeaways}
        />
      )
  }
}

function selectTones(
  tones: PinyinTone[],
  toneNumbers: Array<PinyinTone['number']>,
) {
  const tonesByNumber = new Map(tones.map((tone) => [tone.number, tone]))
  return toneNumbers.flatMap((toneNumber) => {
    const tone = tonesByNumber.get(toneNumber)
    return tone ? [tone] : []
  })
}
