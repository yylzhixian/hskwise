import type {
  CourseStudioProject,
  CourseStudioSceneRecord,
  MockAsset,
  MockKnowledgeRef,
} from '../scene-schema/project-schema'
import { SceneDataSchema, type SceneData } from '../scene-schema/scene-schema'
import { samplePinyinToneScene } from '../scene-schema/samples'

type PinyinLessonStep = {
  key: string
  title: { en: string; zhHans: string }
  explanation: { en: string; zhHans: string }
  speech: { en: string; zhHans: string }
  prompt: { en: string; zhHans: string }
  conceptId: string
  conceptLabel: { en: string; zhHans: string }
  highlightKeys: string[]
  correctTone: 1 | 2 | 3 | 4
  distractorTone: 1 | 2 | 3 | 4
  audioAssetId: string
  sceneKind: CourseStudioSceneRecord['sceneKind']
  estimatedSeconds: number
}

export const pinyinLessonBlueprint: PinyinLessonStep[] = [
  {
    key: 'overview',
    title: { en: 'Meet the four tones', zhHans: '认识四声' },
    explanation: {
      en: 'Mandarin uses four tone shapes to distinguish meaning.',
      zhHans: '普通话用四种声调曲线区别意义。',
    },
    speech: {
      en: 'First, notice how each tone follows a different path.',
      zhHans: '先观察每个声调不同的声音路线。',
    },
    prompt: { en: 'Which tone stays high and level?', zhHans: '哪一个声调保持高而平？' },
    conceptId: 'four_tones_overview',
    conceptLabel: { en: 'Four-tone overview', zhHans: '四声总览' },
    highlightKeys: ['tone_1', 'tone_2', 'tone_3', 'tone_4'],
    correctTone: 1,
    distractorTone: 4,
    audioAssetId: 'asset_tone_1_audio',
    sceneKind: 'explain',
    estimatedSeconds: 70,
  },
  {
    key: 'tone_1',
    title: { en: 'First tone: high and level', zhHans: '第一声：高而平' },
    explanation: { en: 'Hold the pitch high and steady.', zhHans: '音高保持在高位，不升也不降。' },
    speech: { en: 'Keep the sound level from beginning to end.', zhHans: '从开始到结束都保持平稳。' },
    prompt: { en: 'Which tone is high and level?', zhHans: '哪一个声调又高又平？' },
    conceptId: 'tone_1',
    conceptLabel: { en: 'First tone', zhHans: '第一声' },
    highlightKeys: ['tone_1'],
    correctTone: 1,
    distractorTone: 4,
    audioAssetId: 'asset_tone_1_audio',
    sceneKind: 'pronunciation',
    estimatedSeconds: 90,
  },
  {
    key: 'tone_2',
    title: { en: 'Second tone: rising', zhHans: '第二声：向上升' },
    explanation: { en: 'Start in the middle and rise clearly.', zhHans: '从中音开始，清楚地向上升。' },
    speech: { en: 'Let the pitch rise as if you are asking a short question.', zhHans: '像简短提问一样让音高上升。' },
    prompt: { en: 'Which tone rises from mid to high?', zhHans: '哪一个声调从中音升到高音？' },
    conceptId: 'tone_2',
    conceptLabel: { en: 'Second tone', zhHans: '第二声' },
    highlightKeys: ['tone_2'],
    correctTone: 2,
    distractorTone: 3,
    audioAssetId: 'asset_tone_2_audio',
    sceneKind: 'pronunciation',
    estimatedSeconds: 90,
  },
  {
    key: 'tone_3',
    title: { en: 'Third tone: low dip', zhHans: '第三声：低降转折' },
    explanation: { en: 'Drop low, then turn upward when the context allows.', zhHans: '先降到低处，再根据语境转折上扬。' },
    speech: { en: 'The low part is more important than a dramatic rise.', zhHans: '低音部分比夸张上升更重要。' },
    prompt: { en: 'Which tone contains a low dip?', zhHans: '哪一个声调有低降转折？' },
    conceptId: 'tone_3',
    conceptLabel: { en: 'Third tone', zhHans: '第三声' },
    highlightKeys: ['tone_3'],
    correctTone: 3,
    distractorTone: 2,
    audioAssetId: 'asset_tone_3_audio',
    sceneKind: 'pronunciation',
    estimatedSeconds: 100,
  },
  {
    key: 'tone_4',
    title: { en: 'Fourth tone: sharp fall', zhHans: '第四声：快速下降' },
    explanation: { en: 'Begin high and fall quickly with a clean finish.', zhHans: '从高音开始，快速下降并利落收尾。' },
    speech: { en: 'Make the fall short and decisive.', zhHans: '下降要短促、明确。' },
    prompt: { en: 'Which tone falls sharply?', zhHans: '哪一个声调快速下降？' },
    conceptId: 'tone_4',
    conceptLabel: { en: 'Fourth tone', zhHans: '第四声' },
    highlightKeys: ['tone_4'],
    correctTone: 4,
    distractorTone: 1,
    audioAssetId: 'asset_tone_4_audio',
    sceneKind: 'pronunciation',
    estimatedSeconds: 90,
  },
  {
    key: 'checkpoint',
    title: { en: 'Four-tone checkpoint', zhHans: '四声检查点' },
    explanation: { en: 'Compare the complete set before moving on.', zhHans: '继续学习前，再比较一次完整的四声。' },
    speech: { en: 'Listen, compare the shape, and choose the fourth tone.', zhHans: '听声音、比较曲线，然后选出第四声。' },
    prompt: { en: 'Which tone begins high and falls fast?', zhHans: '哪一个声调从高处快速下降？' },
    conceptId: 'four_tones_checkpoint',
    conceptLabel: { en: 'Four-tone checkpoint', zhHans: '四声检查点' },
    highlightKeys: ['tone_1', 'tone_2', 'tone_3', 'tone_4'],
    correctTone: 4,
    distractorTone: 2,
    audioAssetId: 'asset_tone_4_audio',
    sceneKind: 'assessment',
    estimatedSeconds: 120,
  },
]

