import { z } from 'zod'

export const courseStudioSchemaVersion = 1

export const StableIdSchema = z
  .string()
  .min(1)
  .max(96)
  .regex(/^[a-z][a-z0-9_-]*$/, {
    message: 'Use a stable lowercase id such as scene_hsk3_l1_intro.',
  })

export const LanguageCodeSchema = z
  .string()
  .min(2)
  .max(16)
  .regex(/^[A-Za-z][A-Za-z0-9-]*$/)

export const LocalizedTextSchema = z
  .record(LanguageCodeSchema, z.string())
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Localized text must contain at least one language.',
  })

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
)

export const JsonRecordSchema = z.record(z.string(), JsonValueSchema)

export const NonNegativeIntSchema = z.number().int().nonnegative()

export const UnitNumberSchema = z.number().min(0).max(1)

export const RectSchema = z
  .object({
    x: UnitNumberSchema.optional(),
    y: UnitNumberSchema.optional(),
    width: UnitNumberSchema.optional(),
    height: UnitNumberSchema.optional(),
  })
  .strict()

export const ElementPositionSchema = RectSchema.extend({
  preset: z
    .enum([
      'top',
      'center',
      'bottom',
      'left',
      'right',
      'left-top',
      'right-top',
      'left-bottom',
      'right-bottom',
      'full',
    ])
    .optional(),
  zIndex: z.number().int().optional(),
}).strict()

export const ContentOriginSchema = z.enum([
  'original',
  'licensed',
  'openLicensed',
  'referenceRewrite',
  'referenceOnly',
])

export const StandardVersionSchema = z.union([
  z.literal('hsk2'),
  z.literal('hsk3'),
  z.string().regex(/^hsk[0-9]+$/),
])

export const StandardLevelSchema = z
  .string()
  .min(1)
  .max(16)
  .regex(/^[0-9]+(-[0-9]+)?$/)

export const AssetKindSchema = z.enum([
  'audio',
  'image',
  'video',
  'subtitle',
  'animation',
  'document',
  'mascot',
])

export const TargetLocatorSchema = z
  .object({
    elementId: StableIdSchema.optional(),
    interactionId: StableIdSchema.optional(),
    lineId: StableIdSchema.optional(),
    sentenceId: StableIdSchema.optional(),
    paragraphId: StableIdSchema.optional(),
    questionId: StableIdSchema.optional(),
    optionId: StableIdSchema.optional(),
    actionId: StableIdSchema.optional(),
    timelineId: StableIdSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'target_locator must point to at least one stable id.',
  })

export const RegistryItemSchema = z
  .object({
    kind: z.string().min(1),
    label: LocalizedTextSchema,
    description: LocalizedTextSchema.optional(),
    isMvp: z.boolean().default(true),
    metadata: JsonRecordSchema.optional(),
  })
  .strict()

export type StableId = z.infer<typeof StableIdSchema>
export type LocalizedText = z.infer<typeof LocalizedTextSchema>
export type ContentOrigin = z.infer<typeof ContentOriginSchema>
export type StandardVersion = z.infer<typeof StandardVersionSchema>
export type TargetLocator = z.infer<typeof TargetLocatorSchema>
