import { definePinyinLesson } from '../model/pinyin-lesson-schema'

export const toneShapeReviewFixture = definePinyinLesson({
  schemaVersion: 'pinyinLesson/v1',
  kind: 'pinyin',
  id: 'tone-shape-review-fixture',
  title: 'Tone shape review',
  description: 'An unpublished fixture that verifies a second pinyin lesson.',
  estimatedMinutes: 3,
  tones: [
    { number: 1, name: 'Tone 1', shape: 'Level', example: 'mā', cue: 'Stay level.', contour: [5, 5] },
    { number: 2, name: 'Tone 2', shape: 'Rising', example: 'má', cue: 'Rise.', contour: [2, 5] },
    { number: 3, name: 'Tone 3', shape: 'Turning', example: 'mǎ', cue: 'Dip and turn.', contour: [2, 1, 4] },
    { number: 4, name: 'Tone 4', shape: 'Falling', example: 'mà', cue: 'Fall.', contour: [5, 1] },
  ],
  steps: [
    {
      id: 'review-tone-map',
      kind: 'tone-overview',
      title: 'Review the four paths',
      instruction: 'Compare the direction of all four tone lines.',
    },
    {
      id: 'review-tone-choice',
      kind: 'tone-choice',
      title: 'Find the turning path',
      instruction: 'Choose the tone that dips before rising.',
      prompt: 'Which tone turns near the bottom?',
      optionToneNumbers: [2, 3, 4],
      correctToneNumber: 3,
      correctFeedback: 'The third tone is the only path with a low turn.',
      incorrectFeedback: 'Look for a path with three pitch points.',
    },
    {
      id: 'review-tone-summary',
      kind: 'lesson-summary',
      title: 'Review complete',
      instruction: 'Keep using line direction as a reading cue.',
      takeaways: ['Tone marks provide compact pitch-direction cues.'],
    },
  ],
})

