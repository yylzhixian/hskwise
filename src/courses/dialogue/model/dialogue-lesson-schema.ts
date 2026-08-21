import { z } from 'zod'

import { lessonAudioAssetSchema } from '@/lib/media/lesson-audio-asset'
import {
  type LessonDefinition,
  lessonDefinitionSchema,
} from '@/learning/runtime/model/lesson-definition'

// Frozen v1 contract: new course activities belong in lesson/v2 after CP0.
const stableIdSchema = z.string().min(1).max(128)

const dialogueRoleSchema = z
  .object({
    id: stableIdSchema,
    name: z.string().min(1),
    pinyin: z.string().min(1),
    cue: z.string().min(1),
  })
  .strict()

const dialogueTokenSchema = z
  .object({
    id: stableIdSchema,
    text: z.string().min(1),
    pinyin: z.string().min(1).optional(),
    meaning: z.string().min(1).optional(),
  })
  .strict()

export const dialogueLineSchema = z
  .object({
    id: stableIdSchema,
    speakerId: stableIdSchema,
    tokens: z.array(dialogueTokenSchema).min(1),
    pinyin: z.string().min(1),
    translation: z.string().min(1),
    audio: lessonAudioAssetSchema,
    knowledgeIds: z.array(stableIdSchema).min(1),
  })
  .strict()

const dialogueStepBase = {
  id: stableIdSchema,
  eyebrow: z.string().min(1).optional(),
  title: z.string().min(1),
  instruction: z.string().min(1),
  knowledgeIds: z.array(stableIdSchema).default([]),
}

const sceneIntroStepSchema = z
  .object({
    ...dialogueStepBase,
    kind: z.literal('scene-intro'),
    sceneLabel: z.string().min(1),
    setting: z.string().min(1),
    goal: z.string().min(1),
  })
  .strict()

const dialogueExploreStepSchema = z
  .object({
    ...dialogueStepBase,
    kind: z.literal('dialogue-explore'),
    lineIds: z.array(stableIdSchema).min(2),
  })
  .strict()

const comprehensionOptionSchema = z
  .object({
    id: stableIdSchema,
    label: z.string().min(1),
    isCorrect: z.boolean(),
  })
  .strict()

const comprehensionChoiceStepSchema = z
  .object({
    ...dialogueStepBase,
    kind: z.literal('comprehension-choice'),
    prompt: z.string().min(1),
    options: z.array(comprehensionOptionSchema).min(2).max(4),
    correctFeedback: z.string().min(1),
    incorrectFeedback: z.string().min(1),
  })
  .strict()

const lineOrderStepSchema = z
  .object({
    ...dialogueStepBase,
    kind: z.literal('line-order'),
    prompt: z.string().min(1),
    lineIds: z.array(stableIdSchema).min(3).max(6),
    startingOrder: z.array(stableIdSchema).min(3).max(6),
    correctFeedback: z.string().min(1),
    incorrectFeedback: z.string().min(1),
  })
  .strict()

const rolePracticeStepSchema = z
  .object({
    ...dialogueStepBase,
    kind: z.literal('role-practice'),
    roleIds: z.array(stableIdSchema).length(2),
    lineIds: z.array(stableIdSchema).min(2),
  })
  .strict()

const dialogueSummaryStepSchema = z
  .object({
    ...dialogueStepBase,
    kind: z.literal('dialogue-summary'),
    takeaways: z.array(z.string().min(1)).min(1).max(4),
  })
  .strict()

export const dialogueLessonStepSchema = z.discriminatedUnion('kind', [
  sceneIntroStepSchema,
  dialogueExploreStepSchema,
  comprehensionChoiceStepSchema,
  lineOrderStepSchema,
  rolePracticeStepSchema,
  dialogueSummaryStepSchema,
])

