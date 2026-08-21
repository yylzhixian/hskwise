import { z } from 'zod'

import { authorTextSchema, stableIdSchema } from '../base'

export const lexemeSourceRefSchema = z
  .object({
    lessonId: stableIdSchema,
    dialogueId: stableIdSchema,
    lineId: stableIdSchema,
    tokenId: stableIdSchema,
  })
  .strict()

export const lexemeResourceSchema = z
  .object({
    id: stableIdSchema,
    text: authorTextSchema,
    pinyin: authorTextSchema,
    meaning: authorTextSchema,
    partOfSpeech: authorTextSchema.optional(),
    usageNote: authorTextSchema.optional(),
    knowledgeId: stableIdSchema,
    audioRef: stableIdSchema,
    sourceRef: lexemeSourceRefSchema.optional(),
  })
  .strict()

export type LexemeResource = z.infer<typeof lexemeResourceSchema>
