import { CourseStudioProjectSchema } from './project-schema'
import { SceneDataSchema } from './scene-schema'

export const samplePinyinToneScene = SceneDataSchema.parse({
  version: 1,
  canvas: {
    aspectRatio: '16:9',
    safeArea: 'responsive',
    background: { kind: 'color', value: '#f8fafc' },
  },
  playback: {
    mode: 'guided',
    autoStart: false,
  },
  state: {
    quizPassed: false,
  },
  elements: [
    {
      id: 'mascot_teacher',
      kind: 'mascot',
      role: 'teacher',
      characterKey: 'panda',
      expression: 'happy',
      position: { preset: 'right-bottom', zIndex: 3 },
    },
    {
      id: 'text_title',
      kind: 'text',
      content: {
        en: 'The first tone is high and level.',
        zhHans: '第一声又高又平。',
      },
      position: { preset: 'top', zIndex: 2 },
      style: {
        size: 'xl',
        weight: 'bold',
        align: 'center',
      },
    },
    {
      id: 'chart_tones',
      kind: 'pinyinChart',
      chartKind: 'tones',
      highlightKeys: ['tone_1'],
      position: { preset: 'center', zIndex: 1 },
      audioAssetId: 'asset_tone_1_audio',
    },
    {
      id: 'quiz_tone_card',
      kind: 'quiz',
      interactionId: 'quiz_tone_1',
      title: {
        en: 'Quick check',
        zhHans: '快速检查',
      },
      position: { preset: 'bottom', zIndex: 4 },
    },
  ],
  timeline: [
    { id: 'tl_show_teacher', at: 0, actionId: 'act_show_teacher' },
    { id: 'tl_speak_intro', at: 400, actionId: 'act_speak_intro' },
    { id: 'tl_animate_teacher', at: 1100, actionId: 'act_animate_teacher' },
    { id: 'tl_highlight_tone', at: 1800, actionId: 'act_highlight_tone' },
    { id: 'tl_play_audio', at: 2600, actionId: 'act_play_tone_audio' },
    { id: 'tl_pause_quiz', at: 3600, actionId: 'act_pause_quiz' },
  ],
  events: [
    {
      id: 'evt_tone_correct',
      on: 'interaction.correct',
      targetId: 'quiz_tone_1',
      actions: ['act_mark_quiz_passed', 'act_emit_tone_correct'],
    },
  ],
  actions: [
    { id: 'act_show_teacher', kind: 'show', targetId: 'mascot_teacher' },
    {
      id: 'act_speak_intro',
      kind: 'speak',
      targetId: 'mascot_teacher',
      text: {
        en: 'Listen for a high, steady sound.',
        zhHans: '听一个又高又平的声音。',
      },
    },
    {
      id: 'act_highlight_tone',
      kind: 'highlight',
      targetId: 'chart_tones',
      effect: 'glow',
      durationMs: 900,
    },
    {
      id: 'act_animate_teacher',
      kind: 'animate',
      targetId: 'mascot_teacher',
      animation: 'scale',
      durationMs: 500,
    },
    {
      id: 'act_play_tone_audio',
      kind: 'playAudio',
      assetId: 'asset_tone_1_audio',
      targetId: 'chart_tones',
    },
    {
      id: 'act_pause_quiz',
      kind: 'pauseUntilInteraction',
      interactionId: 'quiz_tone_1',
    },
    {
      id: 'act_mark_quiz_passed',
      kind: 'setState',
      path: '$.quizPassed',
      value: true,
    },
    {
      id: 'act_emit_tone_correct',
      kind: 'emitLearningEvent',
      eventName: 'course_studio.quiz.correct',
      payload: {
        interactionId: 'quiz_tone_1',
        conceptId: 'tone_1',
      },
    },
  ],
  interactions: [
    {
      id: 'quiz_tone_1',
      kind: 'multipleChoice',
      required: true,
      targetElementId: 'quiz_tone_card',
      prompt: {
        en: 'Which tone is high and level?',
        zhHans: '哪一个声调又高又平？',
      },
      options: [
        {
          id: 'option_tone_1',
          text: { en: 'First tone', zhHans: '第一声' },
          isCorrect: true,
        },
        {
          id: 'option_tone_4',
          text: { en: 'Fourth tone', zhHans: '第四声' },
          isCorrect: false,
        },
      ],
      feedback: {
        correct: { en: 'Right. Keep it high and flat.', zhHans: '对，保持高而平。' },
        incorrect: { en: 'Try listening once more.', zhHans: '再听一遍试试。' },
      },
    },
  ],
  completionRule: {
    kind: 'allRequiredInteractions',
  },
})

