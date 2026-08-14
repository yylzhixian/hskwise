import { z } from 'zod'

import {
  JsonRecordSchema,
  LocalizedTextSchema,
  NonNegativeIntSchema,
  StableIdSchema,
  TargetLocatorSchema,
  UnitNumberSchema,
} from './shared'

export const interactionKindValues = [
  'multipleChoice',
  'matching',
  'ordering',
  'cloze',
  'dictation',
  'shortAnswer',
  'speechRepeat',
  'rolePlay',
  'hotspot',
  'dragDrop',
  'swipe',
  'boundedChat',
] as const

export const InteractionKindSchema = z.enum(interactionKindValues)

const FeedbackSchema = z
  .object({
    correct: LocalizedTextSchema.optional(),
    incorrect: LocalizedTextSchema.optional(),
    retry: LocalizedTextSchema.optional(),
  })
  .strict()

const InteractionBaseFields = {
  id: StableIdSchema,
  required: z.boolean().default(false),
  prompt: LocalizedTextSchema.optional(),
  targetElementId: StableIdSchema.optional(),
  targetLocator: TargetLocatorSchema.optional(),
  feedback: FeedbackSchema.optional(),
  metadata: JsonRecordSchema.optional(),
}

export const ChoiceOptionSchema = z
  .object({
    id: StableIdSchema,
    text: LocalizedTextSchema,
    isCorrect: z.boolean().default(false),
    mediaAssetId: StableIdSchema.optional(),
    explanation: LocalizedTextSchema.optional(),
  })
  .strict()

export const MultipleChoiceInteractionSchema = z
  .object({
    ...InteractionBaseFields,
    kind: z.literal('multipleChoice'),
    allowMultiple: z.boolean().default(false),
    options: z.array(ChoiceOptionSchema).min(2),
  })
  .strict()

export const MatchingPairSchema = z
  .object({
    id: StableIdSchema,
    source: LocalizedTextSchema,
    target: LocalizedTextSchema,
    sourceAssetId: StableIdSchema.optional(),
    targetAssetId: StableIdSchema.optional(),
  })
  .strict()

export const MatchingInteractionSchema = z
  .object({
    ...InteractionBaseFields,
    kind: z.literal('matching'),
    pairs: z.array(MatchingPairSchema).min(2),
  })
  .strict()

export const OrderingItemSchema = z
  .object({
    id: StableIdSchema,
    text: LocalizedTextSchema,
    correctOrder: z.number().int().positive(),
  })
  .strict()

export const OrderingInteractionSchema = z
  .object({
    ...InteractionBaseFields,
    kind: z.literal('ordering'),
    items: z.array(OrderingItemSchema).min(2),
  })
  .strict()

export const ClozeBlankSchema = z
  .object({
    id: StableIdSchema,
    acceptedAnswers: z.array(z.string().min(1)).min(1),
    hint: LocalizedTextSchema.optional(),
    targetLocator: TargetLocatorSchema.optional(),
  })
  .strict()

export const ClozeInteractionSchema = z
  .object({
    ...InteractionBaseFields,
    kind: z.literal('cloze'),
    text: LocalizedTextSchema,
    blanks: z.array(ClozeBlankSchema).min(1),
  })
  .strict()

export const DictationInteractionSchema = z
  .object({
    ...InteractionBaseFields,
    kind: z.literal('dictation'),
    audioAssetId: StableIdSchema.optional(),
    expectedText: z.string().min(1),
    acceptedAnswers: z.array(z.string().min(1)).default([]),
    showPinyinAfterSubmit: z.boolean().default(true),
  })
  .strict()

export const ShortAnswerInteractionSchema = z
  .object({
    ...InteractionBaseFields,
    kind: z.literal('shortAnswer'),
    expectedAnswerKind: z.enum(['open', 'sample', 'exact']).default('open'),
    sampleAnswers: z.array(LocalizedTextSchema).default([]),
    minLength: NonNegativeIntSchema.optional(),
  })
  .strict()

