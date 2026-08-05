import { relations, sql } from 'drizzle-orm'
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

// Business meanings for enum values live in docs/project/05-db-schema.md.
type EnumCode<T extends Record<string, number>> = T[keyof T]

export const standardVersionEnum = ['hsk2', 'hsk3'] as const
export const hsk2LevelEnum = ['1', '2', '3', '4', '5', '6'] as const
export const hsk3LevelEnum = ['1', '2', '3', '4', '5', '6', '7-9'] as const

export const sourceDatasetEnum = {
  officialHskSyllabus: 1,
  completeHskVocabulary: 2,
  manual: 9,
} as const

export const userRoleEnum = {
  learner: 1,
  teacher: 2,
  admin: 9,
} as const

export const goalTypeEnum = {
  currentExam: 1,
  standardLearning: 2,
  placement: 3,
  teacherAssigned: 4,
} as const

export const goalStatusEnum = {
  active: 1,
  paused: 2,
  completed: 3,
  abandoned: 4,
} as const

export const lexicalItemKindEnum = {
  vocabulary: 1,
  character: 2,
} as const

type Hsk2Level = (typeof hsk2LevelEnum)[number]
type Hsk3Level = (typeof hsk3LevelEnum)[number]
type StandardLevel = Hsk2Level | Hsk3Level
type SourceDatasetCode = EnumCode<typeof sourceDatasetEnum>
type UserRoleCode = EnumCode<typeof userRoleEnum>
type GoalTypeCode = EnumCode<typeof goalTypeEnum>
type GoalStatusCode = EnumCode<typeof goalStatusEnum>
type LexicalItemKindCode = EnumCode<typeof lexicalItemKindEnum>

const timestamps = {
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at')
    .notNull()
    .default(sql`(unixepoch())`),
}

type JsonRecord = Record<string, unknown>

// 1. Users and learner goals

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    nickname: text('nickname'),
    avatar: text('avatar'),
    role: integer('role')
      .$type<UserRoleCode>()
      .notNull()
      .default(userRoleEnum.learner),
    ...timestamps,
  },
  table => [
    uniqueIndex('users_email_unique').on(table.email),
    index('users_role_idx').on(table.role),
  ]
)

export const userProfiles = sqliteTable('user_profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  locale: text('locale').notNull().default('en'),
  currentStandardVersion: text('current_standard_version', {
    enum: standardVersionEnum,
  }),
  currentStandardLevel: text('current_standard_level').$type<StandardLevel>(),
  selfAssessment: text('self_assessment', { mode: 'json' }).$type<JsonRecord>(),
  preferences: text('preferences', { mode: 'json' }).$type<JsonRecord>(),
  ...timestamps,
})

export const learningGoals = sqliteTable(
  'learning_goals',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    goalType: integer('goal_type').$type<GoalTypeCode>().notNull(),
    targetStandardVersion: text('target_standard_version', {
      enum: standardVersionEnum,
    }).notNull(),
    targetStandardLevel: text('target_standard_level')
      .$type<StandardLevel>()
      .notNull(),
    targetExamDate: integer('target_exam_date'),
    status: integer('status')
      .$type<GoalStatusCode>()
      .notNull()
      .default(goalStatusEnum.active),
    startedAt: integer('started_at')
      .notNull()
      .default(sql`(unixepoch())`),
    completedAt: integer('completed_at'),
    ...timestamps,
  },
  table => [
    index('learning_goals_user_status_idx').on(table.userId, table.status),
    index('learning_goals_target_idx').on(
      table.targetStandardVersion,
      table.targetStandardLevel
    ),
  ]
)

// 2. HSK standards and public content data

export const standardLevels = sqliteTable(
  'standard_levels',
  {
    id: text('id').primaryKey(),
    standardVersion: text('standard_version', {
      enum: standardVersionEnum,
    }).notNull(),
    standardLevel: text('standard_level').$type<StandardLevel>().notNull(),
    title: text('title').notNull(),
    abilityDescription: text('ability_description'),
    sortOrder: integer('sort_order').notNull(),
    vocabularyCount: integer('vocabulary_count').notNull().default(0),
    cumulativeVocabularyCount: integer('cumulative_vocabulary_count')
      .notNull()
      .default(0),
    sourceDataset: integer('source_dataset')
      .$type<SourceDatasetCode>()
      .notNull()
      .default(sourceDatasetEnum.officialHskSyllabus),
    metadata: text('metadata', { mode: 'json' }).$type<JsonRecord>(),
    ...timestamps,
  },
  table => [
    uniqueIndex('standard_levels_version_level_unique').on(
      table.standardVersion,
      table.standardLevel
    ),
    index('standard_levels_sort_idx').on(
      table.standardVersion,
      table.sortOrder
    ),
  ]
)

