import type { SceneData } from '../scene-schema/scene-schema'
import { SceneDataSchema } from '../scene-schema/scene-schema'
import {
  CourseStudioProjectSchema,
  type CourseSceneKind,
  type CourseStudioProject,
  type CourseStudioSceneRecord,
} from '../scene-schema/project-schema'
import {
  sampleDialogueScene,
  samplePinyinToneScene,
  sampleVocabularyScene,
} from '../scene-schema/samples'

export const courseStudioStorageKey = 'hskwise.course-studio.project.v1'

export type SceneTemplateId = 'pinyin-tone' | 'dialogue-reading' | 'vocabulary-practice'

export type SceneTemplate = {
  id: SceneTemplateId
  title: string
  description: string
  sceneKind: CourseSceneKind
  sceneData: SceneData
  tags: string[]
  estimatedSeconds: number
}

export const sceneTemplates: SceneTemplate[] = [
  {
    id: 'pinyin-tone',
    title: 'Pinyin tone lesson',
    description: 'Mascot guidance, tone chart, audio cue, and a checkpoint question.',
    sceneKind: 'pronunciation',
    sceneData: samplePinyinToneScene,
    tags: ['pronunciation', 'tones', 'guided'],
    estimatedSeconds: 90,
  },
  {
    id: 'dialogue-reading',
    title: 'Dialogue close reading',
    description: 'A short conversation with line audio, teaching notes, and speaking practice.',
    sceneKind: 'dialogue',
    sceneData: sampleDialogueScene,
    tags: ['dialogue', 'speaking', 'shadowing'],
    estimatedSeconds: 150,
  },
  {
    id: 'vocabulary-practice',
    title: 'Vocabulary practice',
    description: 'Vocabulary cards followed by a lightweight matching interaction.',
    sceneKind: 'vocabulary',
    sceneData: sampleVocabularyScene,
    tags: ['vocabulary', 'matching'],
    estimatedSeconds: 120,
  },
]

export type StudioIssue = {
  id: string
  severity: 'error' | 'warning'
  title: string
  detail: string
}

export function createSceneFromTemplate(
  project: CourseStudioProject,
  sectionId: string,
  templateId: SceneTemplateId,
): CourseStudioSceneRecord {
  const template = sceneTemplates.find((item) => item.id === templateId) ?? sceneTemplates[0]
  const sectionScenes = project.scenes.filter((scene) => scene.sectionId === sectionId)
  const nextSortOrder = Math.max(0, ...sectionScenes.map((scene) => scene.sortOrder)) + 10
  const id = createStableId('scene')

  return {
    id,
    sectionId,
    title: { [project.defaultLocale]: `${template.title} ${sectionScenes.length + 1}` },
    sceneKind: template.sceneKind,
    status: 'draft',
    contentOrigin: 'original',
    sortOrder: nextSortOrder,
    estimatedSeconds: template.estimatedSeconds,
    tags: [...template.tags],
    sceneData: structuredClone(template.sceneData),
  }
}

export function duplicateScene(
  project: CourseStudioProject,
  source: CourseStudioSceneRecord,
): CourseStudioSceneRecord {
  const locale = project.defaultLocale
  const sourceTitle = readText(source.title, locale)
  const siblings = project.scenes.filter((scene) => scene.sectionId === source.sectionId)

  return {
    ...structuredClone(source),
    id: createStableId('scene'),
    title: { ...source.title, [locale]: `${sourceTitle} copy` },
    sortOrder: Math.max(0, ...siblings.map((scene) => scene.sortOrder)) + 10,
    status: 'draft',
  }
}

export function parseStoredProject(value: string) {
  return CourseStudioProjectSchema.safeParse(JSON.parse(value))
}

export function parseImportedScene(value: string) {
  return SceneDataSchema.safeParse(JSON.parse(value))
}

