import { z } from 'zod'

export const stableIdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(
    /^[a-z0-9][a-z0-9._:-]*$/,
    'Stable ids must use lowercase ASCII letters, numbers, dots, colons, underscores, or hyphens.',
  )

export const authorTextSchema = z.string().trim().min(1).max(2000)
export const titleSchema = z.string().trim().min(1).max(160)
export const instructionSchema = z.string().trim().min(1).max(600)

export const knowledgeIdsSchema = z.array(stableIdSchema).min(1)

export const lessonResourceRefSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('media'), id: stableIdSchema }).strict(),
  z.object({ kind: z.literal('dialogue'), id: stableIdSchema }).strict(),
  z.object({ kind: z.literal('lexeme'), id: stableIdSchema }).strict(),
])

export type LessonResourceRef = z.infer<typeof lessonResourceRefSchema>
