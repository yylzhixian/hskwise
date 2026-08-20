import { z } from 'zod'

import {
  type LessonDefinition,
  lessonDefinitionSchema,
} from '@/learning/runtime/model/lesson-definition'
import { lessonAudioAssetSchema } from '@/lib/media/lesson-audio-asset'

const stableIdSchema = z.string().min(1).max(128)

const vocabularySourceSchema = z
  .object({
    lessonId: stableIdSchema,
    lineId: stableIdSchema,
    tokenId: stableIdSchema,
    contextText: z.string().min(1),
    contextPinyin: z.string().min(1),
    contextTranslation: z.string().min(1),
    contextAudio: lessonAudioAssetSchema,
  })
  .strict()

export const vocabularyItemSchema = z
  .object({
    id: stableIdSchema,
    text: z.string().min(1),
    pinyin: z.string().min(1),
    meaning: z.string().min(1),
    usageNote: z.string().min(1),
    knowledgeId: stableIdSchema,
    audio: lessonAudioAssetSchema,
    source: vocabularySourceSchema,
  })
  .strict()

const vocabularyChoiceOptionSchema = z
  .object({
    id: stableIdSchema,
    label: z.string().min(1),
    supportingText: z.string().min(1).optional(),
    isCorrect: z.boolean(),
  })
  .strict()

const vocabularyStepBase = {
  id: stableIdSchema,
  eyebrow: z.string().min(1).optional(),
  title: z.string().min(1),
  instruction: z.string().min(1),
  knowledgeIds: z.array(stableIdSchema).default([]),
}

const contextDiscoveryStepSchema = z
  .object({
    ...vocabularyStepBase,
    kind: z.literal('context-discovery'),
    vocabularyIds: z.array(stableIdSchema).min(2),
  })
  .strict()

const wordFocusStepSchema = z
  .object({
    ...vocabularyStepBase,
    kind: z.literal('word-focus'),
    vocabularyIds: z.array(stableIdSchema).min(3),
  })
  .strict()

const meaningChoiceStepSchema = z
  .object({
    ...vocabularyStepBase,
    kind: z.literal('meaning-choice'),
    prompt: z.string().min(1),
    options: z.array(vocabularyChoiceOptionSchema).min(2).max(4),
    correctFeedback: z.string().min(1),
    incorrectFeedback: z.string().min(1),
  })
  .strict()

const listeningChoiceStepSchema = z
  .object({
    ...vocabularyStepBase,
    kind: z.literal('listening-choice'),
    vocabularyId: stableIdSchema,
    prompt: z.string().min(1),
    options: z.array(vocabularyChoiceOptionSchema).min(2).max(4),
    correctFeedback: z.string().min(1),
    incorrectFeedback: z.string().min(1),
  })
  .strict()

const activeRecallStepSchema = z
  .object({
    ...vocabularyStepBase,
    kind: z.literal('active-recall'),
    vocabularyId: stableIdSchema,
    cue: z.string().min(1),
    revealLabel: z.string().min(1),
    correctFeedback: z.string().min(1),
    incorrectFeedback: z.string().min(1),
  })
  .strict()

const sentenceApplicationStepSchema = z
  .object({
    ...vocabularyStepBase,
    kind: z.literal('sentence-application'),
    prompt: z.string().min(1),
    sentenceBefore: z.string(),
    sentenceAfter: z.string(),
    translation: z.string().min(1),
    options: z.array(vocabularyChoiceOptionSchema).min(2).max(4),
    correctFeedback: z.string().min(1),
    incorrectFeedback: z.string().min(1),
  })
  .strict()

const vocabularySummaryStepSchema = z
  .object({
    ...vocabularyStepBase,
    kind: z.literal('vocabulary-summary'),
    takeaways: z.array(z.string().min(1)).min(1),
  })
  .strict()

export const vocabularyLessonStepSchema = z.discriminatedUnion('kind', [
  contextDiscoveryStepSchema,
  wordFocusStepSchema,
  meaningChoiceStepSchema,
  listeningChoiceStepSchema,
  activeRecallStepSchema,
  sentenceApplicationStepSchema,
  vocabularySummaryStepSchema,
])

