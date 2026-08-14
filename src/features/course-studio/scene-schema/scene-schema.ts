import { z } from 'zod'

import { SceneActionSchema } from './action-schema'
import { SceneElementSchema } from './element-schema'
import { SceneInteractionSchema } from './interaction-schema'
import { SceneEventSchema, TimelineStepSchema } from './timeline-schema'
import {
  courseStudioSchemaVersion,
  JsonRecordSchema,
  StableIdSchema,
  TargetLocatorSchema,
} from './shared'

export const ScenePlaybackModeSchema = z.enum(['manual', 'auto', 'guided'])

export const CanvasBackgroundSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('color'),
      value: z.string().min(1).max(64),
    })
    .strict(),
  z
    .object({
      kind: z.literal('image'),
      assetId: StableIdSchema.optional(),
      url: z.string().url().optional(),
      fit: z.enum(['contain', 'cover', 'fill']).default('cover'),
    })
    .strict(),
  z
    .object({
      kind: z.literal('gradient'),
      from: z.string().min(1).max(64),
      to: z.string().min(1).max(64),
      angle: z.number().min(0).max(360).default(180),
    })
    .strict(),
])

export const SceneCanvasSchema = z
  .object({
    aspectRatio: z.enum(['16:9', '4:3', '1:1', '9:16', 'responsive']).default('16:9'),
    safeArea: z.enum(['responsive', 'none']).default('responsive'),
    background: CanvasBackgroundSchema.default({ kind: 'color', value: '#ffffff' }),
  })
  .strict()

export const ScenePlaybackSchema = z
  .object({
    mode: ScenePlaybackModeSchema.default('guided'),
    autoStart: z.boolean().default(false),
    allowPause: z.boolean().default(true),
    allowReplay: z.boolean().default(true),
  })
  .strict()

export const CompletionRuleSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('manual'),
    })
    .strict(),
  z
    .object({
      kind: z.literal('viewed'),
      minTimelineMs: z.number().int().nonnegative().optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('allRequiredInteractions'),
    })
    .strict(),
  z
    .object({
      kind: z.literal('specificInteractions'),
      interactionIds: z.array(StableIdSchema).min(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal('minCorrect'),
      interactionIds: z.array(StableIdSchema).min(1),
      minCorrect: z.number().int().positive(),
    })
    .strict(),
])

export const SceneDataSchema = z
  .object({
    version: z.literal(courseStudioSchemaVersion),
    canvas: SceneCanvasSchema,
    playback: ScenePlaybackSchema.default({
      mode: 'guided',
      autoStart: false,
      allowPause: true,
      allowReplay: true,
    }),
    state: JsonRecordSchema.default({}),
    elements: z.array(SceneElementSchema).min(1),
    timeline: z.array(TimelineStepSchema).default([]),
    events: z.array(SceneEventSchema).default([]),
    actions: z.array(SceneActionSchema).default([]),
    interactions: z.array(SceneInteractionSchema).default([]),
    completionRule: CompletionRuleSchema.default({ kind: 'manual' }),
    metadata: JsonRecordSchema.optional(),
  })
  .strict()
  .superRefine((scene, ctx) => {
    const elementIds = new Set(scene.elements.map((element) => element.id))
    const actionIds = new Set(scene.actions.map((action) => action.id))
    const interactionIds = new Set(
      scene.interactions.map((interaction) => interaction.id),
    )
    const timelineIds = new Set(scene.timeline.map((step) => step.id))
    const dialogueLineIds = new Set(
      scene.elements.flatMap((element) =>
        element.kind === 'dialogue' ? element.lines.map((line) => line.id) : [],
      ),
    )
    const interactionOptionIds = new Set(
      scene.interactions.flatMap((interaction) => {
        if (interaction.kind === 'multipleChoice') {
          return interaction.options.map((option) => option.id)
        }

        if (interaction.kind === 'hotspot') {
          return interaction.hotspots.map((hotspot) => hotspot.id)
        }

        if (interaction.kind === 'dragDrop') {
          return [
            ...interaction.items.map((item) => item.id),
            ...interaction.zones.map((zone) => zone.id),
          ]
        }

        return []
      }),
    )

    addDuplicateIssues(ctx, scene.elements, 'elements')
    addDuplicateIssues(ctx, scene.actions, 'actions')
    addDuplicateIssues(ctx, scene.interactions, 'interactions')
    addDuplicateIssues(ctx, scene.timeline, 'timeline')
    addDuplicateIssues(ctx, scene.events, 'events')

    scene.timeline.forEach((step, index) => {
      if (!actionIds.has(step.actionId)) {
        addRefIssue(ctx, ['timeline', index, 'actionId'], step.actionId, 'action')
      }
    })

    scene.events.forEach((event, index) => {
      event.actions.forEach((actionId, actionIndex) => {
        if (!actionIds.has(actionId)) {
          addRefIssue(
            ctx,
            ['events', index, 'actions', actionIndex],
            actionId,
            'action',
          )
        }
      })

      if (event.targetId && event.on.startsWith('interaction.')) {
        if (!interactionIds.has(event.targetId)) {
          addRefIssue(ctx, ['events', index, 'targetId'], event.targetId, 'interaction')
        }
      } else if (event.targetId && !elementIds.has(event.targetId)) {
        addRefIssue(ctx, ['events', index, 'targetId'], event.targetId, 'element')
      }
    })

    scene.actions.forEach((action, index) => {
      if ('targetId' in action && action.targetId && !elementIds.has(action.targetId)) {
        addRefIssue(ctx, ['actions', index, 'targetId'], action.targetId, 'element')
      }

      if (action.kind === 'pauseUntilInteraction') {
        if (!interactionIds.has(action.interactionId)) {
          addRefIssue(
            ctx,
            ['actions', index, 'interactionId'],
            action.interactionId,
            'interaction',
          )
        }
      }
    })

    scene.elements.forEach((element, index) => {
      if ('childElementIds' in element) {
        element.childElementIds.forEach((childElementId, childIndex) => {
          if (!elementIds.has(childElementId)) {
            addRefIssue(
              ctx,
              ['elements', index, 'childElementIds', childIndex],
              childElementId,
              'element',
            )
          }
        })
      }

      if (element.kind === 'quiz' && !interactionIds.has(element.interactionId)) {
        addRefIssue(
          ctx,
          ['elements', index, 'interactionId'],
          element.interactionId,
          'interaction',
        )
      }

      if ('actionIds' in element) {
        element.actionIds.forEach((actionId, actionIndex) => {
          if (!actionIds.has(actionId)) {
            addRefIssue(
              ctx,
              ['elements', index, 'actionIds', actionIndex],
              actionId,
              'action',
            )
          }
        })
      }

      if ('targetLocator' in element && element.targetLocator) {
        validateTargetLocator(ctx, ['elements', index, 'targetLocator'], element.targetLocator, {
          elementIds,
          interactionIds,
          actionIds,
          timelineIds,
          dialogueLineIds,
          interactionOptionIds,
        })
      }
    })

    scene.interactions.forEach((interaction, index) => {
      if (
        interaction.targetElementId &&
        !elementIds.has(interaction.targetElementId)
      ) {
        addRefIssue(
          ctx,
          ['interactions', index, 'targetElementId'],
          interaction.targetElementId,
          'element',
        )
      }

      if (interaction.targetLocator) {
        validateTargetLocator(
          ctx,
          ['interactions', index, 'targetLocator'],
          interaction.targetLocator,
          {
            elementIds,
            interactionIds,
            actionIds,
            timelineIds,
            dialogueLineIds,
            interactionOptionIds,
          },
        )
      }

      if (interaction.kind === 'hotspot') {
        interaction.hotspots.forEach((hotspot, hotspotIndex) => {
          hotspot.actionIds.forEach((actionId, actionIndex) => {
            if (!actionIds.has(actionId)) {
              addRefIssue(
                ctx,
                [
                  'interactions',
                  index,
                  'hotspots',
                  hotspotIndex,
                  'actionIds',
                  actionIndex,
                ],
                actionId,
                'action',
              )
            }
          })
        })
      }
    })

    if ('interactionIds' in scene.completionRule) {
      scene.completionRule.interactionIds.forEach((interactionId, index) => {
        if (!interactionIds.has(interactionId)) {
          addRefIssue(
            ctx,
            ['completionRule', 'interactionIds', index],
            interactionId,
            'interaction',
          )
        }
      })
    }
  })

