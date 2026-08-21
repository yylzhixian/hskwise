'use client'

import { useCallback, useMemo } from 'react'

import { useLearningActions } from '@/hooks/learning/use-learning-actions'
import { useLessonSession } from '@/hooks/lesson/use-lesson-session'
import { useLessonStep } from '@/hooks/lesson/use-lesson-step'
import { LessonStoreProvider } from '@/learning/runtime/provider/lesson-store-provider'
import { LessonFrame } from '@/components/lesson/lesson-frame'

import {
  createPinyinRuntimeDefinition,
  type PinyinLessonCheckQuestion,
  type PinyinLessonDefinition,
  type PinyinLessonStep,
  type PinyinTone,
} from '../model/pinyin-lesson-schema'
import { PinyinLessonCheck } from './pinyin-lesson-check'
import { PinyinLessonSummary } from './pinyin-lesson-summary'
import { PronunciationPractice } from './pronunciation-practice'
import { ToneChoiceInteraction } from './tone-choice-interaction'
import { ToneListeningChoice } from './tone-listening-choice'
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
  const { recordMistake } = useLearningActions()
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
  const completePronunciationPractice = useCallback(() => {
    if (!contentStep || contentStep.kind !== 'pronunciation-practice') return
    completeMedia({
      mediaId: `${contentStep.id}:pronunciation-practice`,
      feedback: {
        title: 'Voice practice complete',
        message: 'Keep the four pitch directions distinct as you continue.',
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
        onCompletePronunciationPractice={completePronunciationPractice}
        onRecordMistake={recordMistake}
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
  onCompletePronunciationPractice,
  onRecordMistake,
  onSubmitAnswer,
  runtimeReady,
  step,
}: {
  completed: boolean
  disabled: boolean
  lesson: PinyinLessonDefinition
  onCompletePitchGuide: () => void
  onCompletePronunciationPractice: () => void
  onRecordMistake: ReturnType<typeof useLearningActions>['recordMistake']
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
          onSubmit={(result) => {
            if (!result.isCorrect && lesson.nodeId) {
              onRecordMistake({
                acceptedAnswers: getToneReviewAnswers(
                  lesson,
                  step.correctToneNumber,
                ),
                lessonId: lesson.id,
                nodeId: lesson.nodeId,
                stepId: step.id,
                interactionId: `${step.id}:answer`,
                knowledgeIds: step.knowledgeIds,
                prompt: step.prompt,
                correction: step.correctFeedback,
                reviewLabel: step.title,
              })
            }

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
          }}
          prompt={step.prompt}
          tones={selectTones(lesson.tones, step.optionToneNumbers)}
        />
      )
    case 'tone-listening-choice':
      return (
        <ToneListeningChoice
          disabled={disabled}
          onSubmit={(result) => {
            if (!result.isCorrect && lesson.nodeId) {
              onRecordMistake({
                acceptedAnswers: getToneReviewAnswers(
                  lesson,
                  step.correctToneNumber,
                ),
                lessonId: lesson.id,
                nodeId: lesson.nodeId,
                stepId: step.id,
                interactionId: `${step.id}:answer`,
                knowledgeIds: step.knowledgeIds,
                prompt: step.prompt,
                correction: step.correctFeedback,
                reviewLabel: step.title,
              })
            }

            onSubmitAnswer({
              interactionId: `${step.id}:answer`,
              answer: result.selectedId,
              isCorrect: result.isCorrect,
              correctFeedback: {
                title: 'Sound identified',
                message: step.correctFeedback,
              },
              incorrectFeedback: {
                title: 'Listen once more',
                message: step.incorrectFeedback,
              },
            })
          }}
          step={step}
          tones={selectTones(lesson.tones, step.optionToneNumbers)}
        />
      )
    case 'pronunciation-practice':
      return (
        <PronunciationPractice
          completed={runtimeReady}
          onComplete={onCompletePronunciationPractice}
          step={step}
        />
      )
    case 'lesson-check':
      return (
        <PinyinLessonCheck
          completed={runtimeReady}
          onComplete={(answers) =>
            onSubmitAnswer({
              interactionId: `${step.id}:answer`,
              answer: answers,
              isCorrect: true,
              correctFeedback: {
                title: 'Final check complete',
                message: 'All five tone connections are ready to carry forward.',
              },
            })
          }
          onIncorrect={(question) => {
            if (!lesson.nodeId) return
            recordCheckMistake({ lesson, onRecordMistake, question, step })
          }}
          step={step}
          tones={lesson.tones}
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

function recordCheckMistake({
  lesson,
  onRecordMistake,
  question,
  step,
}: {
  lesson: PinyinLessonDefinition
  onRecordMistake: ReturnType<typeof useLearningActions>['recordMistake']
  question: PinyinLessonCheckQuestion
  step: Extract<PinyinLessonStep, { kind: 'lesson-check' }>
}) {
  if (!lesson.nodeId) return
  onRecordMistake({
    acceptedAnswers: getToneReviewAnswers(
      lesson,
      question.correctToneNumber,
    ),
    lessonId: lesson.id,
    nodeId: lesson.nodeId,
    stepId: step.id,
    interactionId: `${step.id}:${question.id}`,
    knowledgeIds: question.knowledgeIds,
    prompt: question.prompt,
    correction: question.correctFeedback,
    reviewLabel: `${step.title}: ${question.id}`,
  })
}

function getToneReviewAnswers(
  lesson: PinyinLessonDefinition,
  toneNumber: PinyinTone['number'],
) {
  const tone = lesson.tones.find((candidate) => candidate.number === toneNumber)
  return [
    `Tone ${toneNumber}`,
    String(toneNumber),
    ...(tone ? [tone.name] : []),
  ]
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
