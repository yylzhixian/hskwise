import { firstGreetingLesson } from '@/courses/dialogue/content/first-greeting'
import { fourTonesLesson } from '@/courses/pinyin/content/four-tones'
import { firstWordsLesson } from '@/courses/vocabulary/content/first-words'

import { defineCheckpoint } from '../model/checkpoint-schema'

const toneSample = fourTonesLesson.steps.find(
  (step) => step.id === 'four-tones-listening-turning',
)
const greetingLine = firstGreetingLesson.lines.find(
  (line) => line.id === 'greeting-line-1',
)
const replyLine = firstGreetingLesson.lines.find(
  (line) => line.id === 'greeting-line-2',
)
const calledWord = firstWordsLesson.vocabulary.find(
  (item) => item.id === 'first-word-jiao',
)

if (
  toneSample?.kind !== 'tone-listening-choice' ||
  !greetingLine ||
  !replyLine ||
  !calledWord
) {
  throw new Error('Starter checkpoint source content is incomplete.')
}

const lineText = (line: typeof greetingLine) =>
  line.tokens.map((token) => token.text).join('')

export const starterCheckpoint = defineCheckpoint({
  schemaVersion: 'checkpoint/v1',
  kind: 'checkpoint',
  id: 'starter-checkpoint',
  title: 'Starter checkpoint',
  description:
    'Reconnect tone direction, greeting meaning, first words, and conversation order.',
  routeId: 'hsk3-level-1-starter',
  nodeId: 'node-starter-checkpoint',
  estimatedMinutes: 6,
  reviewedLessonIds: [
    fourTonesLesson.id,
    firstGreetingLesson.id,
    firstWordsLesson.id,
  ],
  steps: [
    {
      id: 'starter-checkpoint-intro',
      kind: 'checkpoint-intro',
      eyebrow: 'Checkpoint',
      title: 'Bring the first three lessons together',
      instruction:
        'Each prompt revisits something you already practiced. Missed answers return to your review queue.',
      reviewedLessonIds: [
        fourTonesLesson.id,
        firstGreetingLesson.id,
        firstWordsLesson.id,
      ],
      knowledgeIds: [],
    },
    {
      id: 'starter-checkpoint-tone',
      kind: 'listening-choice',
      eyebrow: '1 of 4 · Listen',
      title: 'Recognize the pitch turn',
      instruction: 'Play the cue and identify its tone before moving on.',
      sourceLessonId: fourTonesLesson.id,
      prompt: toneSample.prompt,
      audio: toneSample.audio,
      fallbackCue: 'The pitch dips low, then turns upward.',
      options: fourTonesLesson.tones.map((tone) => ({
        id: `checkpoint-tone-${tone.number}`,
        label: `Tone ${tone.number}`,
        supportingText: tone.shape,
        isCorrect: tone.number === toneSample.correctToneNumber,
      })),
      correctFeedback: toneSample.correctFeedback,
      incorrectFeedback: toneSample.incorrectFeedback,
      knowledgeIds: toneSample.knowledgeIds,
    },
    {
      id: 'starter-checkpoint-meaning',
      kind: 'meaning-choice',
      eyebrow: '2 of 4 · Meaning',
      title: `Use ${calledWord.text} inside a sentence`,
      instruction: `Recall what ${calledWord.text} does in the greeting pattern.`,
      sourceLessonId: firstWordsLesson.id,
      prompt: `What does ${calledWord.text} do in “我叫安娜”?`,
      options: [
        {
          id: 'meaning-introduce-name',
          label: "It introduces the speaker's name.",
          supportingText: calledWord.meaning,
          isCorrect: true,
        },
        {
          id: 'meaning-ask-name',
          label: "It asks for the other person's name.",
          isCorrect: false,
        },
        {
          id: 'meaning-greet-person',
          label: 'It greets the other person.',
          isCorrect: false,
        },
      ],
      correctFeedback: `${calledWord.text} connects 我 with the name that follows.`,
      incorrectFeedback: `Return to the pattern 我 + ${calledWord.text} + name.`,
      knowledgeIds: [calledWord.knowledgeId],
    },
    {
      id: 'starter-checkpoint-dialogue',
      kind: 'dialogue-choice',
      eyebrow: '3 of 4 · Respond',
      title: 'Choose the natural reply',
      instruction: 'Use the greeting exchange you explored earlier.',
      sourceLessonId: firstGreetingLesson.id,
      prompt: `Lin Yue says “${lineText(greetingLine)}” What is the best reply?`,
      options: [
        {
          id: 'dialogue-reply-greeting',
          label: lineText(replyLine),
          supportingText: replyLine.pinyin,
          isCorrect: true,
        },
        {
          id: 'dialogue-reply-name-only',
          label: '我叫林月。',
          supportingText: 'Wǒ jiào Lín Yuè.',
          isCorrect: false,
        },
        {
          id: 'dialogue-reply-goodbye',
          label: '再见！',
          supportingText: 'Zàijiàn!',
          isCorrect: false,
        },
      ],
      correctFeedback: 'Anna returns the greeting and then gives her own name.',
      incorrectFeedback: 'A first meeting reply should greet back before introducing a name.',
      knowledgeIds: replyLine.knowledgeIds,
    },
    {
      id: 'starter-checkpoint-order',
      kind: 'line-order',
      eyebrow: '4 of 4 · Rebuild',
      title: 'Rebuild the meeting',
      instruction: 'Drag the three moments into a natural conversation order.',
      sourceLessonId: firstGreetingLesson.id,
      prompt: 'What happens first, next, and last?',
      items: [
        { id: 'order-greet', label: '你好！', supportingText: 'Say hello.' },
        { id: 'order-name', label: '我叫安娜。', supportingText: 'Give a name.' },
        {
          id: 'order-meet',
          label: '很高兴认识你。',
          supportingText: 'Close the introduction warmly.',
        },
      ],
      startingOrder: ['order-meet', 'order-greet', 'order-name'],
      correctOrder: ['order-greet', 'order-name', 'order-meet'],
      correctFeedback: 'Greeting, name, then a warm closing forms the full exchange.',
      incorrectFeedback: 'Start with hello, introduce the name, and close with nice to meet you.',
      knowledgeIds: [
        'dialogue.greeting-ni-hao',
        'dialogue.self-introduction-jiao',
        'dialogue.greeting-nice-to-meet',
      ],
    },
    {
      id: 'starter-checkpoint-summary',
      kind: 'checkpoint-summary',
      eyebrow: 'Route complete',
      title: 'Your starter foundation is connected',
      instruction: 'Finish the checkpoint to complete the first route.',
      takeaways: [
        'You can distinguish a turning tone from a direct fall.',
        'You can recognize the pattern 我叫 + name.',
        'You can follow the order of a first greeting.',
      ],
      knowledgeIds: [],
    },
  ],
})
