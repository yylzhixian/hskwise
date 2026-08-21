'use client'

import { useCallback, useMemo } from 'react'

import { LessonFrame } from '@/components/lesson/lesson-frame'
import { useLearningActions } from '@/hooks/learning/use-learning-actions'
import { useLessonStep } from '@/hooks/lesson/use-lesson-step'
import { LessonStoreProvider } from '@/learning/runtime/provider/lesson-store-provider'

import {
  createDialogueRuntimeDefinition,
  type DialogueLessonDefinition,
  type DialogueLessonStep,
} from '../model/dialogue-lesson-schema'
import { DialogueComprehension } from './dialogue-comprehension'
import { DialogueExplorer } from './dialogue-explorer'
import { DialogueLineOrder } from './dialogue-line-order'
import { DialogueRolePractice } from './dialogue-role-practice'
import { DialogueSceneIntro } from './dialogue-scene-intro'
import { DialogueSummary } from './dialogue-summary'

export function DialogueLessonExperience({
  lesson,
}: {
  lesson: DialogueLessonDefinition
}) {
  const runtimeDefinition = useMemo(
    () => createDialogueRuntimeDefinition(lesson),
    [lesson],
  )

  return (
    <LessonStoreProvider definition={runtimeDefinition} key={lesson.id}>
      <DialogueLessonSession lesson={lesson} />
    </LessonStoreProvider>
  )
}

function DialogueLessonSession({
  lesson,
}: {
  lesson: DialogueLessonDefinition
}) {
  const { recordMistake } = useLearningActions()
  const { completeMedia, feedback, step, submitAnswer } = useLessonStep()
  const contentStep = step
    ? lesson.steps.find((item) => item.id === step.definition.id)
    : null
  const completeExplore = useCallback(() => {
    if (!contentStep || contentStep.kind !== 'dialogue-explore') return
    completeMedia({
      mediaId: `${contentStep.id}:explore`,
      feedback: {
        title: 'Every line heard',
        message: 'You listened to both sides of the exchange from start to finish.',
      },
    })
  }, [completeMedia, contentStep])
  const completeRolePractice = useCallback(() => {
    if (!contentStep || contentStep.kind !== 'role-practice') return
    completeMedia({
      mediaId: `${contentStep.id}:role-practice`,
      feedback: {
        title: 'Role practice complete',
        message: 'You carried one side of the greeting from start to finish.',
      },
    })
  }, [completeMedia, contentStep])

  if (!step || !contentStep) return null

  return (
    <LessonFrame>
      <DialogueStepView
        disabled={Boolean(feedback)}
        lesson={lesson}
        onCompleteExplore={completeExplore}
        onCompleteRolePractice={completeRolePractice}
        onRecordMistake={recordMistake}
        onSubmitAnswer={submitAnswer}
        runtimeReady={step.session.isReady}
        step={contentStep}
      />
    </LessonFrame>
  )
}

function DialogueStepView({
  disabled,
  lesson,
  onCompleteExplore,
  onCompleteRolePractice,
  onRecordMistake,
  onSubmitAnswer,
  runtimeReady,
  step,
}: {
  disabled: boolean
  lesson: DialogueLessonDefinition
  onCompleteExplore: () => void
  onCompleteRolePractice: () => void
  onRecordMistake: ReturnType<typeof useLearningActions>['recordMistake']
  onSubmitAnswer: ReturnType<typeof useLessonStep>['submitAnswer']
  runtimeReady: boolean
  step: DialogueLessonStep
}) {
  switch (step.kind) {
    case 'scene-intro':
      return <DialogueSceneIntro step={step} />
    case 'dialogue-explore':
      return (
        <DialogueExplorer
          completed={runtimeReady}
          lines={selectLines(lesson, step.lineIds)}
          onComplete={onCompleteExplore}
          roles={lesson.roles}
        />
      )
    case 'comprehension-choice':
      return (
        <DialogueComprehension
          disabled={disabled}
          onSubmit={(result) => {
            if (!result.isCorrect) {
              recordDialogueMistake({
                correction: step.correctFeedback,
                lesson,
                onRecordMistake,
                prompt: step.prompt,
                reviewLabel: step.title,
                step,
              })
            }
            onSubmitAnswer({
              interactionId: `${step.id}:answer`,
              answer: result.selectedId,
              isCorrect: result.isCorrect,
              correctFeedback: {
                title: 'Exchange understood',
                message: step.correctFeedback,
              },
              incorrectFeedback: {
                title: 'Follow the exchange again',
                message: step.incorrectFeedback,
              },
            })
          }}
          step={step}
        />
      )
    case 'line-order':
      return (
        <DialogueLineOrder
          disabled={disabled}
          lines={selectLines(lesson, step.lineIds)}
          onSubmit={(result) => {
            if (!result.isCorrect) {
              recordDialogueMistake({
                correction: step.correctFeedback,
                lesson,
                onRecordMistake,
                prompt: step.prompt,
                reviewLabel: step.title,
                step,
              })
            }
            onSubmitAnswer({
              interactionId: `${step.id}:answer`,
              answer: result.orderedIds,
              isCorrect: result.isCorrect,
              correctFeedback: {
                title: 'Conversation rebuilt',
                message: step.correctFeedback,
              },
              incorrectFeedback: {
                title: 'The replies are crossed',
                message: step.incorrectFeedback,
              },
            })
          }}
          roles={lesson.roles}
          step={step}
        />
      )
    case 'role-practice':
      return (
        <DialogueRolePractice
          completed={runtimeReady}
          lines={selectLines(lesson, step.lineIds)}
          onComplete={onCompleteRolePractice}
          roles={selectRoles(lesson, step.roleIds)}
          step={step}
        />
      )
    case 'dialogue-summary':
      return <DialogueSummary step={step} />
  }
}

function selectLines(lesson: DialogueLessonDefinition, lineIds: string[]) {
  const linesById = new Map(lesson.lines.map((line) => [line.id, line]))
  return lineIds.flatMap((lineId) => {
    const line = linesById.get(lineId)
    return line ? [line] : []
  })
}

function selectRoles(lesson: DialogueLessonDefinition, roleIds: string[]) {
  const rolesById = new Map(lesson.roles.map((role) => [role.id, role]))
  return roleIds.flatMap((roleId) => {
    const role = rolesById.get(roleId)
    return role ? [role] : []
  })
}

function recordDialogueMistake({
  correction,
  lesson,
  onRecordMistake,
  prompt,
  reviewLabel,
  step,
}: {
  correction: string
  lesson: DialogueLessonDefinition
  onRecordMistake: ReturnType<typeof useLearningActions>['recordMistake']
  prompt: string
  reviewLabel: string
  step: Extract<
    DialogueLessonStep,
    { kind: 'comprehension-choice' | 'line-order' }
  >
}) {
  if (!lesson.nodeId) return
  onRecordMistake({
    acceptedAnswers:
      step.kind === 'comprehension-choice'
        ? step.options
            .filter((option) => option.isCorrect)
            .map((option) => option.label)
        : [
            step.lineIds
              .flatMap((lineId) => {
                const line = lesson.lines.find((item) => item.id === lineId)
                return line
                  ? [line.tokens.map((token) => token.text).join('')]
                  : []
              })
              .join(' '),
          ].filter(Boolean),
    correction,
    interactionId: `${step.id}:answer`,
    knowledgeIds: step.knowledgeIds,
    lessonId: lesson.id,
    nodeId: lesson.nodeId,
    prompt,
    reviewLabel,
    stepId: step.id,
  })
}
