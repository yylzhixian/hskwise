import { z } from 'zod'

import {
  type LessonDefinition,
  lessonDefinitionSchema,
} from '@/learning/runtime/model/lesson-definition'

const stableIdSchema = z.string().min(1).max(128)
const toneNumberSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
])

export const pinyinToneSchema = z
  .object({
    number: toneNumberSchema,
    name: z.string().min(1),
    shape: z.string().min(1),
    example: z.string().min(1),
    cue: z.string().min(1),
    contour: z.array(z.number().min(1).max(5)).min(2).max(3),
  })
  .strict()

const pinyinStepBase = {
  id: stableIdSchema,
  eyebrow: z.string().min(1).optional(),
  title: z.string().min(1),
  instruction: z.string().min(1),
  knowledgeIds: z.array(stableIdSchema).default([]),
}

const toneOverviewStepSchema = z
  .object({
    ...pinyinStepBase,
    kind: z.literal('tone-overview'),
  })
  .strict()

const pitchGuideStepSchema = z
  .object({
    ...pinyinStepBase,
    kind: z.literal('pitch-guide'),
    toneNumbers: z.array(toneNumberSchema).min(1),
  })
  .strict()

export const pinyinAudioAssetSchema = z
  .object({
    src: z.string().startsWith('/'),
    label: z.string().min(1),
    contentOrigin: z.enum([
      'original',
      'licensed',
      'generated-placeholder',
    ]),
    placeholder: z.boolean(),
    mustReplaceBeforePublish: z.boolean(),
  })
  .strict()
  .superRefine((asset, context) => {
    const isPlaceholder = asset.contentOrigin === 'generated-placeholder'

    if (
      asset.placeholder !== isPlaceholder ||
      asset.mustReplaceBeforePublish !== isPlaceholder
    ) {
      context.addIssue({
        code: 'custom',
        message:
          'Generated placeholder audio must be marked placeholder and replaced before publish.',
      })
    }
  })

const pronunciationPracticeStepSchema = z
  .object({
    ...pinyinStepBase,
    kind: z.literal('pronunciation-practice'),
    target: z.string().min(1),
    referenceAudio: pinyinAudioAssetSchema,
  })
  .strict()

const toneChoiceFields = {
  prompt: z.string().min(1),
  optionToneNumbers: z.array(toneNumberSchema).length(4),
  correctToneNumber: toneNumberSchema,
  correctFeedback: z.string().min(1),
  incorrectFeedback: z.string().min(1),
}

const toneChoiceStepSchema = z
  .object({
    ...pinyinStepBase,
    kind: z.literal('tone-choice'),
    ...toneChoiceFields,
  })
  .strict()

const toneListeningChoiceStepSchema = z
  .object({
    ...pinyinStepBase,
    kind: z.literal('tone-listening-choice'),
    ...toneChoiceFields,
    audio: pinyinAudioAssetSchema,
  })
  .strict()

export const pinyinLessonCheckQuestionSchema = z
  .object({
    id: stableIdSchema,
    ...toneChoiceFields,
    knowledgeIds: z.array(stableIdSchema).min(1),
  })
  .strict()

const lessonCheckStepSchema = z
  .object({
    ...pinyinStepBase,
    kind: z.literal('lesson-check'),
    questions: z.array(pinyinLessonCheckQuestionSchema).length(5),
  })
  .strict()

const lessonSummaryStepSchema = z
  .object({
    ...pinyinStepBase,
    kind: z.literal('lesson-summary'),
    takeaways: z.array(z.string().min(1)).min(1).max(4),
  })
  .strict()

export const pinyinLessonStepSchema = z.discriminatedUnion('kind', [
  toneOverviewStepSchema,
  pitchGuideStepSchema,
  pronunciationPracticeStepSchema,
  toneChoiceStepSchema,
  toneListeningChoiceStepSchema,
  lessonCheckStepSchema,
  lessonSummaryStepSchema,
])

