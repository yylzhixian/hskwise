import { z } from 'zod'

import { dialogueResourceSchema } from './dialogue-schema'
import { lexemeResourceSchema } from './lexeme-schema'
import { mediaResourceSchema } from './media-schema'

export const lessonResourcesSchema = z
  .object({
    media: z.array(mediaResourceSchema),
    dialogues: z.array(dialogueResourceSchema),
    lexemes: z.array(lexemeResourceSchema),
  })
  .strict()
  .superRefine((resources, context) => {
    addDuplicateResourceIssues(resources.media, context, ['media'], 'media')
    addDuplicateResourceIssues(
      resources.dialogues,
      context,
      ['dialogues'],
      'dialogue',
    )
    addDuplicateResourceIssues(resources.lexemes, context, ['lexemes'], 'lexeme')
  })

function addDuplicateResourceIssues(
  resources: Array<{ id: string }>,
  context: z.RefinementCtx,
  path: PropertyKey[],
  label: string,
) {
  const ids = new Set<string>()
  resources.forEach((resource, index) => {
    if (ids.has(resource.id)) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate ${label} resource id: ${resource.id}`,
        path: [...path, index, 'id'],
      })
    }
    ids.add(resource.id)
  })
}

export type LessonResources = z.infer<typeof lessonResourcesSchema>