export const dialogueLessonSchema = z
  .object({
    schemaVersion: z.literal('dialogueLesson/v1'),
    kind: z.literal('dialogue'),
    id: stableIdSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    routeId: stableIdSchema.optional(),
    nodeId: stableIdSchema.optional(),
    estimatedMinutes: z.number().int().positive(),
    roles: z.array(dialogueRoleSchema).length(2),
    lines: z.array(dialogueLineSchema).min(3).max(8),
    steps: z.array(dialogueLessonStepSchema).min(1),
  })
  .strict()
  .superRefine((lesson, context) => {
    const roleIds = new Set<string>()
    lesson.roles.forEach((role, index) => {
      if (roleIds.has(role.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate dialogue role id: ${role.id}`,
          path: ['roles', index, 'id'],
        })
      }
      roleIds.add(role.id)
    })

    const lineIds = new Set<string>()
    lesson.lines.forEach((line, index) => {
      if (lineIds.has(line.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate dialogue line id: ${line.id}`,
          path: ['lines', index, 'id'],
        })
      }
      lineIds.add(line.id)
      if (!roleIds.has(line.speakerId)) {
        context.addIssue({
          code: 'custom',
          message: `Unknown dialogue speaker: ${line.speakerId}`,
          path: ['lines', index, 'speakerId'],
        })
      }
    })

    const stepIds = new Set<string>()
    lesson.steps.forEach((step, index) => {
      if (stepIds.has(step.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate dialogue lesson step id: ${step.id}`,
          path: ['steps', index, 'id'],
        })
      }
      stepIds.add(step.id)

      if (step.kind === 'comprehension-choice') {
        const optionIds = new Set(step.options.map((option) => option.id))
        if (optionIds.size !== step.options.length) {
          context.addIssue({
            code: 'custom',
            message: 'Dialogue comprehension option ids must be unique.',
            path: ['steps', index, 'options'],
          })
        }
        if (step.options.filter((option) => option.isCorrect).length !== 1) {
          context.addIssue({
            code: 'custom',
            message: 'Dialogue comprehension must have exactly one answer.',
            path: ['steps', index, 'options'],
          })
        }
      }

      if (step.kind === 'line-order') {
        const orderedIds = new Set(step.lineIds)
        const startingIds = new Set(step.startingOrder)
        if (
          orderedIds.size !== step.lineIds.length ||
          startingIds.size !== step.startingOrder.length ||
          step.lineIds.length !== step.startingOrder.length ||
          step.lineIds.some((lineId) => !startingIds.has(lineId))
        ) {
          context.addIssue({
            code: 'custom',
            message: 'Line order must contain the same unique lines twice.',
            path: ['steps', index, 'startingOrder'],
          })
        }
      }

      if (
        step.kind === 'dialogue-explore' ||
        step.kind === 'line-order' ||
        step.kind === 'role-practice'
      ) {
        step.lineIds.forEach((lineId) => {
          if (!lineIds.has(lineId)) {
            context.addIssue({
              code: 'custom',
              message: `Unknown dialogue line: ${lineId}`,
              path: ['steps', index, 'lineIds'],
            })
          }
        })
      }

      if (step.kind === 'role-practice') {
        step.roleIds.forEach((roleId) => {
          if (!roleIds.has(roleId)) {
            context.addIssue({
              code: 'custom',
              message: `Unknown dialogue role: ${roleId}`,
              path: ['steps', index, 'roleIds'],
            })
          }
        })
      }
    })
  })

export type DialogueLine = z.infer<typeof dialogueLineSchema>
export type DialogueLessonStep = z.infer<typeof dialogueLessonStepSchema>
export type DialogueLessonDefinition = z.infer<typeof dialogueLessonSchema>
export type DialogueRole = DialogueLessonDefinition['roles'][number]

export function defineDialogueLesson(input: unknown): DialogueLessonDefinition {
  const lesson = dialogueLessonSchema.parse(input)
  createDialogueRuntimeDefinition(lesson)
  return lesson
}

export function createDialogueRuntimeDefinition(
  lesson: DialogueLessonDefinition,
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
        step.kind === 'dialogue-explore'
          ? { kind: 'media' as const, mediaId: `${step.id}:explore` }
          : step.kind === 'role-practice'
            ? { kind: 'media' as const, mediaId: `${step.id}:role-practice` }
            : step.kind === 'comprehension-choice' ||
                step.kind === 'line-order'
              ? {
                  kind: 'interaction' as const,
                  interactionId: `${step.id}:answer`,
                  requireCorrect: true,
                }
              : { kind: 'continue' as const },
    })),
  })
}
