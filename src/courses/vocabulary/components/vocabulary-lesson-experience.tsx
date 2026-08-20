'use client'

import { useMemo } from 'react'

import { LessonFrame } from '@/components/lesson/lesson-frame'
import { useLearningActions } from '@/hooks/learning/use-learning-actions'
import { useLessonStep } from '@/hooks/lesson/use-lesson-step'
import { LessonStoreProvider } from '@/learning/runtime/provider/lesson-store-provider'

import {
  createVocabularyRuntimeDefinition,
  type VocabularyLessonDefinition,
  type VocabularyLessonStep,
} from '../model/vocabulary-lesson-schema'
import { VocabularyActiveRecall } from './vocabulary-active-recall'
import { VocabularyChoice } from './vocabulary-choice'
import { VocabularyContextDiscovery } from './vocabulary-context-discovery'
import { VocabularyListeningChoice } from './vocabulary-listening-choice'
import { VocabularySummary } from './vocabulary-summary'
import { VocabularyWordFocus } from './vocabulary-word-focus'

export function VocabularyLessonExperience({
  lesson,
}: {
  lesson: VocabularyLessonDefinition
}) {
  const runtimeDefinition = useMemo(
    () => createVocabularyRuntimeDefinition(lesson),
    [lesson],
  )

  return (
    <LessonStoreProvider definition={runtimeDefinition} key={lesson.id}>
      <VocabularyLessonSession lesson={lesson} />
    </LessonStoreProvider>
  )
}

function VocabularyLessonSession({
  lesson,
}: {
  lesson: VocabularyLessonDefinition
}) {
  const { recordMistake } = useLearningActions()
  const { feedback, step, submitAnswer } = useLessonStep()
  const contentStep = step
    ? lesson.steps.find((item) => item.id === step.definition.id)
    : null

  if (!step || !contentStep) return null

  const submitChoice = (result: { selectedId: string; isCorrect: boolean }) => {
    if (!isChoiceStep(contentStep)) return
    if (!result.isCorrect) {
      recordVocabularyMistake({
        correction: contentStep.correctFeedback,
        lesson,
        prompt: contentStep.prompt,
        recordMistake,
        step: contentStep,
      })
    }
    submitAnswer({
      interactionId: `${contentStep.id}:answer`,
      answer: result.selectedId,
      isCorrect: result.isCorrect,
      correctFeedback: {
        title:
          contentStep.kind === 'sentence-application'
            ? 'Sentence complete'
            : contentStep.kind === 'listening-choice'
              ? 'Sound recognized'
              : 'Meaning connected',
        message: contentStep.correctFeedback,
      },
      incorrectFeedback: {
        title:
          contentStep.kind === 'listening-choice'
            ? 'Listen once more'
            : 'Reconnect the word',
        message: contentStep.incorrectFeedback,
      },
    })
  }

  return (
    <LessonFrame>
      <VocabularyStepView
        disabled={Boolean(feedback)}
        lesson={lesson}
        onAssessRecall={(recalled) => {
          if (contentStep.kind !== 'active-recall') return
          if (!recalled) {
            recordVocabularyMistake({
              correction: contentStep.incorrectFeedback,
              lesson,
              prompt: contentStep.cue,
              recordMistake,
              step: contentStep,
            })
          }
          submitAnswer({
            interactionId: `${contentStep.id}:answer`,
            answer: recalled ? 'recalled' : 'needs-review',
            isCorrect: recalled ? true : null,
            correctFeedback: {
              title: 'Recall confirmed',
              message: contentStep.correctFeedback,
            },
            infoFeedback: {
              title: 'Added to review',
              message: contentStep.incorrectFeedback,
            },
          })
        }}
        onSubmitChoice={submitChoice}
        step={contentStep}
      />
    </LessonFrame>
  )
}

function VocabularyStepView({
  disabled,
  lesson,
  onAssessRecall,
  onSubmitChoice,
  step,
}: {
  disabled: boolean
  lesson: VocabularyLessonDefinition
  onAssessRecall: (recalled: boolean) => void
  onSubmitChoice: (result: { selectedId: string; isCorrect: boolean }) => void
  step: VocabularyLessonStep
}) {
  switch (step.kind) {
    case 'context-discovery':
      return (
        <VocabularyContextDiscovery
          items={selectVocabulary(lesson, step.vocabularyIds)}
        />
      )
    case 'word-focus':
      return <VocabularyWordFocus items={selectVocabulary(lesson, step.vocabularyIds)} />
    case 'meaning-choice':
    case 'sentence-application':
      return (
        <VocabularyChoice
          disabled={disabled}
          onSubmit={onSubmitChoice}
          step={step}
        />
      )
    case 'listening-choice': {
      const item = findVocabulary(lesson, step.vocabularyId)
      return item ? (
        <VocabularyListeningChoice
          disabled={disabled}
          item={item}
          onSubmit={onSubmitChoice}
          step={step}
        />
      ) : null
    }
    case 'active-recall': {
      const item = findVocabulary(lesson, step.vocabularyId)
      return item ? (
        <VocabularyActiveRecall
          disabled={disabled}
          item={item}
          onAssess={({ recalled }) => onAssessRecall(recalled)}
          step={step}
        />
      ) : null
    }
    case 'vocabulary-summary':
      return <VocabularySummary step={step} />
  }
}

function selectVocabulary(
  lesson: VocabularyLessonDefinition,
  vocabularyIds: string[],
) {
  const vocabularyById = new Map(lesson.vocabulary.map((item) => [item.id, item]))
  return vocabularyIds.flatMap((vocabularyId) => {
    const item = vocabularyById.get(vocabularyId)
    return item ? [item] : []
  })
}

function findVocabulary(
  lesson: VocabularyLessonDefinition,
  vocabularyId: string,
) {
  return lesson.vocabulary.find((item) => item.id === vocabularyId) ?? null
}

function isChoiceStep(
  step: VocabularyLessonStep,
): step is Extract<
  VocabularyLessonStep,
  { kind: 'meaning-choice' | 'listening-choice' | 'sentence-application' }
> {
  return (
    step.kind === 'meaning-choice' ||
    step.kind === 'listening-choice' ||
    step.kind === 'sentence-application'
  )
}

function recordVocabularyMistake({
  correction,
  lesson,
  prompt,
  recordMistake,
  step,
}: {
  correction: string
  lesson: VocabularyLessonDefinition
  prompt: string
  recordMistake: ReturnType<typeof useLearningActions>['recordMistake']
  step: VocabularyLessonStep
}) {
  if (!lesson.nodeId) return
  recordMistake({
    correction,
    knowledgeIds: step.knowledgeIds,
    lessonId: lesson.id,
    nodeId: lesson.nodeId,
    prompt,
    reviewLabel: step.title,
  })
}