export function getSceneIssues(
  project: CourseStudioProject,
  scene: CourseStudioSceneRecord,
): StudioIssue[] {
  const issues: StudioIssue[] = []
  const sceneResult = SceneDataSchema.safeParse(scene.sceneData)

  if (!sceneResult.success) {
    sceneResult.error.issues.slice(0, 5).forEach((issue, index) => {
      issues.push({
        id: `schema_${index}`,
        severity: 'error',
        title: 'Scene schema error',
        detail: `${issue.path.join('.') || 'scene'}: ${issue.message}`,
      })
    })
  }

  const refs = project.mockKnowledgeRefs.filter((ref) => ref.sceneId === scene.id)
  if (refs.length === 0) {
    issues.push({
      id: 'knowledge_missing',
      severity: 'warning',
      title: 'Knowledge binding missing',
      detail: 'Bind at least one vocabulary, pinyin, grammar, or skill reference.',
    })
  }

  if (scene.contentOrigin === 'referenceOnly') {
    issues.push({
      id: 'origin_reference_only',
      severity: 'error',
      title: 'Reference-only content',
      detail: 'Reference-only material cannot move to review or publishing.',
    })
  } else if (scene.contentOrigin === 'referenceRewrite') {
    issues.push({
      id: 'origin_review',
      severity: 'warning',
      title: 'Rewrite needs review',
      detail: 'Confirm authorship and licensing before changing the content origin.',
    })
  }

  const referencedAssetIds = getReferencedAssetIds(scene.sceneData)
  referencedAssetIds.forEach((assetId) => {
    const asset = project.mockAssets.find((item) => item.id === assetId)
    if (!asset || asset.status === 'missing') {
      issues.push({
        id: `asset_${assetId}`,
        severity: 'error',
        title: 'Asset unavailable',
        detail: `${assetId} is missing from the mock asset library.`,
      })
    } else if (asset.status === 'placeholder') {
      issues.push({
        id: `asset_placeholder_${assetId}`,
        severity: 'warning',
        title: 'Placeholder asset',
        detail: `${assetId} still needs a production-ready file or URL.`,
      })
    }
  })

  if (scene.sceneData.playback.mode === 'auto') {
    if (scene.sceneData.timeline.length === 0) {
      issues.push({
        id: 'auto_timeline_missing',
        severity: 'error',
        title: 'Auto playback has no timeline',
        detail: 'Add at least one timeline action before using auto playback.',
      })
    }
    if (!scene.sceneData.playback.allowPause || !scene.sceneData.playback.allowReplay) {
      issues.push({
        id: 'auto_controls_missing',
        severity: 'warning',
        title: 'Learner controls limited',
        detail: 'Auto scenes should allow both pause and replay.',
      })
    }
  }

  return issues
}

export function readText(value: Record<string, string>, locale: string) {
  return value[locale] ?? value.en ?? value.zhHans ?? Object.values(value)[0] ?? ''
}

export function createStableId(prefix: string) {
  const randomPart = globalThis.crypto?.randomUUID?.().replaceAll('-', '').slice(0, 16)
  return `${prefix}_${randomPart ?? Date.now().toString(36)}`
}

function getReferencedAssetIds(scene: SceneData) {
  const ids = new Set<string>()

  for (const element of scene.elements) {
    if ('assetId' in element && element.assetId) ids.add(element.assetId)
    if ('audioAssetId' in element && element.audioAssetId) ids.add(element.audioAssetId)
  }

  for (const action of scene.actions) {
    if ('assetId' in action && action.assetId) ids.add(action.assetId)
  }

  for (const interaction of scene.interactions) {
    if ('audioAssetId' in interaction && interaction.audioAssetId) {
      ids.add(interaction.audioAssetId)
    }
    if (interaction.kind === 'multipleChoice') {
      interaction.options.forEach((option) => {
        if (option.mediaAssetId) ids.add(option.mediaAssetId)
      })
    }
    if (interaction.kind === 'matching') {
      interaction.pairs.forEach((pair) => {
        if (pair.sourceAssetId) ids.add(pair.sourceAssetId)
        if (pair.targetAssetId) ids.add(pair.targetAssetId)
      })
    }
  }

  return ids
}
