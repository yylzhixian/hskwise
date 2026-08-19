import type {
  ChoiceOption,
  OrderingItem,
} from '../model/interaction-types'
import { lessonDefinitionSchema } from '../model/lesson-definition'

export const runtimeLabDefinition = lessonDefinitionSchema.parse({
  id: 'runtime-lab',
  title: 'Learning rhythm',
  description: 'A short original sequence for validating the shared lesson runtime.',
  estimatedMinutes: 3,
  steps: [
    {
      id: 'runtime-welcome',
      eyebrow: 'Get ready',
      title: 'One task at a time',
      instruction:
        'Notice the prompt, make one decision, and use the feedback before moving on.',
      completionRule: { kind: 'continue' },
    },
    {
      id: 'runtime-choice',
      eyebrow: 'Choose',
      title: 'Respond to feedback',
      instruction: 'Choose the response that keeps learning productive.',
      completionRule: {
        kind: 'interaction',
        interactionId: 'runtime-choice-feedback',
        requireCorrect: true,
      },
    },
    {
      id: 'runtime-order',
      eyebrow: 'Arrange',
      title: 'Build a useful sequence',
      instruction: 'Put the four learning actions in a useful order.',
      completionRule: {
        kind: 'interaction',
        interactionId: 'runtime-order-rhythm',
        requireCorrect: true,
      },
    },
    {
      id: 'runtime-audio',
      eyebrow: 'Listen',
      title: 'Follow a sound cue',
      instruction: 'Start playback before continuing.',
      completionRule: { kind: 'media', mediaId: 'runtime-audio-cue' },
    },
    {
      id: 'runtime-recording',
      eyebrow: 'Speak',
      title: 'Capture a short response',
      instruction: 'Record a brief response or use the available fallback.',
      completionRule: { kind: 'media', mediaId: 'runtime-recording-cue' },
    },
    {
      id: 'runtime-finish',
      eyebrow: 'Complete',
      title: 'The learning loop is ready',
      instruction:
        'Answers, retries, media states, progress, and completion now share one runtime.',
      completionRule: { kind: 'continue' },
    },
  ],
})

export const runtimeChoiceOptions = [
  {
    id: 'choice-use-feedback',
    label: 'Check the feedback, then try again.',
    description: 'Use the result to guide the next attempt.',
    isCorrect: true,
  },
  {
    id: 'choice-ignore-feedback',
    label: 'Ignore the result and move on.',
    description: 'Leave the misunderstanding unresolved.',
    isCorrect: false,
  },
  {
    id: 'choice-repeat-randomly',
    label: 'Repeat the same answer without checking.',
    description: 'Make another attempt without new information.',
    isCorrect: false,
  },
] satisfies ChoiceOption[]

export const runtimeOrderingItems = [
  { id: 'order-respond', label: 'Respond', correctOrder: 3 },
  { id: 'order-listen', label: 'Listen', correctOrder: 1 },
  { id: 'order-review', label: 'Review', correctOrder: 4 },
  { id: 'order-notice', label: 'Notice the pattern', correctOrder: 2 },
] satisfies OrderingItem[]
