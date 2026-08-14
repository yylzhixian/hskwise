import { z } from 'zod'

import { SceneDataSchema } from './scene-schema'
import {
  AssetKindSchema,
  ContentOriginSchema,
  courseStudioSchemaVersion,
  JsonRecordSchema,
  LocalizedTextSchema,
  StableIdSchema,
  StandardLevelSchema,
  StandardVersionSchema,
  TargetLocatorSchema,
} from './shared'

export const courseSceneKindValues = [
  'explain',
  'dialogue',
  'reading',
  'vocabulary',
  'grammar',
  'pronunciation',
  'character',
  'exercise',
  'activity',
  'media',
  'scripted',
  'interactive',
  'assessment',
] as const

export const CourseSceneKindSchema = z.enum(courseSceneKindValues)

export const CourseStudioStatusSchema = z.enum([
  'draft',
  'review',
  'published',
  'archived',
])

export const KnowledgeRefTypeSchema = z.enum([
  'lexicalItem',
  'lexicalForm',
  'standardLevel',
  'pinyinConcept',
  'grammarPattern',
  'sourceSpan',
  'tag',
])

export const KnowledgeRefRoleSchema = z.enum([
  'teaches',
  'practices',
  'mentions',
  'prerequisite',
])

export const ProjectCourseSchema = z
  .object({
    id: StableIdSchema,
    slug: z.string().min(1).max(160),
    title: LocalizedTextSchema,
    description: LocalizedTextSchema.optional(),
    primaryStandardVersion: StandardVersionSchema,
    primaryStandardLevel: StandardLevelSchema,
    metadata: JsonRecordSchema.optional(),
  })
  .strict()

export const ProjectUnitSchema = z
  .object({
    id: StableIdSchema,
    courseId: StableIdSchema,
    title: LocalizedTextSchema,
    subtitle: LocalizedTextSchema.optional(),
    unitNo: z.number().int().positive(),
    sortOrder: z.number().int().nonnegative(),
    metadata: JsonRecordSchema.optional(),
  })
  .strict()

export const ProjectSectionSchema = z
  .object({
    id: StableIdSchema,
    unitId: StableIdSchema,
    title: LocalizedTextSchema,
    sectionKind: z
      .enum([
        'objectives',
        'text',
        'vocabulary',
        'grammar',
        'pronunciation',
        'characters',
        'exercise',
        'activity',
        'summary',
        'culture',
      ])
      .default('text'),
    sortOrder: z.number().int().nonnegative(),
    metadata: JsonRecordSchema.optional(),
  })
  .strict()

export const CourseStudioSceneRecordSchema = z
  .object({
    id: StableIdSchema,
    sectionId: StableIdSchema,
    title: LocalizedTextSchema,
    sceneKind: CourseSceneKindSchema,
    status: CourseStudioStatusSchema.default('draft'),
    contentOrigin: ContentOriginSchema.default('original'),
    sortOrder: z.number().int().nonnegative(),
    estimatedSeconds: z.number().int().positive().optional(),
    audioUrl: z.string().url().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    tags: z.array(z.string().min(1).max(80)).default([]),
    sceneData: SceneDataSchema,
    metadata: JsonRecordSchema.optional(),
  })
  .strict()

export const MockAssetSchema = z
  .object({
    id: StableIdSchema,
    kind: AssetKindSchema,
    label: LocalizedTextSchema,
    url: z.string().url().nullable().optional(),
    status: z.enum(['available', 'missing', 'placeholder']).default('placeholder'),
    durationMs: z.number().int().positive().nullable().optional(),
    metadata: JsonRecordSchema.optional(),
  })
  .strict()

export const MockKnowledgeRefSchema = z
  .object({
    id: StableIdSchema,
    sceneId: StableIdSchema,
    refType: KnowledgeRefTypeSchema,
    refId: z.string().min(1).max(160),
    refRole: KnowledgeRefRoleSchema,
    label: LocalizedTextSchema.optional(),
    targetLocator: TargetLocatorSchema.optional(),
    metadata: JsonRecordSchema.optional(),
  })
  .strict()

