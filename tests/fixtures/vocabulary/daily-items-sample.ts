import { defineVocabularyLesson } from '@/courses/vocabulary/model/vocabulary-lesson-schema'

const fixtureAudio = (fileName: string, label: string) => ({
  src: `/audio/fixtures/vocabulary/${fileName}`,
  label,
  contentOrigin: 'generated-placeholder' as const,
  placeholder: true,
  mustReplaceBeforePublish: true,
})

const contextAudio = fixtureAudio('daily-items-context.mp3', 'Daily items context')

function fixtureWord({
  id,
  knowledgeId,
  meaning,
  pinyin,
  text,
  usageNote,
}: {
  id: string
  knowledgeId: string
  meaning: string
  pinyin: string
  text: string
  usageNote: string
}) {
  return {
    id,
    knowledgeId,
    meaning,
    pinyin,
    text,
    usageNote,
    audio: fixtureAudio(`${id}.mp3`, `${text} fixture cue`),
    source: {
      lessonId: 'daily-items-dialogue-fixture',
      lineId: 'daily-items-line-1',
      tokenId: `daily-items-token-${id}`,
      contextText: '这是我的书和杯子。',
      contextPinyin: 'Zhè shì wǒ de shū hé bēizi.',
      contextTranslation: 'These are my book and cup.',
      contextAudio,
    },
  }
}

export const dailyItemsSample = defineVocabularyLesson({
  schemaVersion: 'vocabularyLesson/v1',
  kind: 'vocabulary',
  id: 'daily-items-sample',
  title: 'Daily items sample',
  description: 'Exercises the vocabulary template with concrete objects.',
  estimatedMinutes: 5,
  vocabulary: [
    fixtureWord({
      id: 'daily-book',
      knowledgeId: 'vocabulary.daily-book',
      meaning: 'book; a bound or digital work used for reading and study',
      pinyin: 'shū',
      text: '书',
      usageNote: 'Use it as a concrete noun after a number or possessive phrase.',
    }),
    fixtureWord({
      id: 'daily-cup',
      knowledgeId: 'vocabulary.daily-cup',
      meaning: 'cup; a small open container used for drinking',
      pinyin: 'bēizi',
      text: '杯子',
      usageNote: 'Use it for a drinking container, often with the measure word 个.',
    }),
    fixtureWord({
      id: 'daily-and',
      knowledgeId: 'vocabulary.daily-and',
      meaning: 'and; joins nouns or noun phrases rather than full clauses',
      pinyin: 'hé',
      text: '和',
      usageNote: 'Place it between two nouns that belong in the same list.',
    }),
  ],
  steps: [
    {
      id: 'daily-context',
      kind: 'context-discovery',
      title: 'Notice the objects in context',
      instruction: 'Read the original line before isolating the words.',
      vocabularyIds: ['daily-book', 'daily-cup'],
    },
    {
      id: 'daily-focus',
      kind: 'word-focus',
      title: 'Inspect the daily words',
      instruction: 'Connect sound, meaning, and sentence position.',
      vocabularyIds: ['daily-book', 'daily-cup', 'daily-and'],
    },
    {
      id: 'daily-meaning',
      kind: 'meaning-choice',
      title: 'Recognize the connector',
      instruction: 'Choose the meaning used between the objects.',
      prompt: 'What does 和 do here?',
      options: [
        { id: 'daily-meaning-and', label: 'It joins the two nouns.', isCorrect: true },
        { id: 'daily-meaning-own', label: 'It marks ownership.', isCorrect: false },
      ],
      correctFeedback: '和 joins 书 and 杯子.',
      incorrectFeedback: 'Look at the noun on each side of 和.',
      knowledgeIds: ['vocabulary.daily-and'],
    },
    {
      id: 'daily-listening',
      kind: 'listening-choice',
      title: 'Hear the object',
      instruction: 'Match the cue to the written word.',
      vocabularyId: 'daily-cup',
      prompt: 'Which word did you hear?',
      options: [
        { id: 'daily-heard-cup', label: '杯子', isCorrect: true },
        { id: 'daily-heard-book', label: '书', isCorrect: false },
      ],
      correctFeedback: '杯子 is the cup.',
      incorrectFeedback: 'Replay bēizi and compare its two syllables.',
      knowledgeIds: ['vocabulary.daily-cup'],
    },
    {
      id: 'daily-recall',
      kind: 'active-recall',
      title: 'Recall the book',
      instruction: 'Say it before revealing the answer.',
      vocabularyId: 'daily-book',
      cue: 'How do you say “book”?',
      revealLabel: 'Reveal the word',
      correctFeedback: 'You recalled 书.',
      incorrectFeedback: 'Keep 书 in the review queue.',
      knowledgeIds: ['vocabulary.daily-book'],
    },
    {
      id: 'daily-application',
      kind: 'sentence-application',
      title: 'Join the objects',
      instruction: 'Complete the short list.',
      prompt: 'Choose the missing word.',
      sentenceBefore: '书',
      sentenceAfter: '杯子',
      translation: 'book and cup',
      options: [
        { id: 'daily-apply-and', label: '和', isCorrect: true },
        { id: 'daily-apply-cup', label: '杯子', isCorrect: false },
      ],
      correctFeedback: '和 joins the two items.',
      incorrectFeedback: 'The blank needs a connector, not another object.',
      knowledgeIds: ['vocabulary.daily-and'],
    },
    {
      id: 'daily-summary',
      kind: 'vocabulary-summary',
      title: 'Daily items complete',
      instruction: 'Keep each word in its sentence role.',
      takeaways: ['书 and 杯子 name objects.', '和 joins them.'],
    },
  ],
})