export const pinyinLessonSchema = z
  .object({
    schemaVersion: z.literal('pinyinLesson/v1'),
    kind: z.literal('pinyin'),
    id: stableIdSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    routeId: stableIdSchema.optional(),
    nodeId: stableIdSchema.optional(),
    estimatedMinutes: z.number().int().positive(),
    tones: z.array(pinyinToneSchema).length(4),
    steps: z.array(pinyinLessonStepSchema).min(1),
  })
  .strict()
  .superRefine((lesson, context) => {
    const toneNumbers = new Set(lesson.tones.map((tone) => tone.number))
    if (toneNumbers.size !== 4) {
      context.addIssue({
        code: 'custom',
        message: 'A pinyin tone lesson must define tones 1 through 4 once each.',
        path: ['tones'],
      })
    }

    const stepIds = new Set<string>()
    lesson.steps.forEach((step, index) => {
      if (stepIds.has(step.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate pinyin lesson step id: ${step.id}`,
          path: ['steps', index, 'id'],
        })
      }
      stepIds.add(step.id)

      if (step.kind === 'pitch-guide') {
        const uniqueToneNumbers = new Set(step.toneNumbers)
        if (uniqueToneNumbers.size !== step.toneNumbers.length) {
          context.addIssue({
            code: 'custom',
            message: 'Pitch guide tone numbers must be unique.',
            path: ['steps', index, 'toneNumbers'],
          })
        }
      }

      if (step.kind === 'tone-choice' || step.kind === 'tone-listening-choice') {
        validateToneChoice(step, context, ['steps', index])
      }

      if (step.kind === 'lesson-check') {
        const questionIds = new Set<string>()
        step.questions.forEach((question, questionIndex) => {
          if (questionIds.has(question.id)) {
            context.addIssue({
              code: 'custom',
              message: `Duplicate lesson check question id: ${question.id}`,
              path: ['steps', index, 'questions', questionIndex, 'id'],
            })
          }
          questionIds.add(question.id)
          validateToneChoice(question, context, [
            'steps',
            index,
            'questions',
            questionIndex,
          ])
        })
      }
    })
  })

export type PinyinTone = z.infer<typeof pinyinToneSchema>
export type PinyinLessonCheckQuestion = z.infer<
  typeof pinyinLessonCheckQuestionSchema
>
export type PinyinLessonStep = z.infer<typeof pinyinLessonStepSchema>
export type PinyinLessonDefinition = z.infer<typeof pinyinLessonSchema>

export function definePinyinLesson(input: unknown): PinyinLessonDefinition {
  const lesson = pinyinLessonSchema.parse(input)
  createPinyinRuntimeDefinition(lesson)
  return lesson
}

export function createPinyinRuntimeDefinition(
  lesson: PinyinLessonDefinition,
): LessonDefinition {
  return lessonDefinitionSchema.parse({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    routeId: lesson.routeId,
    nodeId: lesson.nodeId,
    estimatedMinutes: lesson.estimatedMinutes,
    steps: lesson.steps.map((step) => ({
      id: step.id,
      eyebrow: step.eyebrow,
      title: step.title,
      instruction: step.instruction,
      knowledgeIds: step.knowledgeIds,
      completionRule:
        step.kind === 'pitch-guide'
          ? { kind: 'media' as const, mediaId: `${step.id}:pitch-guide` }
          : step.kind === 'pronunciation-practice'
            ? {
                kind: 'media' as const,
                mediaId: `${step.id}:pronunciation-practice`,
              }
          : step.kind === 'tone-choice' ||
              step.kind === 'tone-listening-choice' ||
              step.kind === 'lesson-check'
            ? {
                kind: 'interaction' as const,
                interactionId: `${step.id}:answer`,
                requireCorrect: true,
              }
            : { kind: 'continue' as const },
    })),
  })
}

function validateToneChoice(
  choice: {
    optionToneNumbers: Array<1 | 2 | 3 | 4>
    correctToneNumber: 1 | 2 | 3 | 4
  },
  context: z.RefinementCtx,
  path: Array<string | number>,
) {
  const uniqueOptions = new Set(choice.optionToneNumbers)
  if (uniqueOptions.size !== choice.optionToneNumbers.length) {
    context.addIssue({
      code: 'custom',
      message: 'Tone choice options must be unique.',
      path: [...path, 'optionToneNumbers'],
    })
  }
  if (!uniqueOptions.has(choice.correctToneNumber)) {
    context.addIssue({
      code: 'custom',
      message: 'The correct tone must be included in the options.',
      path: [...path, 'correctToneNumber'],
    })
  }
}
