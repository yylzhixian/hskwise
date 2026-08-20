import { learningRouteSchema } from '../model/route-schema'

export const starterRoute = learningRouteSchema.parse({
  id: 'hsk3-level-1-starter',
  title: 'HSK 3.0 Level 1',
  level: 'Starter route',
  description:
    'Build a sound-first foundation, then use it in your first greeting.',
  stages: [
    {
      id: 'starter-foundations',
      title: 'Starter foundations',
      description:
        'Connect Mandarin sound, meaning, and recall through four short steps.',
      nodes: [
        {
          id: 'node-four-tones',
          lessonId: 'four-tones',
          title: 'Meet the four tones',
          shortTitle: 'Four tones',
          description:
            'Hear how pitch changes meaning and trace the four tone shapes.',
          kind: 'lesson',
          courseType: 'pinyin',
          estimatedMinutes: 7,
          knowledgeIds: [
            'pinyin.tone-shapes.tone1',
            'pinyin.tone-shapes.tone2',
            'pinyin.tone-shapes.tone3',
            'pinyin.tone-shapes.tone4',
          ],
          prerequisiteNodeIds: [],
        },
        {
          id: 'node-first-greeting',
          lessonId: 'first-greeting',
          title: 'Your first greeting',
          shortTitle: 'First greeting',
          description:
            'Read and respond to an original greeting between two new classmates.',
          kind: 'lesson',
          courseType: 'dialogue',
          estimatedMinutes: 8,
          knowledgeIds: [
            'dialogue.greeting-ni-hao',
            'dialogue.self-introduction-jiao',
          ],
          prerequisiteNodeIds: ['node-four-tones'],
        },
        {
          id: 'node-first-words',
          lessonId: 'first-words',
          title: 'Your first words',
          shortTitle: 'First words',
          description:
            'Recall the core greeting words and use them in a fresh prompt.',
          kind: 'lesson',
          courseType: 'vocabulary',
          estimatedMinutes: 7,
          knowledgeIds: ['vocabulary.first-greeting-set'],
          prerequisiteNodeIds: ['node-first-greeting'],
        },
        {
          id: 'node-starter-checkpoint',
          lessonId: 'starter-checkpoint',
          title: 'Starter checkpoint',
          shortTitle: 'Checkpoint',
          description:
            'Check tone recognition, greeting meaning, and first-word recall.',
          kind: 'checkpoint',
          courseType: 'checkpoint',
          estimatedMinutes: 6,
          knowledgeIds: ['checkpoint.starter-foundations'],
          prerequisiteNodeIds: ['node-first-words'],
        },
      ],
    },
  ],
})

export const starterRouteId = starterRoute.id
