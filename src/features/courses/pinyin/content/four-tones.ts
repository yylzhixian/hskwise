import { definePinyinLesson } from '../model/pinyin-lesson-schema'

export const fourTonesLesson = definePinyinLesson({
  schemaVersion: 'pinyinLesson/v1',
  kind: 'pinyin',
  id: 'four-tones',
  title: 'Meet the four tones',
  description:
    'Recognize the four Mandarin tone shapes and connect each one with a pitch direction.',
  routeId: 'hsk3-level-1-starter',
  nodeId: 'node-four-tones',
  estimatedMinutes: 6,
  tones: [
    {
      number: 1,
      name: 'First tone',
      shape: 'High and level',
      example: 'mā',
      cue: 'Hold the pitch steady.',
      contour: [5, 5],
    },
    {
      number: 2,
      name: 'Second tone',
      shape: 'Rising',
      example: 'má',
      cue: 'Let the pitch rise like a short question.',
      contour: [2, 5],
    },
    {
      number: 3,
      name: 'Third tone',
      shape: 'Low, then turning up',
      example: 'mǎ',
      cue: 'Dip low before the pitch turns upward.',
      contour: [2, 1, 4],
    },
    {
      number: 4,
      name: 'Fourth tone',
      shape: 'Falling',
      example: 'mà',
      cue: 'Drop the pitch cleanly and quickly.',
      contour: [5, 1],
    },
  ],
  steps: [
    {
      id: 'four-tones-map',
      kind: 'tone-overview',
      eyebrow: 'Observe',
      title: 'One syllable, four pitch paths',
      instruction:
        'Follow each line from left to right. The written tone mark mirrors the direction of the voice.',
      knowledgeIds: [
        'pinyin.tone-shapes.tone1',
        'pinyin.tone-shapes.tone2',
        'pinyin.tone-shapes.tone3',
        'pinyin.tone-shapes.tone4',
      ],
    },
    {
      id: 'four-tones-pitch-guide',
      kind: 'pitch-guide',
      eyebrow: 'Listen to direction',
      title: 'Trace each pitch path',
      instruction:
        'Play all four guides. Listen for direction rather than the sound of a spoken syllable.',
      toneNumbers: [1, 2, 3, 4],
      knowledgeIds: ['pinyin.tone-shapes'],
    },
    {
      id: 'four-tones-rising-check',
      kind: 'tone-choice',
      eyebrow: 'Identify',
      title: 'Find the rising path',
      instruction: 'Use the line shape before checking the tone number.',
      prompt: 'Which tone rises from a lower pitch to a higher pitch?',
      optionToneNumbers: [1, 2, 4],
      correctToneNumber: 2,
      correctFeedback:
        'The second tone climbs. Its acute accent points in the same direction.',
      incorrectFeedback:
        'Look for the line that finishes higher than where it begins.',
      knowledgeIds: ['pinyin.tone-shapes.tone2'],
    },
    {
      id: 'four-tones-falling-check',
      kind: 'tone-choice',
      eyebrow: 'Contrast',
      title: 'Separate falling from dipping',
      instruction:
        'The third tone turns near the bottom; the fourth tone keeps falling.',
      prompt: 'Which tone falls directly from high to low?',
      optionToneNumbers: [2, 3, 4],
      correctToneNumber: 4,
      correctFeedback:
        'The fourth tone falls without turning upward. Its grave accent follows that drop.',
      incorrectFeedback:
        'Choose the path that starts high and ends low without a turn.',
      knowledgeIds: [
        'pinyin.tone-shapes.tone3',
        'pinyin.tone-shapes.tone4',
      ],
    },
    {
      id: 'four-tones-summary',
      kind: 'lesson-summary',
      eyebrow: 'Complete',
      title: 'Read the mark as a movement cue',
      instruction:
        'You now have a visual map for noticing tones in future words and dialogues.',
      takeaways: [
        'First tone stays high and level.',
        'Second tone rises; third tone dips and turns.',
        'Fourth tone falls directly from high to low.',
      ],
      knowledgeIds: ['pinyin.tone-shapes'],
    },
  ],
})

