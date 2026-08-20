import { firstGreetingLesson } from '@/courses/dialogue/content/first-greeting'

import {
  defineVocabularyLesson,
  type VocabularyItem,
} from '../model/vocabulary-lesson-schema'

const placeholderWordAudio = (fileName: string, label: string) => ({
  src: `/audio/placeholders/vocabulary/first-words/${fileName}`,
  label,
  contentOrigin: 'generated-placeholder' as const,
  placeholder: true,
  mustReplaceBeforePublish: true,
})

function vocabularyFromDialogue({
  audioFile,
  id,
  knowledgeId,
  lineId,
  tokenId,
  usageNote,
}: {
  audioFile: string
  id: string
  knowledgeId: string
  lineId: string
  tokenId: string
  usageNote: string
}): VocabularyItem {
  const line = firstGreetingLesson.lines.find(item => item.id === lineId)
  const token = line?.tokens.find(item => item.id === tokenId)

  if (!line || !token?.pinyin || !token.meaning) {
    throw new Error(`Missing dialogue vocabulary source: ${lineId}/${tokenId}`)
  }

  return {
    id,
    text: token.text,
    pinyin: token.pinyin,
    meaning: token.meaning,
    usageNote,
    knowledgeId,
    audio: placeholderWordAudio(audioFile, `${token.text} vocabulary cue`),
    source: {
      lessonId: firstGreetingLesson.id,
      lineId: line.id,
      tokenId: token.id,
      contextText: line.tokens.map(item => item.text).join(''),
      contextPinyin: line.pinyin,
      contextTranslation: line.translation,
      contextAudio: line.audio,
    },
  }
}

const vocabulary = [
  vocabularyFromDialogue({
    audioFile: 'ni-hao.mp3',
    id: 'first-word-ni-hao',
    knowledgeId: 'vocabulary.greeting-ni-hao',
    lineId: 'greeting-line-1',
    tokenId: 'line-1-nihao',
    usageNote:
      'Use it to open a greeting in both formal and everyday settings.',
  }),
  vocabularyFromDialogue({
    audioFile: 'wo.mp3',
    id: 'first-word-wo',
    knowledgeId: 'vocabulary.pronoun-wo',
    lineId: 'greeting-line-1',
    tokenId: 'line-1-wo',
    usageNote: 'Place it before a verb when you are talking about yourself.',
  }),
  vocabularyFromDialogue({
    audioFile: 'jiao.mp3',
    id: 'first-word-jiao',
    knowledgeId: 'vocabulary.introduction-jiao',
    lineId: 'greeting-line-1',
    tokenId: 'line-1-jiao',
    usageNote: 'Use 我叫 + name to say what you are called.',
  }),
  vocabularyFromDialogue({
    audioFile: 'gao-xing.mp3',
    id: 'first-word-gao-xing',
    knowledgeId: 'vocabulary.feeling-gaoxing',
    lineId: 'greeting-line-3',
    tokenId: 'line-3-gaoxing',
    usageNote: 'It describes feeling happy or pleased in 很高兴认识你.',
  }),
  vocabularyFromDialogue({
    audioFile: 'ye.mp3',
    id: 'first-word-ye',
    knowledgeId: 'vocabulary.adverb-ye',
    lineId: 'greeting-line-4',
    tokenId: 'line-4-ye',
    usageNote: 'Put it before the verb or description to add “also” or “too.”',
  }),
]