export const vocabularyLessonSchema = z
  .object({
    schemaVersion: z.literal('vocabularyLesson/v1'),
    kind: z.literal('vocabulary'),
    id: stableIdSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    routeId: stableIdSchema.optional(),
    nodeId: stableIdSchema.optional(),
    estimatedMinutes: z.number().int().positive(),
    vocabulary: z.array(vocabularyItemSchema).min(3),
    steps: z.array(vocabularyLessonStepSchema).min(1),
  })
  .strict()
  .superRefine((lesson, context) => {
    const vocabularyIds = new Set<string>()
    const vocabularyById = new Map<string, VocabularyItem>()
    const knowledgeIds = new Set<string>()
    lesson.vocabulary.forEach((item, index) => {
      if (vocabularyIds.has(item.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate vocabulary item id: ${item.id}`,
          path: ['vocabulary', index, 'id'],
        })
      }
      vocabularyIds.add(item.id)
      vocabularyById.set(item.id, item)

      if (knowledgeIds.has(item.knowledgeId)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate vocabulary knowledge id: ${item.knowledgeId}`,
          path: ['vocabulary', index, 'knowledgeId'],
        })
      }
      knowledgeIds.add(item.knowledgeId)
    })

    const stepIds = new Set<string>()
    lesson.steps.forEach((step, index) => {
      if (stepIds.has(step.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate vocabulary lesson step id: ${step.id}`,
          path: ['steps', index, 'id'],
        })
      }
      stepIds.add(step.id)

      if (step.kind === 'context-discovery' || step.kind === 'word-focus') {
        if (new Set(step.vocabularyIds).size !== step.vocabularyIds.length) {
          context.addIssue({
            code: 'custom',
            message: 'Vocabulary step item references must be unique.',
            path: ['steps', index, 'vocabularyIds'],
          })
        }
        step.vocabularyIds.forEach(vocabularyId => {
          if (!vocabularyIds.has(vocabularyId)) {
            context.addIssue({
              code: 'custom',
              message: `Unknown vocabulary item: ${vocabularyId}`,
              path: ['steps', index, 'vocabularyIds'],
            })
          }
        })

        if (step.kind === 'context-discovery') {
          const sourceLines = new Set(
            step.vocabularyIds.flatMap(vocabularyId => {
              const item = vocabularyById.get(vocabularyId)
              return item
                ? [`${item.source.lessonId}:${item.source.lineId}`]
                : []
            })
          )
          if (sourceLines.size > 1) {
            context.addIssue({
              code: 'custom',
              message:
                'Context discovery vocabulary must come from one dialogue line.',
              path: ['steps', index, 'vocabularyIds'],
            })
          }
        }
      }

      if (step.kind === 'listening-choice' || step.kind === 'active-recall') {
        if (!vocabularyIds.has(step.vocabularyId)) {
          context.addIssue({
            code: 'custom',
            message: `Unknown vocabulary item: ${step.vocabularyId}`,
            path: ['steps', index, 'vocabularyId'],
          })
        }
      }

      if (
        step.kind === 'meaning-choice' ||
        step.kind === 'listening-choice' ||
        step.kind === 'sentence-application'
      ) {
        validateChoice(step.options, context, ['steps', index, 'options'])
      }
    })
  })

export type VocabularyItem = z.infer<typeof vocabularyItemSchema>
export type VocabularyLessonStep = z.infer<typeof vocabularyLessonStepSchema>
export type VocabularyLessonDefinition = z.infer<typeof vocabularyLessonSchema>

export function defineVocabularyLesson(
  input: unknown
): VocabularyLessonDefinition {
  const lesson = vocabularyLessonSchema.parse(input)
  createVocabularyRuntimeDefinition(lesson)
  return lesson
}

export function createVocabularyRuntimeDefinition(
  lesson: VocabularyLessonDefinition
): LessonDefinition {
  return lessonDefinitionSchema.parse({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    routeId: lesson.routeId,
    nodeId: lesson.nodeId,
    estimatedMinutes: lesson.estimatedMinutes,
    steps: lesson.steps.map(step => ({
      id: step.id,
      eyebrow: step.eyebrow,
      title: step.title,
      instruction: step.instruction,
      knowledgeIds: step.knowledgeIds,
      completionRule:
        step.kind === 'meaning-choice' ||
        step.kind === 'listening-choice' ||
        step.kind === 'sentence-application'
          ? {
              kind: 'interaction' as const,
              interactionId: `${step.id}:answer`,
              requireCorrect: true,
            }
          : step.kind === 'active-recall'
            ? {
                kind: 'interaction' as const,
                interactionId: `${step.id}:answer`,
                requireCorrect: false,
              }
            : { kind: 'continue' as const },
    })),
  })
}

function validateChoice(
  options: Array<{ id: string; isCorrect: boolean }>,
  context: z.RefinementCtx,
  path: PropertyKey[]
) {
  if (new Set(options.map(option => option.id)).size !== options.length) {
    context.addIssue({
      code: 'custom',
      message: 'Vocabulary choice option ids must be unique.',
      path,
    })
  }
  if (options.filter(option => option.isCorrect).length !== 1) {
    context.addIssue({
      code: 'custom',
      message: 'Vocabulary choice must have exactly one answer.',
      path,
    })
  }
}