export const sampleDialogueScene = SceneDataSchema.parse({
  version: 1,
  canvas: {
    aspectRatio: '16:9',
    safeArea: 'responsive',
    background: { kind: 'color', value: '#fffdf7' },
  },
  playback: {
    mode: 'guided',
    autoStart: false,
  },
  elements: [
    {
      id: 'dialogue_greeting',
      kind: 'dialogue',
      scene: {
        en: 'At the classroom door',
        zhHans: '在教室门口',
      },
      position: { x: 0.5, y: 0.27, width: 0.72, height: 0.42, zIndex: 1 },
      lines: [
        {
          id: 'line_anna_hello',
          speakerKey: 'anna',
          speakerName: 'Anna',
          hanzi: '你好，我叫安娜。',
          pinyin: 'Nǐ hǎo, wǒ jiào Ānnà.',
          translation: 'Hello, my name is Anna.',
          audioAssetId: 'asset_dialogue_line_anna',
        },
        {
          id: 'line_ming_hello',
          speakerKey: 'ming',
          speakerName: 'Ming',
          hanzi: '你好，安娜。我叫明。',
          pinyin: 'Nǐ hǎo, Ānnà. Wǒ jiào Míng.',
          translation: 'Hello, Anna. My name is Ming.',
          audioAssetId: 'asset_dialogue_line_ming',
        },
      ],
      display: {
        showHanzi: true,
        showPinyin: true,
        showTranslation: true,
      },
    },
    {
      id: 'callout_polite_tip',
      kind: 'callout',
      tone: 'tip',
      hidden: true,
      content: {
        en: '你好 is the safest first greeting for beginners.',
        zhHans: '你好是初学者最稳妥的问候语。',
      },
      position: { preset: 'right-top', zIndex: 2 },
    },
    {
      id: 'quiz_repeat_card',
      kind: 'quiz',
      interactionId: 'repeat_line_anna',
      title: {
        en: 'Speaking practice',
        zhHans: '跟读练习',
      },
      position: { x: 0.5, y: 0.45, width: 0.72, zIndex: 4 },
    },
  ],
  timeline: [
    { id: 'tl_play_anna', at: 0, actionId: 'act_play_anna_line' },
    { id: 'tl_highlight_dialogue', at: 900, actionId: 'act_highlight_dialogue' },
    { id: 'tl_show_tip', at: 1600, actionId: 'act_show_tip' },
    { id: 'tl_pause_repeat', at: 2400, actionId: 'act_pause_repeat' },
  ],
  events: [
    {
      id: 'evt_repeat_submitted',
      on: 'interaction.submit',
      targetId: 'repeat_line_anna',
      actions: ['act_emit_repeat_submitted'],
    },
  ],
  actions: [
    {
      id: 'act_play_anna_line',
      kind: 'playAudio',
      assetId: 'asset_dialogue_line_anna',
      targetId: 'dialogue_greeting',
    },
    {
      id: 'act_highlight_dialogue',
      kind: 'highlight',
      targetId: 'dialogue_greeting',
      effect: 'outline',
      durationMs: 800,
    },
    { id: 'act_show_tip', kind: 'show', targetId: 'callout_polite_tip' },
    {
      id: 'act_pause_repeat',
      kind: 'pauseUntilInteraction',
      interactionId: 'repeat_line_anna',
    },
    {
      id: 'act_emit_repeat_submitted',
      kind: 'emitLearningEvent',
      eventName: 'course_studio.speech_repeat.submitted',
      payload: {
        lineId: 'line_anna_hello',
      },
    },
  ],
  interactions: [
    {
      id: 'repeat_line_anna',
      kind: 'speechRepeat',
      required: true,
      targetElementId: 'quiz_repeat_card',
      targetLocator: {
        elementId: 'dialogue_greeting',
        lineId: 'line_anna_hello',
      },
      prompt: {
        en: 'Repeat Anna’s line.',
        zhHans: '跟读安娜的台词。',
      },
      text: '你好，我叫安娜。',
      pinyin: 'Nǐ hǎo, wǒ jiào Ānnà.',
      audioAssetId: 'asset_dialogue_line_anna',
      scoringMode: 'placeholder',
    },
    {
      id: 'role_play_greeting',
      kind: 'rolePlay',
      required: false,
      learnerSpeakerKey: 'anna',
      allowAiPartner: true,
      prompt: {
        en: 'Play Anna and greet Ming.',
        zhHans: '扮演安娜，和明打招呼。',
      },
      turns: [
        {
          id: 'turn_anna_hello',
          speakerKey: 'anna',
          lineId: 'line_anna_hello',
          text: '你好，我叫安娜。',
          learnerShouldSpeak: true,
        },
        {
          id: 'turn_ming_hello',
          speakerKey: 'ming',
          lineId: 'line_ming_hello',
          text: '你好，安娜。我叫明。',
        },
      ],
    },
  ],
  completionRule: {
    kind: 'specificInteractions',
    interactionIds: ['repeat_line_anna'],
  },
})