export const firstWordsLesson = defineVocabularyLesson({
  schemaVersion: 'vocabularyLesson/v1',
  kind: 'vocabulary',
  id: 'first-words',
  title: 'Your first words',
  description:
    'Pull five useful words out of the greeting, recall them, and return them to a sentence.',
  routeId: 'hsk3-level-1-starter',
  nodeId: 'node-first-words',
  estimatedMinutes: 7,
  vocabulary,
  steps: [
    {
      id: 'first-words-context',
      kind: 'context-discovery',
      eyebrow: 'Notice',
      title: 'The words already live in a greeting',
      instruction:
        'Hear the original line again, then notice how three familiar pieces carry the introduction.',
      vocabularyIds: ['first-word-ni-hao', 'first-word-wo', 'first-word-jiao'],
      knowledgeIds: [
        'vocabulary.greeting-ni-hao',
        'vocabulary.pronoun-wo',
        'vocabulary.introduction-jiao',
      ],
    },
    {
      id: 'first-words-focus',
      kind: 'word-focus',
      eyebrow: 'Build',
      title: 'Give each word a sound and a job',
      instruction:
        'Move along the word rail. Hear each item and connect its pinyin, meaning, and place in the dialogue.',
      vocabularyIds: vocabulary.map(item => item.id),
      knowledgeIds: vocabulary.map(item => item.knowledgeId),
    },
    {
      id: 'first-words-meaning',
      kind: 'meaning-choice',
      eyebrow: 'Recognize',
      title: 'Match the word to its job',
      instruction: 'Choose the meaning that fits the introduction pattern.',
      prompt: 'What does 叫 do in 我叫林月?',
      options: [
        {
          id: 'meaning-called',
          label: 'It means “to be called.”',
          isCorrect: true,
        },
        {
          id: 'meaning-greet',
          label: 'It means “to greet.”',
          isCorrect: false,
        },
        {
          id: 'meaning-happy',
          label: 'It means “to feel happy.”',
          isCorrect: false,
        },
      ],
      correctFeedback: '叫 links the speaker to a name: 我叫 + name.',
      incorrectFeedback:
        'Keep 我 before the action and the name after it, then choose again.',
      knowledgeIds: ['vocabulary.introduction-jiao'],
    },
    {
      id: 'first-words-listening',
      kind: 'listening-choice',
      eyebrow: 'Hear',
      title: 'Recognize one word without its sentence',
      instruction:
        'Listen first. The written choices unlock when the cue ends.',
      vocabularyId: 'first-word-ye',
      prompt: 'Which word did you hear?',
      options: [
        { id: 'heard-wo', label: '我', supportingText: 'wǒ', isCorrect: false },
        { id: 'heard-ye', label: '也', supportingText: 'yě', isCorrect: true },
        {
          id: 'heard-jiao',
          label: '叫',
          supportingText: 'jiào',
          isCorrect: false,
        },
        {
          id: 'heard-nihao',
          label: '你好',
          supportingText: 'nǐ hǎo',
          isCorrect: false,
        },
      ],
      correctFeedback: '也 has a dipping third tone and adds “also” or “too.”',
      incorrectFeedback:
        'Replay the short cue and listen for the third-tone dip in yě.',
      knowledgeIds: ['vocabulary.adverb-ye'],
    },
    {
      id: 'first-words-recall',
      kind: 'active-recall',
      eyebrow: 'Recall',
      title: 'Bring the word back before looking',
      instruction:
        'Say the Mandarin word from memory. Reveal it only after you have made a real attempt.',
      vocabularyId: 'first-word-gao-xing',
      cue: 'How do you say “happy” or “pleased” in the greeting?',
      revealLabel: 'Reveal the word',
      correctFeedback: 'You retrieved 高兴 before relying on the written form.',
      incorrectFeedback:
        'Keep 高兴 in review and compare gāo (high-level) with xìng (falling).',
      knowledgeIds: ['vocabulary.feeling-gaoxing'],
    },
    {
      id: 'first-words-application',
      kind: 'sentence-application',
      eyebrow: 'Use',
      title: 'Put the word back into a new introduction',
      instruction:
        'Complete the sentence with the word that connects 我 to a name.',
      prompt: 'Choose the missing word.',
      sentenceBefore: '我',
      sentenceAfter: '安娜。',
      translation: 'My name is Anna.',
      options: [
        {
          id: 'apply-jiao',
          label: '叫',
          supportingText: 'jiào',
          isCorrect: true,
        },
        { id: 'apply-ye', label: '也', supportingText: 'yě', isCorrect: false },
        {
          id: 'apply-gaoxing',
          label: '高兴',
          supportingText: 'gāoxìng',
          isCorrect: false,
        },
      ],
      correctFeedback:
        '我叫安娜 keeps the same pattern while changing the name.',
      incorrectFeedback:
        'The blank needs the action “to be called” between 我 and the name.',
      knowledgeIds: ['vocabulary.introduction-jiao'],
    },
    {
      id: 'first-words-summary',
      kind: 'vocabulary-summary',
      eyebrow: 'Complete',
      title: 'Five words now form a usable path',
      instruction:
        'Keep the words attached to their sounds and sentence jobs, not as an isolated list.',
      takeaways: [
        '你好 opens the greeting.',
        '我 identifies the speaker.',
        '叫 connects 我 to a name.',
        '也 mirrors it with “too.”',
        '高兴 names the feeling.',
      ],
      knowledgeIds: vocabulary.map(item => item.knowledgeId),
    },
  ],
})
