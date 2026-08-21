import { z } from 'zod'

import { activeRecallActivitySchema } from './active-recall-schema'
import { audioExploreActivitySchema } from './audio-explore-schema'
import { clozeActivitySchema } from './cloze-schema'
import { contentExploreActivitySchema } from './content-explore-schema'
import { orderingActivitySchema } from './ordering-schema'
import { rolePlayActivitySchema } from './role-play-schema'
import { singleChoiceActivitySchema } from './single-choice-schema'

export const lessonActivitySchema = z.discriminatedUnion('type', [
  contentExploreActivitySchema,
  audioExploreActivitySchema,
  singleChoiceActivitySchema,
  orderingActivitySchema,
  rolePlayActivitySchema,
  activeRecallActivitySchema,
  clozeActivitySchema,
])

export type LessonActivity = z.infer<typeof lessonActivitySchema>