export const sampleVocabularyScene = SceneDataSchema.parse({
  version: 1,
  canvas: {
    aspectRatio: '16:9',
    safeArea: 'responsive',
    background: { kind: 'color', value: '#f7fbff' },
  },
  playback: {
    mode: 'manual',
    autoStart: false,
  },
  elements: [
    {
      id: 'vocab_greetings',
      kind: 'vocabulary',
      title: {
        en: 'Greeting words',
        zhHans: '问候词',
      },
      position: { preset: 'center', zIndex: 1 },
      items: [
        {
          id: 'vocab_nihao',
          lexicalItemId: 'lex_nihao',
          lexicalFormId: 'form_nihao_1',
          simplified: '你好',
          displayPinyin: 'nǐ hǎo',
          displayMeaning: 'hello',
          audioAssetId: 'asset_vocab_nihao',
        },
        {
          id: 'vocab_wo',
          lexicalItemId: 'lex_wo',
          lexicalFormId: 'form_wo_1',
          simplified: '我',
          displayPinyin: 'wǒ',
          displayMeaning: 'I; me',
        },
        {
          id: 'vocab_jiao',
          lexicalItemId: 'lex_jiao',
          lexicalFormId: 'form_jiao_1',
          simplified: '叫',
          displayPinyin: 'jiào',
          displayMeaning: 'to be called',
        },
      ],
      unmatchedTerms: [
        {
          simplified: '安娜',
          pinyin: 'Ānnà',
          meaning: 'Anna',
          reason: 'proper noun for dialogue context',
        },
      ],
    },
    {
      id: 'quiz_matching_card',
      kind: 'quiz',
      interactionId: 'match_greeting_words',
      title: {
        en: 'Match words and meanings',
        zhHans: '词义配对',
      },
      position: { preset: 'bottom', zIndex: 2 },
    },
  ],
  actions: [
    {
      id: 'act_emit_vocab_match',
      kind: 'emitLearningEvent',
      eventName: 'course_studio.matching.submitted',
      payload: {
        interactionId: 'match_greeting_words',
      },
    },
  ],
  events: [
    {
      id: 'evt_vocab_match_submit',
      on: 'interaction.submit',
      targetId: 'match_greeting_words',
      actions: ['act_emit_vocab_match'],
    },
  ],
  interactions: [
    {
      id: 'match_greeting_words',
      kind: 'matching',
      required: true,
      targetElementId: 'quiz_matching_card',
      prompt: {
        en: 'Match each Chinese word with its meaning.',
        zhHans: '把汉语词和意思配对。',
      },
      feedback: {
        correct: {
          en: 'All pairs are correct.',
          zhHans: '全部配对正确。',
        },
        incorrect: {
          en: 'Review the meanings and try again.',
          zhHans: '再看一遍词义，然后重试。',
        },
      },
      pairs: [
        {
          id: 'pair_nihao',
          source: { zhHans: '你好', en: '你好' },
          target: { en: 'hello', zhHans: '你好' },
        },
        {
          id: 'pair_wo',
          source: { zhHans: '我', en: '我' },
          target: { en: 'I; me', zhHans: '我' },
        },
      ],
    },
  ],
  completionRule: {
    kind: 'allRequiredInteractions',
  },
})

export const sampleSceneDataList = [
  samplePinyinToneScene,
  sampleDialogueScene,
  sampleVocabularyScene,
]

