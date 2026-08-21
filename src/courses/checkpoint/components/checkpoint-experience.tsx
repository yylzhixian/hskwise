'use client'

import { useMemo } from 'react'

import { LessonFrame } from '@/components/lesson/lesson-frame'
import { useLearningActions } from '@/hooks/learning/use-learning-actions'
import { useLessonStep } from '@/hooks/lesson/use-lesson-step'
import { LessonStoreProvider } from '@/learning/runtime/provider/lesson-store-provider'
import { createChoiceAnswerCandidates } from '@/lib/learning/review-answer'

import {
  createCheckpointRuntimeDefinition,
  type CheckpointDefinition,
  type CheckpointStep,
} from '../model/checkpoint-schema'
import { CheckpointChoice } from './checkpoint-choice'
import { CheckpointLineOrder } from './checkpoint-line-order'
import { CheckpointListeningChoice } from './checkpoint-listening-choice'
import { CheckpointOverview } from './checkpoint-overview'
import { CheckpointSummary } from './checkpoint-summary'

export function CheckpointExperience({
  checkpoint,
}: {
  checkpoint: CheckpointDefinition
}) {
  const runtimeDefinition = useMemo(
    () => createCheckpointRuntimeDefinition(checkpoint),
    [checkpoint],
  )

  return (
    <LessonStoreProvider definition={runtimeDefinition} key={checkpoint.id}>
      <CheckpointSession checkpoint={checkpoint} />
    </LessonStoreProvider>
  )
}

function CheckpointSession({ checkpoint }: { checkpoint: CheckpointDefinition }) {
  const { recordMistake } = useLearningActions()
  const { feedback, step, submitAnswer } = useLessonStep()
  const contentStep = step
    ? checkpoint.steps.find((candidate) => candidate.id === step.definition.id)
    : null

  if (!step || !contentStep) return null

  const submitChoice = (result: { selectedId: string; isCorrect: boolean }) => {
    if (!isChoiceStep(contentStep)) return
    if (!result.isCorrect) {
      recordCheckpointMistake({ checkpoint, recordMistake, step: contentStep })
    }
    submitAnswer({
      interactionId: `${contentStep.id}:answer`,
      answer: result.selectedId,
      isCorrect: result.isCorrect,
      correctFeedback: {
        title: getCorrectTitle(contentStep),
        message: contentStep.correctFeedback,
      },
      incorrectFeedback: {
        title: getIncorrectTitle(contentStep),
        message: contentStep.incorrectFeedback,
      },
    })
  }

  return (
    <LessonFrame>
      <CheckpointStepView
        disabled={Boolean(feedback)}
        onSubmitChoice={submitChoice}
        onSubmitOrder={(result) => {
          if (contentStep.kind !== 'line-order') return
          if (!result.isCorrect) {
            recordCheckpointMistake({ checkpoint, recordMistake, step: contentStep })
          }
          submitAnswer({
            interactionId: `${contentStep.id}:answer`,
            answer: result.orderedIds,
            isCorrect: result.isCorrect,
            correctFeedback: {
              title: 'Meeting rebuilt',
              message: contentStep.correctFeedback,
            },
            incorrectFeedback: {
              title: 'Sequence needs another pass',
              message: contentStep.incorrectFeedback,
            },
          })
        }}
        step={contentStep}
      />
    </LessonFrame>
  )
}

function CheckpointStepView({
  disabled,
  onSubmitChoice,
  onSubmitOrder,
  step,
}: {
  disabled: boolean
  onSubmitChoice: (result: { selectedId: string; isCorrect: boolean }) => void
  onSubmitOrder: (result: { orderedIds: string[]; isCorrect: boolean }) => void
  step: CheckpointStep
}) {
  switch (step.kind) {
    case 'checkpoint-intro':
      return <CheckpointOverview step={step} />
    case 'listening-choice':
      return <CheckpointListeningChoice disabled={disabled} onSubmit={onSubmitChoice} step={step} />
    case 'meaning-choice':
    case 'dialogue-choice':
      return <CheckpointChoice disabled={disabled} onSubmit={onSubmitChoice} step={step} />
    case 'line-order':
      return <CheckpointLineOrder disabled={disabled} onSubmit={onSubmitOrder} step={step} />
    case 'checkpoint-summary':
      return <CheckpointSummary step={step} />
  }
}

type InteractiveCheckpointStep = Extract<
  CheckpointStep,
  { kind: 'listening-choice' | 'meaning-choice' | 'dialogue-choice' | 'line-order' }
>

function isChoiceStep(step: CheckpointStep): step is Exclude<InteractiveCheckpointStep, { kind: 'line-order' }> {
  return (
    step.kind === 'listening-choice' ||
    step.kind === 'meaning-choice' ||
    step.kind === 'dialogue-choice'
  )
}

function recordCheckpointMistake({
  checkpoint,
  recordMistake,
  step,
}: {
  checkpoint: CheckpointDefinition
  recordMistake: ReturnType<typeof useLearningActions>['recordMistake']
  step: InteractiveCheckpointStep
}) {
  if (!checkpoint.nodeId) return
  const acceptedAnswers =
    step.kind === 'line-order'
      ? [
          step.correctOrder
            .flatMap((itemId) => {
              const item = step.items.find((candidate) => candidate.id === itemId)
              return item ? [item.label] : []
            })
            .join(' '),
        ]
      : step.options
          .filter((option) => option.isCorrect)
          .flatMap(createChoiceAnswerCandidates)
  recordMistake({
    acceptedAnswers,
    lessonId: checkpoint.id,
    nodeId: checkpoint.nodeId,
    stepId: step.id,
    interactionId: `${step.id}:answer`,
    knowledgeIds: step.knowledgeIds,
    prompt: step.prompt,
    correction: step.correctFeedback,
    reviewLabel: step.title,
  })
}

function getCorrectTitle(step: Exclude<InteractiveCheckpointStep, { kind: 'line-order' }>) {
  if (step.kind === 'listening-choice') return 'Tone recognized'
  if (step.kind === 'dialogue-choice') return 'Reply connected'
  return 'Meaning connected'
}

function getIncorrectTitle(step: Exclude<InteractiveCheckpointStep, { kind: 'line-order' }>) {
  if (step.kind === 'listening-choice') return 'Listen for the turn'
  if (step.kind === 'dialogue-choice') return 'Follow the greeting again'
  return 'Return to the sentence pattern'
}