export const lexicalItems = sqliteTable(
  'lexical_items',
  {
    id: text('id').primaryKey(),
    itemKind: integer('item_kind').$type<LexicalItemKindCode>().notNull(),
    simplified: text('simplified').notNull(),
    radical: text('radical'),
    hsk2Level: text('hsk2_level', { enum: hsk2LevelEnum }),
    hsk3Level: text('hsk3_level', { enum: hsk3LevelEnum }),
    hsk3RecognitionLevel: text('hsk3_recognition_level', {
      enum: hsk3LevelEnum,
    }),
    hsk3WritingLevel: text('hsk3_writing_level', { enum: hsk3LevelEnum }),
    levelTags: text('level_tags', { mode: 'json' }).$type<string[]>(),
    frequencyRank: integer('frequency_rank'),
    partOfSpeechTags: text('part_of_speech_tags', { mode: 'json' }).$type<
      string[]
    >(),
    primaryTraditional: text('primary_traditional'),
    primaryPinyin: text('primary_pinyin'),
    primaryNumericPinyin: text('primary_numeric_pinyin'),
    primaryMeaning: text('primary_meaning'),
    primaryAudioUrl: text('primary_audio_url'),
    classifierWords: text('classifier_words', { mode: 'json' }).$type<
      string[]
    >(),
    components: text('components', { mode: 'json' }).$type<string[]>(),
    sampleWords: text('sample_words', { mode: 'json' }).$type<string[]>(),
    formsCount: integer('forms_count').notNull().default(0),
    sourceDataset: integer('source_dataset')
      .$type<SourceDatasetCode>()
      .notNull(),
    metadata: text('metadata', { mode: 'json' }).$type<JsonRecord>(),
    ...timestamps,
  },
  table => [
    uniqueIndex('lexical_items_kind_simplified_unique').on(
      table.itemKind,
      table.simplified
    ),
    index('lexical_items_kind_idx').on(table.itemKind),
    index('lexical_items_hsk3_idx').on(table.hsk3Level),
    index('lexical_items_hsk3_recognition_idx').on(table.hsk3RecognitionLevel),
    index('lexical_items_hsk3_writing_idx').on(table.hsk3WritingLevel),
    index('lexical_items_hsk2_idx').on(table.hsk2Level),
    index('lexical_items_pinyin_idx').on(table.primaryNumericPinyin),
    index('lexical_items_frequency_idx').on(table.frequencyRank),
  ]
)

export const lexicalForms = sqliteTable(
  'lexical_forms',
  {
    id: text('id').primaryKey(),
    lexicalItemId: text('lexical_item_id')
      .notNull()
      .references(() => lexicalItems.id, { onDelete: 'cascade' }),
    traditional: text('traditional'),
    pinyin: text('pinyin'),
    numericPinyin: text('numeric_pinyin'),
    wadeGiles: text('wade_giles'),
    bopomofo: text('bopomofo'),
    romatzyh: text('romatzyh'),
    meanings: text('meanings', { mode: 'json' }).$type<string[]>(),
    classifiers: text('classifiers', { mode: 'json' }).$type<string[]>(),
    audioUrl: text('audio_url'),
    sortOrder: integer('sort_order').notNull().default(0),
    metadata: text('metadata', { mode: 'json' }).$type<JsonRecord>(),
    ...timestamps,
  },
  table => [
    uniqueIndex('lexical_forms_item_numeric_unique').on(
      table.lexicalItemId,
      table.traditional,
      table.numericPinyin
    ),
    index('lexical_forms_item_idx').on(table.lexicalItemId),
    index('lexical_forms_numeric_pinyin_idx').on(table.numericPinyin),
  ]
)

// 3. Relations used by Drizzle query helpers

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  goals: many(learningGoals),
}))

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}))

export const learningGoalsRelations = relations(learningGoals, ({ one }) => ({
  user: one(users, {
    fields: [learningGoals.userId],
    references: [users.id],
  }),
}))

export const lexicalItemsRelations = relations(lexicalItems, ({ many }) => ({
  forms: many(lexicalForms),
}))

export const lexicalFormsRelations = relations(lexicalForms, ({ one }) => ({
  lexicalItem: one(lexicalItems, {
    fields: [lexicalForms.lexicalItemId],
    references: [lexicalItems.id],
  }),
}))