export const sampleCourseStudioProject = CourseStudioProjectSchema.parse({
  version: 1,
  id: 'project_hsk3_l1_sample',
  title: {
    en: 'HSK 3.0 Level 1 sample studio project',
    zhHans: 'HSK 3.0 一级 Studio 样例项目',
  },
  defaultLocale: 'en',
  course: {
    id: 'course_hsk3_l1_foundation',
    slug: 'hsk3-l1-foundation',
    title: {
      en: 'HSK 3.0 Level 1 Foundation',
      zhHans: 'HSK 3.0 一级基础课程',
    },
    primaryStandardVersion: 'hsk3',
    primaryStandardLevel: '1',
  },
  units: [
    {
      id: 'unit_hsk3_l1_001',
      courseId: 'course_hsk3_l1_foundation',
      unitNo: 1,
      sortOrder: 10,
      title: {
        en: 'Greetings and pronunciation',
        zhHans: '问候与发音',
      },
    },
  ],
  sections: [
    {
      id: 'section_hsk3_l1_001_pronunciation',
      unitId: 'unit_hsk3_l1_001',
      sectionKind: 'pronunciation',
      sortOrder: 10,
      title: {
        en: 'Pinyin tones',
        zhHans: '拼音声调',
      },
    },
    {
      id: 'section_hsk3_l1_001_dialogue',
      unitId: 'unit_hsk3_l1_001',
      sectionKind: 'text',
      sortOrder: 20,
      title: {
        en: 'Greeting dialogue',
        zhHans: '问候对话',
      },
    },
    {
      id: 'section_hsk3_l1_001_vocabulary',
      unitId: 'unit_hsk3_l1_001',
      sectionKind: 'vocabulary',
      sortOrder: 30,
      title: {
        en: 'New words',
        zhHans: '生词',
      },
    },
  ],
  scenes: [
    {
      id: 'scene_hsk3_l1_pinyin_tones',
      sectionId: 'section_hsk3_l1_001_pronunciation',
      title: {
        en: 'First tone guided scene',
        zhHans: '第一声引导场景',
      },
      sceneKind: 'pronunciation',
      status: 'draft',
      contentOrigin: 'original',
      sortOrder: 10,
      estimatedSeconds: 90,
      tags: ['pronunciation', 'tones', 'guided'],
      sceneData: samplePinyinToneScene,
    },
    {
      id: 'scene_hsk3_l1_greeting_dialogue',
      sectionId: 'section_hsk3_l1_001_dialogue',
      title: {
        en: 'Greeting dialogue',
        zhHans: '问候对话',
      },
      sceneKind: 'dialogue',
      status: 'draft',
      contentOrigin: 'original',
      sortOrder: 20,
      estimatedSeconds: 150,
      tags: ['dialogue', 'speaking', 'shadowing'],
      sceneData: sampleDialogueScene,
    },
    {
      id: 'scene_hsk3_l1_greeting_vocab',
      sectionId: 'section_hsk3_l1_001_vocabulary',
      title: {
        en: 'Greeting vocabulary',
        zhHans: '问候生词',
      },
      sceneKind: 'vocabulary',
      status: 'draft',
      contentOrigin: 'original',
      sortOrder: 30,
      estimatedSeconds: 120,
      tags: ['vocabulary', 'matching'],
      sceneData: sampleVocabularyScene,
    },
  ],
  mockAssets: [
    {
      id: 'asset_tone_1_audio',
      kind: 'audio',
      label: {
        en: 'First tone audio placeholder',
        zhHans: '第一声音频占位',
      },
      status: 'placeholder',
      durationMs: 1100,
    },
    {
      id: 'asset_dialogue_line_anna',
      kind: 'audio',
      label: {
        en: 'Anna greeting line',
        zhHans: '安娜问候台词',
      },
      status: 'placeholder',
      durationMs: 1800,
    },
    {
      id: 'asset_dialogue_line_ming',
      kind: 'audio',
      label: {
        en: 'Ming greeting line',
        zhHans: '明问候台词',
      },
      status: 'placeholder',
      durationMs: 1900,
    },
    {
      id: 'asset_vocab_nihao',
      kind: 'audio',
      label: {
        en: '你好 audio placeholder',
        zhHans: '你好音频占位',
      },
      status: 'placeholder',
      durationMs: 900,
    },
  ],
  mockKnowledgeRefs: [
    {
      id: 'ref_tone_1',
      sceneId: 'scene_hsk3_l1_pinyin_tones',
      refType: 'pinyinConcept',
      refId: 'tone_1',
      refRole: 'teaches',
      label: {
        en: 'First tone',
        zhHans: '第一声',
      },
      targetLocator: {
        elementId: 'chart_tones',
        interactionId: 'quiz_tone_1',
      },
    },
    {
      id: 'ref_nihao_dialogue',
      sceneId: 'scene_hsk3_l1_greeting_dialogue',
      refType: 'lexicalItem',
      refId: 'lex_nihao',
      refRole: 'practices',
      label: {
        en: '你好',
        zhHans: '你好',
      },
      targetLocator: {
        elementId: 'dialogue_greeting',
        interactionId: 'repeat_line_anna',
        lineId: 'line_anna_hello',
      },
    },
    {
      id: 'ref_nihao_vocab',
      sceneId: 'scene_hsk3_l1_greeting_vocab',
      refType: 'lexicalItem',
      refId: 'lex_nihao',
      refRole: 'teaches',
      label: {
        en: '你好',
        zhHans: '你好',
      },
      targetLocator: {
        elementId: 'vocab_greetings',
        interactionId: 'match_greeting_words',
      },
    },
  ],
  settings: {
    activeSceneId: 'scene_hsk3_l1_pinyin_tones',
    previewMode: 'editor',
  },
})
