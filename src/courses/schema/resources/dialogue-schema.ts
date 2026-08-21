import { z } from 'zod'

import {
  authorTextSchema,
  knowledgeIdsSchema,
  stableIdSchema,
} from '../base'

const dialogueRoleSchema = z
  .object({
    id: stableIdSchema,
    name: authorTextSchema,
    pinyin: authorTextSchema.optional(),
    cue: authorTextSchema.optional(),
  })
  .strict()

const dialogueTokenSchema = z
  .object({
    id: stableIdSchema,
    text: authorTextSchema,
    pinyin: authorTextSchema.optional(),
    meaning: authorTextSchema.optional(),
  })
  .strict()

const dialogueLineSchema = z
  .object({
    id: stableIdSchema,
    speakerId: stableIdSchema,
    tokens: z.array(dialogueTokenSchema).min(1),
    pinyin: authorTextSchema,
    translation: authorTextSchema,
    audioRef: stableIdSchema,
    knowledgeIds: knowledgeIdsSchema,
  })
  .strict()
  .superRefine((line, context) => {
    addDuplicateIdIssues(
      line.tokens,
      context,
      ['tokens'],
      'dialogue token',
    )
  })

export const dialogueResourceSchema = z
  .object({
    id: stableIdSchema,
    roles: z.array(dialogueRoleSchema).min(2),
    lines: z.array(dialogueLineSchema).min(2),
  })
  .strict()
  .superRefine((dialogue, context) => {
    addDuplicateIdIssues(dialogue.roles, context, ['roles'], 'dialogue role')
    addDuplicateIdIssues(dialogue.lines, context, ['lines'], 'dialogue line')
  })

function addDuplicateIdIssues(
  items: Array<{ id: string }>,
  context: z.RefinementCtx,
  path: PropertyKey[],
  label: string,
) {
  const ids = new Set<string>()
  items.forEach((item, index) => {
    if (ids.has(item.id)) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate ${label} id: ${item.id}`,
        path: [...path, index, 'id'],
      })
    }
    ids.add(item.id)
  })
}

export type DialogueResource = z.infer<typeof dialogueResourceSchema>
