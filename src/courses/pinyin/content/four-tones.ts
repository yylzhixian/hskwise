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
  estimatedMinutes: 12,
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
      optionToneNumbers: [1, 2, 3, 4],
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
      optionToneNumbers: [1, 2, 3, 4],
      correctToneNumber: 4,
      correctFeedback:
        'The fourth tone falls without turning upward. Its grave accent follows that drop.',
      incorrectFeedback:
        'Choose the path that starts high and ends low without a turn.',
      knowledgeIds: ['pinyin.tone-shapes.tone3', 'pinyin.tone-shapes.tone4'],
    },
    {
      id: 'four-tones-listening-level',
      kind: 'tone-listening-choice',
      eyebrow: 'Listen 1 of 3',
      title: 'Hear a steady pitch',
      instruction:
        'Play the sample before choosing. The answer stays hidden until the sound ends.',
      prompt: 'Which tone did you hear?',
      optionToneNumbers: [1, 2, 3, 4],
      correctToneNumber: 1,
      correctFeedback:
        'The voice stayed high and level from beginning to end: first tone.',
      incorrectFeedback:
        'Listen for whether the pitch moves. This sample holds one steady height.',
      audio: {
        src: '/audio/placeholders/pinyin/tone-sample-a.mp3',
        label: 'Listening sample A',
        contentOrigin: 'generated-placeholder',
        placeholder: true,
        mustReplaceBeforePublish: true,
      },
      knowledgeIds: ['pinyin.tone-shapes.tone1'],
    },
    {
      id: 'four-tones-listening-turning',
      kind: 'tone-listening-choice',
      eyebrow: 'Listen 2 of 3',
      title: 'Catch the low turn',
      instruction:
        'Focus on the middle of the sound. Does the pitch keep moving or change direction?',
      prompt: 'Which tone did you hear?',
      optionToneNumbers: [1, 2, 3, 4],
      correctToneNumber: 3,
      correctFeedback:
        'The pitch dipped low before turning upward: third tone.',
      incorrectFeedback:
        'Replay the sample and listen for the turn near the bottom.',
      audio: {
        src: '/audio/placeholders/pinyin/tone-sample-b.mp3',
        label: 'Listening sample B',
        contentOrigin: 'generated-placeholder',
        placeholder: true,
        mustReplaceBeforePublish: true,
      },
      knowledgeIds: ['pinyin.tone-shapes.tone3'],
    },
    {
      id: 'four-tones-listening-falling',
      kind: 'tone-listening-choice',
      eyebrow: 'Listen 3 of 3',
      title: 'Notice a direct drop',
      instruction:
        'Listen for a clean fall without a turn at the bottom.',
      prompt: 'Which tone did you hear?',
      optionToneNumbers: [1, 2, 3, 4],
      correctToneNumber: 4,
      correctFeedback:
        'The pitch dropped directly from high to low: fourth tone.',
      incorrectFeedback:
        'Replay the sample. This pitch falls once and does not turn upward.',
      audio: {
        src: '/audio/placeholders/pinyin/tone-sample-c.mp3',
        label: 'Listening sample C',
        contentOrigin: 'generated-placeholder',
        placeholder: true,
        mustReplaceBeforePublish: true,
      },
      knowledgeIds: ['pinyin.tone-shapes.tone4'],
    },
    {
      id: 'four-tones-pronunciation-practice',
      kind: 'pronunciation-practice',
      eyebrow: 'Speak',
      title: 'Follow the four-tone sequence',
      instruction:
        'Listen once, then record the same syllable across all four pitch paths.',
      target: 'mā · má · mǎ · mà',
      referenceAudio: {
        src: '/audio/placeholders/pinyin/ma-four-tones.mp3',
        label: 'Four-tone ma sequence',
        contentOrigin: 'generated-placeholder',
        placeholder: true,
        mustReplaceBeforePublish: true,
      },
      knowledgeIds: [
        'pinyin.tone-shapes.tone1',
        'pinyin.tone-shapes.tone2',
        'pinyin.tone-shapes.tone3',
        'pinyin.tone-shapes.tone4',
      ],
    },
    {
      id: 'four-tones-lesson-check',
      kind: 'lesson-check',
      eyebrow: 'Final check',
      title: 'Connect marks, paths, and pitch',
      instruction:
        'Answer five short questions. Each mistake becomes a future review item.',
      knowledgeIds: ['pinyin.tone-shapes'],
      questions: [
        {
          id: 'check-level',
          prompt: 'Which pitch path stays high and level?',
          optionToneNumbers: [1, 2, 3, 4],
          correctToneNumber: 1,
          correctFeedback: 'First tone holds one high pitch.',
          incorrectFeedback: 'Choose the path that does not rise or fall.',
          knowledgeIds: ['pinyin.tone-shapes.tone1'],
        },
        {
          id: 'check-rising',
          prompt: 'Which tone rises toward the end?',
          optionToneNumbers: [1, 2, 3, 4],
          correctToneNumber: 2,
          correctFeedback: 'Second tone rises from lower to higher.',
          incorrectFeedback: 'Look for the path that finishes higher.',
          knowledgeIds: ['pinyin.tone-shapes.tone2'],
        },
        {
          id: 'check-turning',
          prompt: 'Which tone dips before it turns upward?',
          optionToneNumbers: [1, 2, 3, 4],
          correctToneNumber: 3,
          correctFeedback: 'Third tone has the low turn.',
          incorrectFeedback: 'Choose the only path with three pitch points.',
          knowledgeIds: ['pinyin.tone-shapes.tone3'],
        },
        {
          id: 'check-falling',
          prompt: 'Which tone falls directly from high to low?',
          optionToneNumbers: [1, 2, 3, 4],
          correctToneNumber: 4,
          correctFeedback: 'Fourth tone makes one direct fall.',
          incorrectFeedback: 'Choose the falling path without a turn.',
          knowledgeIds: ['pinyin.tone-shapes.tone4'],
        },
        {
          id: 'check-mark',
          prompt: 'Which pitch path belongs to mǎ?',
          optionToneNumbers: [1, 2, 3, 4],
          correctToneNumber: 3,
          correctFeedback: 'The caron in mǎ marks the third tone.',
          incorrectFeedback: 'Match the caron with the low turning path.',
          knowledgeIds: ['pinyin.tone-shapes.tone3'],
        },
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
        'Second tone rises.',
        'Third tone dips and turns.',
        'Fourth tone falls directly from high to low.',
      ],
      knowledgeIds: ['pinyin.tone-shapes'],
    },
  ],
})