export const SpeechRepeatInteractionSchema = z
  .object({
    ...InteractionBaseFields,
    kind: z.literal('speechRepeat'),
    text: z.string().min(1),
    pinyin: z.string().min(1).optional(),
    audioAssetId: StableIdSchema.optional(),
    recordingRequired: z.boolean().default(true),
    scoringMode: z.enum(['none', 'manual', 'placeholder', 'automatic']).default('placeholder'),
  })
  .strict()

export const RolePlayTurnSchema = z
  .object({
    id: StableIdSchema,
    speakerKey: z.string().min(1).max(64),
    lineId: StableIdSchema.optional(),
    text: z.string().min(1),
    learnerShouldSpeak: z.boolean().default(false),
  })
  .strict()

export const RolePlayInteractionSchema = z
  .object({
    ...InteractionBaseFields,
    kind: z.literal('rolePlay'),
    learnerSpeakerKey: z.string().min(1).max(64),
    allowAiPartner: z.boolean().default(false),
    turns: z.array(RolePlayTurnSchema).min(1),
  })
  .strict()

export const HotspotTargetSchema = z
  .object({
    id: StableIdSchema,
    label: LocalizedTextSchema.optional(),
    x: UnitNumberSchema,
    y: UnitNumberSchema,
    radius: UnitNumberSchema.optional(),
    isCorrect: z.boolean().default(false),
    actionIds: z.array(StableIdSchema).default([]),
  })
  .strict()

export const HotspotInteractionSchema = z
  .object({
    ...InteractionBaseFields,
    kind: z.literal('hotspot'),
    imageElementId: StableIdSchema.optional(),
    hotspots: z.array(HotspotTargetSchema).min(1),
  })
  .strict()

export const DraggableItemSchema = z
  .object({
    id: StableIdSchema,
    text: LocalizedTextSchema,
    correctZoneId: StableIdSchema,
  })
  .strict()

export const DropZoneSchema = z
  .object({
    id: StableIdSchema,
    label: LocalizedTextSchema,
  })
  .strict()

export const DragDropInteractionSchema = z
  .object({
    ...InteractionBaseFields,
    kind: z.literal('dragDrop'),
    items: z.array(DraggableItemSchema).min(1),
    zones: z.array(DropZoneSchema).min(1),
  })
  .strict()

export const SwipeCardSchema = z
  .object({
    id: StableIdSchema,
    front: LocalizedTextSchema,
    back: LocalizedTextSchema.optional(),
    correctDirection: z.enum(['left', 'right', 'up', 'down']).optional(),
  })
  .strict()

export const SwipeInteractionSchema = z
  .object({
    ...InteractionBaseFields,
    kind: z.literal('swipe'),
    cards: z.array(SwipeCardSchema).min(1),
  })
  .strict()

export const BoundedChatInteractionSchema = z
  .object({
    ...InteractionBaseFields,
    kind: z.literal('boundedChat'),
    topic: LocalizedTextSchema,
    task: LocalizedTextSchema,
    allowedIntents: z.array(z.string().min(1).max(80)).min(1),
    maxTurns: z.number().int().positive().max(20).default(6),
    safetyNotes: LocalizedTextSchema.optional(),
  })
  .strict()

export const SceneInteractionSchema = z.discriminatedUnion('kind', [
  MultipleChoiceInteractionSchema,
  MatchingInteractionSchema,
  OrderingInteractionSchema,
  ClozeInteractionSchema,
  DictationInteractionSchema,
  ShortAnswerInteractionSchema,
  SpeechRepeatInteractionSchema,
  RolePlayInteractionSchema,
  HotspotInteractionSchema,
  DragDropInteractionSchema,
  SwipeInteractionSchema,
  BoundedChatInteractionSchema,
])

export type InteractionKind = z.infer<typeof InteractionKindSchema>
export type SceneInteraction = z.infer<typeof SceneInteractionSchema>
