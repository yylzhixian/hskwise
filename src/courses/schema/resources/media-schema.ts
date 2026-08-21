import { z } from 'zod'

import { authorTextSchema, stableIdSchema } from '../base'

export const mediaOriginSchema = z.enum([
  'original',
  'licensed',
  'generated-placeholder',
  'restricted-reference',
])

export const mediaRightsSchema = z
  .object({
    origin: mediaOriginSchema,
    publishable: z.boolean(),
    mustReplaceBeforePublish: z.boolean(),
    licenseId: stableIdSchema.optional(),
    attribution: authorTextSchema.optional(),
  })
  .strict()
  .superRefine((rights, context) => {
    if (
      rights.origin === 'generated-placeholder' &&
      (rights.publishable || !rights.mustReplaceBeforePublish)
    ) {
      context.addIssue({
        code: 'custom',
        message:
          'Generated placeholders must be non-publishable and marked for replacement.',
        path: ['origin'],
      })
    }
    if (rights.origin === 'restricted-reference' && rights.publishable) {
      context.addIssue({
        code: 'custom',
        message: 'Restricted reference media cannot be publishable.',
        path: ['publishable'],
      })
    }
  })

export const mediaResourceSchema = z
  .object({
    id: stableIdSchema,
    kind: z.enum(['audio', 'image', 'video']),
    src: z.string().trim().min(1).max(500),
    label: authorTextSchema,
    alt: authorTextSchema.optional(),
    rights: mediaRightsSchema,
  })
  .strict()

export type MediaResource = z.infer<typeof mediaResourceSchema>