export const CourseStudioProjectSchema = z
  .object({
    version: z.literal(courseStudioSchemaVersion),
    id: StableIdSchema,
    title: LocalizedTextSchema,
    defaultLocale: z.string().min(2).max(16).default('en'),
    course: ProjectCourseSchema,
    units: z.array(ProjectUnitSchema).min(1),
    sections: z.array(ProjectSectionSchema).min(1),
    scenes: z.array(CourseStudioSceneRecordSchema).min(1),
    mockAssets: z.array(MockAssetSchema).default([]),
    mockKnowledgeRefs: z.array(MockKnowledgeRefSchema).default([]),
    settings: z
      .object({
        activeSceneId: StableIdSchema.optional(),
        previewMode: z.enum(['editor', 'learner']).default('editor'),
      })
      .strict()
      .default({ previewMode: 'editor' }),
    metadata: JsonRecordSchema.optional(),
  })
  .strict()
  .superRefine((project, ctx) => {
    const courseId = project.course.id
    const unitIds = new Set(project.units.map((unit) => unit.id))
    const sectionIds = new Set(project.sections.map((section) => section.id))
    const sceneIds = new Set(project.scenes.map((scene) => scene.id))
    const assetIds = new Set(project.mockAssets.map((asset) => asset.id))

    addDuplicateIssues(ctx, project.units, 'units')
    addDuplicateIssues(ctx, project.sections, 'sections')
    addDuplicateIssues(ctx, project.scenes, 'scenes')
    addDuplicateIssues(ctx, project.mockAssets, 'mockAssets')
    addDuplicateIssues(ctx, project.mockKnowledgeRefs, 'mockKnowledgeRefs')

    project.units.forEach((unit, index) => {
      if (unit.courseId !== courseId) {
        addRefIssue(ctx, ['units', index, 'courseId'], unit.courseId, 'course')
      }
    })

    project.sections.forEach((section, index) => {
      if (!unitIds.has(section.unitId)) {
        addRefIssue(ctx, ['sections', index, 'unitId'], section.unitId, 'unit')
      }
    })

    project.scenes.forEach((scene, index) => {
      if (!sectionIds.has(scene.sectionId)) {
        addRefIssue(ctx, ['scenes', index, 'sectionId'], scene.sectionId, 'section')
      }

      scene.sceneData.elements.forEach((element, elementIndex) => {
        if ('assetId' in element && element.assetId && !assetIds.has(element.assetId)) {
          addRefIssue(
            ctx,
            ['scenes', index, 'sceneData', 'elements', elementIndex, 'assetId'],
            element.assetId,
            'mock asset',
          )
        }

        if (
          'audioAssetId' in element &&
          element.audioAssetId &&
          !assetIds.has(element.audioAssetId)
        ) {
          addRefIssue(
            ctx,
            ['scenes', index, 'sceneData', 'elements', elementIndex, 'audioAssetId'],
            element.audioAssetId,
            'mock asset',
          )
        }
      })

      scene.sceneData.actions.forEach((action, actionIndex) => {
        if ('assetId' in action && action.assetId && !assetIds.has(action.assetId)) {
          addRefIssue(
            ctx,
            ['scenes', index, 'sceneData', 'actions', actionIndex, 'assetId'],
            action.assetId,
            'mock asset',
          )
        }
      })
    })

    project.mockKnowledgeRefs.forEach((ref, index) => {
      if (!sceneIds.has(ref.sceneId)) {
        addRefIssue(ctx, ['mockKnowledgeRefs', index, 'sceneId'], ref.sceneId, 'scene')
      }
    })

    if (project.settings.activeSceneId && !sceneIds.has(project.settings.activeSceneId)) {
      addRefIssue(
        ctx,
        ['settings', 'activeSceneId'],
        project.settings.activeSceneId,
        'scene',
      )
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

export type CourseSceneKind = z.infer<typeof CourseSceneKindSchema>
export type CourseStudioStatus = z.infer<typeof CourseStudioStatusSchema>
export type CourseStudioSceneRecord = z.infer<typeof CourseStudioSceneRecordSchema>
export type CourseStudioProject = z.infer<typeof CourseStudioProjectSchema>
export type CourseStudioProjectInput = z.input<typeof CourseStudioProjectSchema>
export type MockAsset = z.infer<typeof MockAssetSchema>
export type MockKnowledgeRef = z.infer<typeof MockKnowledgeRefSchema>