export type PinyinLessonDraft = {
  scenes: CourseStudioSceneRecord[]
  knowledgeRefs: MockKnowledgeRef[]
  assets: MockAsset[]
}

export function createPinyinLessonDraft(
  project: CourseStudioProject,
  sectionId: string,
): PinyinLessonDraft {
  const sectionScenes = project.scenes.filter((scene) => scene.sectionId === sectionId)
  const firstSortOrder = Math.max(0, ...sectionScenes.map((scene) => scene.sortOrder)) + 10
  const scenes: CourseStudioSceneRecord[] = []
  const knowledgeRefs: MockKnowledgeRef[] = []

  pinyinLessonBlueprint.forEach((step, index) => {
    const sceneId = createTemplateId('scene')
    scenes.push({
      id: sceneId,
      sectionId,
      title: step.title,
      sceneKind: step.sceneKind,
      status: 'draft',
      contentOrigin: 'original',
      sortOrder: firstSortOrder + index * 10,
      estimatedSeconds: step.estimatedSeconds,
      tags: ['pronunciation', 'tones', step.key],
      sceneData: createToneScene(step),
    })
    knowledgeRefs.push({
      id: createTemplateId('ref'),
      sceneId,
      refType: 'pinyinConcept',
      refId: step.conceptId,
      refRole: step.sceneKind === 'assessment' ? 'practices' : 'teaches',
      label: step.conceptLabel,
      targetLocator: { elementId: 'chart_tones' },
    })
  })

  const existingAssetIds = new Set(project.mockAssets.map((asset) => asset.id))
  const assets = [2, 3, 4].flatMap((toneNumber) => {
    const id = `asset_tone_${toneNumber}_audio`
    if (existingAssetIds.has(id)) return []
    return [{
      id,
      kind: 'audio' as const,
      label: {
        en: `Tone ${toneNumber} audio needed`,
        zhHans: `第${toneNumber}声音频待补充`,
      },
      status: 'missing' as const,
    }]
  })

  return { scenes, knowledgeRefs, assets }
}

function createToneScene(step: PinyinLessonStep): SceneData {
  const source = structuredClone(samplePinyinToneScene)
  const elements = source.elements.map((element) => {
    if (element.kind === 'text') {
      return { ...element, content: step.explanation }
    }
    if (element.kind === 'pinyinChart') {
      return {
        ...element,
        highlightKeys: step.highlightKeys,
        audioAssetId: step.audioAssetId,
      }
    }
    return element
  })
  const actions = source.actions.map((action) => {
    if (action.kind === 'speak') return { ...action, text: step.speech }
    if (action.kind === 'playAudio') return { ...action, assetId: step.audioAssetId }
    if (action.kind === 'emitLearningEvent') {
      return {
        ...action,
        payload: { interactionId: 'quiz_tone_1', conceptId: step.conceptId },
      }
    }
    return action
  })
  const interactions = source.interactions.map((interaction) => {
    if (interaction.kind !== 'multipleChoice') return interaction
    return {
      ...interaction,
      prompt: step.prompt,
      options: [
        {
          id: 'option_correct',
          text: toneLabel(step.correctTone),
          isCorrect: true,
        },
        {
          id: 'option_distractor',
          text: toneLabel(step.distractorTone),
          isCorrect: false,
        },
      ],
    }
  })

  return SceneDataSchema.parse({ ...source, elements, actions, interactions })
}

function toneLabel(tone: 1 | 2 | 3 | 4) {
  const chineseNumbers = ['一', '二', '三', '四']
  return { en: `Tone ${tone}`, zhHans: `第${chineseNumbers[tone - 1]}声` }
}

function createTemplateId(prefix: string) {
  const randomPart = globalThis.crypto?.randomUUID?.().replaceAll('-', '').slice(0, 16)
  return `${prefix}_${randomPart ?? Date.now().toString(36)}`
}
