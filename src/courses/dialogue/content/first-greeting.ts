import { defineDialogueLesson } from '../model/dialogue-lesson-schema'

const placeholderAudio = (fileName: string, label: string) => ({
  src: `/audio/placeholders/dialogue/first-greeting/${fileName}`,
  label,
  contentOrigin: 'generated-placeholder' as const,
  placeholder: true,
  mustReplaceBeforePublish: true,
})

export const firstGreetingLesson = defineDialogueLesson({
  schemaVersion: 'dialogueLesson/v1',
  kind: 'dialogue',
  id: 'first-greeting',
  title: 'Your first greeting',
  description:
    'Follow an original first-day exchange and take one role in the conversation.',
  routeId: 'hsk3-level-1-starter',
  nodeId: 'node-first-greeting',
  estimatedMinutes: 10,
  roles: [
    {
      id: 'lin-yue',
      name: '林月',
      pinyin: 'Lín Yuè',
      cue: 'Greets first and introduces herself.',
    },
    {
      id: 'anna',
      name: '安娜',
      pinyin: 'Ānnà',
      cue: 'Returns the greeting and joins the exchange.',
    },
  ],
  lines: [
    {
      id: 'greeting-line-1',
      speakerId: 'lin-yue',
      tokens: [
        { id: 'line-1-nihao', text: '你好', pinyin: 'nǐ hǎo', meaning: 'hello' },
        { id: 'line-1-pause', text: '！' },
        { id: 'line-1-wo', text: '我', pinyin: 'wǒ', meaning: 'I; me' },
        { id: 'line-1-jiao', text: '叫', pinyin: 'jiào', meaning: 'to be called' },
        { id: 'line-1-name', text: '林月', pinyin: 'Lín Yuè', meaning: 'Lin Yue' },
        { id: 'line-1-stop', text: '。' },
      ],
      pinyin: 'Nǐ hǎo! Wǒ jiào Lín Yuè.',
      translation: 'Hello! My name is Lin Yue.',
      audio: placeholderAudio('line-1.mp3', 'Lin Yue greeting'),
      knowledgeIds: [
        'dialogue.greeting-ni-hao',
        'dialogue.self-introduction-jiao',
      ],
    },
    {
      id: 'greeting-line-2',
      speakerId: 'anna',
      tokens: [
        { id: 'line-2-nihao', text: '你好', pinyin: 'nǐ hǎo', meaning: 'hello' },
        { id: 'line-2-name-a', text: '，' },
        { id: 'line-2-name', text: '林月', pinyin: 'Lín Yuè', meaning: 'Lin Yue' },
        { id: 'line-2-pause', text: '！' },
        { id: 'line-2-wo', text: '我', pinyin: 'wǒ', meaning: 'I; me' },
        { id: 'line-2-jiao', text: '叫', pinyin: 'jiào', meaning: 'to be called' },
        { id: 'line-2-anna', text: '安娜', pinyin: 'Ānnà', meaning: 'Anna' },
        { id: 'line-2-stop', text: '。' },
      ],
      pinyin: 'Nǐ hǎo, Lín Yuè! Wǒ jiào Ānnà.',
      translation: 'Hello, Lin Yue! My name is Anna.',
      audio: placeholderAudio('line-2.mp3', 'Anna greeting'),
      knowledgeIds: [
        'dialogue.greeting-ni-hao',
        'dialogue.self-introduction-jiao',
      ],
    },
    {
      id: 'greeting-line-3',
      speakerId: 'lin-yue',
      tokens: [
        { id: 'line-3-hen', text: '很', pinyin: 'hěn', meaning: 'very' },
        { id: 'line-3-gaoxing', text: '高兴', pinyin: 'gāoxìng', meaning: 'happy' },
        { id: 'line-3-renshi', text: '认识', pinyin: 'rènshi', meaning: 'to meet; to know' },
        { id: 'line-3-ni', text: '你', pinyin: 'nǐ', meaning: 'you' },
        { id: 'line-3-stop', text: '。' },
      ],
      pinyin: 'Hěn gāoxìng rènshi nǐ.',
      translation: 'Nice to meet you.',
      audio: placeholderAudio('line-3.mp3', 'Lin Yue nice to meet you'),
      knowledgeIds: ['dialogue.greeting-nice-to-meet'],
    },
    {
      id: 'greeting-line-4',
      speakerId: 'anna',
      tokens: [
        { id: 'line-4-wo', text: '我', pinyin: 'wǒ', meaning: 'I; me' },
        { id: 'line-4-ye', text: '也', pinyin: 'yě', meaning: 'also' },
        { id: 'line-4-hen', text: '很', pinyin: 'hěn', meaning: 'very' },
        { id: 'line-4-gaoxing', text: '高兴', pinyin: 'gāoxìng', meaning: 'happy' },
        { id: 'line-4-renshi', text: '认识', pinyin: 'rènshi', meaning: 'to meet; to know' },
        { id: 'line-4-ni', text: '你', pinyin: 'nǐ', meaning: 'you' },
        { id: 'line-4-stop', text: '。' },
      ],
      pinyin: 'Wǒ yě hěn gāoxìng rènshi nǐ.',
      translation: 'Nice to meet you too.',
      audio: placeholderAudio('line-4.mp3', 'Anna nice to meet you too'),
      knowledgeIds: ['dialogue.greeting-nice-to-meet'],
    },
  ],
  steps: [
    {
      id: 'first-greeting-scene',
      kind: 'scene-intro',
      eyebrow: 'Scene',
      title: 'Two classmates meet before class',
      instruction:
        'Listen for what each person says first and how the other person responds.',
      sceneLabel: 'First day · language classroom',
      setting:
        'Lin Yue and Anna arrive early. They have not met before, so they exchange names and close with a friendly response.',
      goal: 'Follow the greeting, notice the name pattern, then speak one role.',
      knowledgeIds: ['dialogue.greeting-ni-hao'],
    },
    {
      id: 'first-greeting-explore',
      kind: 'dialogue-explore',
      eyebrow: 'Explore',
      title: 'Follow the exchange one line at a time',
      instruction:
        'Play every line to hear the full exchange. Select a line to reveal pinyin, meaning, or a short word note.',
      lineIds: [
        'greeting-line-1',
        'greeting-line-2',
        'greeting-line-3',
        'greeting-line-4',
      ],
      knowledgeIds: [
        'dialogue.greeting-ni-hao',
        'dialogue.self-introduction-jiao',
        'dialogue.greeting-nice-to-meet',
      ],
    },
    {
      id: 'first-greeting-meaning-check',
      kind: 'comprehension-choice',
      eyebrow: 'Understand',
      title: 'Identify the purpose of the exchange',
      instruction: 'Use the order of the lines, not one isolated word.',
      prompt: 'What do Lin Yue and Anna do in this conversation?',
      options: [
        { id: 'exchange-names', label: 'They greet and exchange names.', isCorrect: true },
        { id: 'order-drinks', label: 'They order drinks together.', isCorrect: false },
        { id: 'ask-the-time', label: 'They ask what time class starts.', isCorrect: false },
      ],
      correctFeedback:
        'They use 你好 to open, 我叫… to share names, and 很高兴认识你 to close.',
      incorrectFeedback:
        'Trace the exchange from 你好 through both uses of 我叫 before choosing again.',
      knowledgeIds: [
        'dialogue.greeting-ni-hao',
        'dialogue.self-introduction-jiao',
      ],
    },
    {
      id: 'first-greeting-order-check',
      kind: 'line-order',
      eyebrow: 'Rebuild',
      title: 'Put the greeting back on its track',
      instruction:
        'Move each line until greeting, introductions, and closing response follow naturally.',
      prompt: 'Arrange the four lines in conversation order.',
      lineIds: [
        'greeting-line-1',
        'greeting-line-2',
        'greeting-line-3',
        'greeting-line-4',
      ],
      startingOrder: [
        'greeting-line-3',
        'greeting-line-1',
        'greeting-line-4',
        'greeting-line-2',
      ],
      correctFeedback:
        'The exchange now moves from greeting to names, then to the matching closing lines.',
      incorrectFeedback:
        'Start with the first 你好, keep each reply after the line it answers, and try again.',
      knowledgeIds: ['dialogue.greeting-sequence'],
    },
    {
      id: 'first-greeting-role-practice',
      kind: 'role-practice',
      eyebrow: 'Speak',
      title: 'Take one side of the conversation',
      instruction:
        'Choose a role and start. The other speaker plays automatically; finish each recorded turn to continue the exchange.',
      roleIds: ['lin-yue', 'anna'],
      lineIds: [
        'greeting-line-1',
        'greeting-line-2',
        'greeting-line-3',
        'greeting-line-4',
      ],
      knowledgeIds: [
        'dialogue.greeting-ni-hao',
        'dialogue.self-introduction-jiao',
        'dialogue.greeting-nice-to-meet',
      ],
    },
    {
      id: 'first-greeting-summary',
      kind: 'dialogue-summary',
      eyebrow: 'Complete',
      title: 'A greeting has a response track',
      instruction:
        'Carry the same sequence into future introductions, even when the names change.',
      takeaways: [
        '你好 opens the exchange and invites a response.',
        '我叫 + name introduces the speaker.',
        '我也… mirrors the other person with “too.”',
      ],
      knowledgeIds: [
        'dialogue.greeting-ni-hao',
        'dialogue.self-introduction-jiao',
      ],
    },
  ],
})
