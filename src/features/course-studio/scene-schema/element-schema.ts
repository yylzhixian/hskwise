import { z } from 'zod'

import {
  AssetKindSchema,
  ElementPositionSchema,
  JsonRecordSchema,
  LocalizedTextSchema,
  StableIdSchema,
  TargetLocatorSchema,
} from './shared'

export const elementKindValues = [
  'text',
  'callout',
  'image',
  'audio',
  'video',
  'mascot',
  'panel',
  'group',
  'dialogue',
  'vocabulary',
  'quiz',
  'button',
  'hotspot',
  'pinyinChart',
] as const

export const ElementKindSchema = z.enum(elementKindValues)

const ElementBaseFields = {
  id: StableIdSchema,
  name: z.string().min(1).max(120).optional(),
  hidden: z.boolean().default(false),
  locked: z.boolean().default(false),
  position: ElementPositionSchema.optional(),
  opacity: z.number().min(0).max(1).optional(),
  metadata: JsonRecordSchema.optional(),
}

export const TextStyleSchema = z
  .object({
    size: z.enum(['sm', 'md', 'lg', 'xl', 'display']).optional(),
    weight: z.enum(['regular', 'medium', 'semibold', 'bold']).optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    color: z.string().min(1).max(64).optional(),
  })
  .strict()

export const TextElementSchema = z
  .object({
    ...ElementBaseFields,
    kind: z.literal('text'),
    content: LocalizedTextSchema,
    style: TextStyleSchema.optional(),
  })
  .strict()

export const CalloutElementSchema = z
  .object({
    ...ElementBaseFields,
    kind: z.literal('callout'),
    content: LocalizedTextSchema,
    tone: z
      .enum(['info', 'tip', 'warning', 'success', 'culture', 'mistake'])
      .default('info'),
    style: TextStyleSchema.optional(),
  })
  .strict()

const MediaElementFields = {
  assetId: StableIdSchema.optional(),
  url: z.string().url().optional(),
  alt: LocalizedTextSchema.optional(),
  fit: z.enum(['contain', 'cover', 'fill']).default('contain'),
}

export const ImageElementSchema = z
  .object({
    ...ElementBaseFields,
    ...MediaElementFields,
    kind: z.literal('image'),
  })
  .strict()

export const AudioElementSchema = z
  .object({
    ...ElementBaseFields,
    kind: z.literal('audio'),
    assetId: StableIdSchema.optional(),
    url: z.string().url().optional(),
    transcript: LocalizedTextSchema.optional(),
    controls: z.boolean().default(false),
  })
  .strict()

export const VideoElementSchema = z
  .object({
    ...ElementBaseFields,
    ...MediaElementFields,
    kind: z.literal('video'),
    posterAssetId: StableIdSchema.optional(),
    transcriptAssetId: StableIdSchema.optional(),
    controls: z.boolean().default(true),
  })
  .strict()

export const MascotElementSchema = z
  .object({
    ...ElementBaseFields,
    kind: z.literal('mascot'),
    role: z.enum(['teacher', 'coach', 'partner', 'host']).default('teacher'),
    characterKey: z.string().min(1).max(64).default('panda'),
    expression: z
      .enum(['neutral', 'happy', 'thinking', 'encouraging', 'surprised'])
      .default('happy'),
    pose: z.string().min(1).max(64).optional(),
    speechBubble: LocalizedTextSchema.optional(),
  })
  .strict()

export const PanelElementSchema = z
  .object({
    ...ElementBaseFields,
    kind: z.literal('panel'),
    title: LocalizedTextSchema.optional(),
    tone: z.enum(['plain', 'soft', 'accent', 'quiz', 'dialogue']).default('plain'),
    childElementIds: z.array(StableIdSchema).default([]),
  })
  .strict()

export const GroupElementSchema = z
  .object({
    ...ElementBaseFields,
    kind: z.literal('group'),
    childElementIds: z.array(StableIdSchema).min(1),
  })
  .strict()