function addDuplicateIssues(
  ctx: z.RefinementCtx,
  items: Array<{ id: string }>,
  pathName: string,
) {
  const seen = new Set<string>()

  items.forEach((item, index) => {
    if (seen.has(item.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [pathName, index, 'id'],
        message: `Duplicate id: ${item.id}.`,
      })
      return
    }

    seen.add(item.id)
  })
}

function addRefIssue(
  ctx: z.RefinementCtx,
  path: Array<string | number>,
  id: string,
  expectedKind: string,
) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path,
    message: `Unknown ${expectedKind} id: ${id}.`,
  })
}

function validateTargetLocator(
  ctx: z.RefinementCtx,
  path: Array<string | number>,
  locator: z.infer<typeof TargetLocatorSchema>,
  refs: {
    elementIds: Set<string>
    interactionIds: Set<string>
    actionIds: Set<string>
    timelineIds: Set<string>
    dialogueLineIds: Set<string>
    interactionOptionIds: Set<string>
  },
) {
  if (locator.elementId && !refs.elementIds.has(locator.elementId)) {
    addRefIssue(ctx, [...path, 'elementId'], locator.elementId, 'element')
  }

  if (locator.interactionId && !refs.interactionIds.has(locator.interactionId)) {
    addRefIssue(ctx, [...path, 'interactionId'], locator.interactionId, 'interaction')
  }

  if (locator.actionId && !refs.actionIds.has(locator.actionId)) {
    addRefIssue(ctx, [...path, 'actionId'], locator.actionId, 'action')
  }

  if (locator.timelineId && !refs.timelineIds.has(locator.timelineId)) {
    addRefIssue(ctx, [...path, 'timelineId'], locator.timelineId, 'timeline step')
  }

  if (locator.lineId && !refs.dialogueLineIds.has(locator.lineId)) {
    addRefIssue(ctx, [...path, 'lineId'], locator.lineId, 'dialogue line')
  }

  if (locator.optionId && !refs.interactionOptionIds.has(locator.optionId)) {
    addRefIssue(ctx, [...path, 'optionId'], locator.optionId, 'interaction option')
  }
}

export type ScenePlaybackMode = z.infer<typeof ScenePlaybackModeSchema>
export type SceneCanvas = z.infer<typeof SceneCanvasSchema>
export type SceneData = z.infer<typeof SceneDataSchema>
export type SceneDataInput = z.input<typeof SceneDataSchema>
