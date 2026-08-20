import { z } from 'zod'

export const lessonAudioAssetSchema = z
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

export type LessonAudioAsset = z.infer<typeof lessonAudioAssetSchema>