export const DialogueLineSchema = z
  .object({
    id: StableIdSchema,
    speakerKey: z.string().min(1).max(64),
    speakerName: z.string().min(1).max(80).optional(),
    hanzi: z.string().min(1),
    pinyin: z.string().min(1).optional(),
    translation: z.string().min(1).optional(),
    audioAssetId: StableIdSchema.nullable().optional(),
    metadata: JsonRecordSchema.optional(),
  })
  .strict()

export const DialogueElementSchema = z
  .object({
    ...ElementBaseFields,
    kind: z.literal('dialogue'),
    scene: LocalizedTextSchema.optional(),
    lines: z.array(DialogueLineSchema).min(1),
    display: z
      .object({
        showHanzi: z.boolean().default(true),
        showPinyin: z.boolean().default(true),
        showTranslation: z.boolean().default(true),
      })
      .strict()
      .optional(),
  })
  .strict()

export const VocabularyItemSchema = z
  .object({
    id: StableIdSchema,
    lexicalItemId: StableIdSchema.optional(),
    lexicalFormId: StableIdSchema.optional(),
    simplified: z.string().min(1),
    displayPinyin: z.string().min(1).optional(),
    displayMeaning: z.string().min(1).optional(),
    isProperNoun: z.boolean().default(false),
    audioAssetId: StableIdSchema.nullable().optional(),
    metadata: JsonRecordSchema.optional(),
  })
  .strict()

export const UnmatchedTermSchema = z
  .object({
    simplified: z.string().min(1),
    pinyin: z.string().min(1).optional(),
    meaning: z.string().min(1).optional(),
    reason: z.string().min(1).max(160).optional(),
  })
  .strict()

export const VocabularyElementSchema = z
  .object({
    ...ElementBaseFields,
    kind: z.literal('vocabulary'),
    title: LocalizedTextSchema.optional(),
    items: z.array(VocabularyItemSchema).min(1),
    unmatchedTerms: z.array(UnmatchedTermSchema).default([]),
  })
  .strict()

export const QuizElementSchema = z
  .object({
    ...ElementBaseFields,
    kind: z.literal('quiz'),
    interactionId: StableIdSchema,
    title: LocalizedTextSchema.optional(),
    layout: z.enum(['card', 'inline', 'modal']).default('card'),
  })
  .strict()

export const ButtonElementSchema = z
  .object({
    ...ElementBaseFields,
    kind: z.literal('button'),
    label: LocalizedTextSchema,
    actionIds: z.array(StableIdSchema).default([]),
    variant: z.enum(['primary', 'secondary', 'ghost']).default('primary'),
  })
  .strict()

export const HotspotElementSchema = z
  .object({
    ...ElementBaseFields,
    kind: z.literal('hotspot'),
    label: LocalizedTextSchema.optional(),
    shape: z.enum(['rect', 'circle', 'polygon']).default('rect'),
    targetLocator: TargetLocatorSchema.optional(),
    actionIds: z.array(StableIdSchema).default([]),
  })
  .strict()

export const PinyinChartElementSchema = z
  .object({
    ...ElementBaseFields,
    kind: z.literal('pinyinChart'),
    chartKind: z.enum(['tones', 'initials', 'finals', 'syllable']).default('tones'),
    highlightKeys: z.array(z.string().min(1).max(64)).default([]),
    audioAssetId: StableIdSchema.nullable().optional(),
  })
  .strict()

export const SceneElementSchema = z.discriminatedUnion('kind', [
  TextElementSchema,
  CalloutElementSchema,
  ImageElementSchema,
  AudioElementSchema,
  VideoElementSchema,
  MascotElementSchema,
  PanelElementSchema,
  GroupElementSchema,
  DialogueElementSchema,
  VocabularyElementSchema,
  QuizElementSchema,
  ButtonElementSchema,
  HotspotElementSchema,
  PinyinChartElementSchema,
])

export const SceneElementRegistrySchema = z.array(
  z.object({
    kind: ElementKindSchema,
    assetKind: AssetKindSchema.optional(),
    label: LocalizedTextSchema,
    isMvp: z.boolean().default(true),
  }),
)

export type ElementKind = z.infer<typeof ElementKindSchema>
export type SceneElement = z.infer<typeof SceneElementSchema>
export type DialogueLine = z.infer<typeof DialogueLineSchema>
export type VocabularyItem = z.infer<typeof VocabularyItemSchema>
