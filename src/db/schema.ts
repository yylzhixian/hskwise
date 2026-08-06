import { relations, sql } from 'drizzle-orm'
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

/**
 * Schema notes:
 * - Turso/libSQL stores timestamps as Unix seconds.
 * - JSON columns are SQLite text columns with Drizzle `mode: 'json'`.
 * - HSK standard versions and levels stay readable strings for future HSK 4.0.
 * - Low-cardinality internal states use integer codes to reduce row size.
 */
type EnumCode<T extends Record<string, number>> = T[keyof T]

export const standardVersionEnum = [
  'hsk2', // 旧版 HSK 1-6 级标准。
  'hsk3', // HSK 3.0 新标准，含 1-6 和合并的 7-9 级。
] as const

export const hsk2LevelEnum = [
  '1', // HSK 2.0 一级。
  '2', // HSK 2.0 二级。
  '3', // HSK 2.0 三级。
  '4', // HSK 2.0 四级。
  '5', // HSK 2.0 五级。
  '6', // HSK 2.0 六级。
] as const

export const hsk3LevelEnum = [
  '1', // HSK 3.0 一级。
  '2', // HSK 3.0 二级。
  '3', // HSK 3.0 三级。
  '4', // HSK 3.0 四级。
  '5', // HSK 3.0 五级。
  '6', // HSK 3.0 六级。
  '7-9', // HSK 3.0 七至九级合并等级。
] as const

export const authProviderEnum = [
  'google', // Google OAuth / OIDC 登录账号。
] as const

export const sourceDatasetEnum = {
  // 官网 HSK 大纲资料，主要用于标准等级和官方字表。
  officialHskSyllabus: 1,
  // complete-hsk-vocabulary 开源数据，主要用于词汇和 forms。
  completeHskVocabulary: 2,
  // 人工维护或校正的数据。
  manual: 3,
} as const

export const userStatusEnum = {
  // 正常可登录用户。
  active: 1,
  // 后台或风控禁用，保留账号但禁止登录。
  disabled: 2,
  // 用户注销后的软删除状态。
  deleted: 3,
} as const

export const userRoleEnum = {
  // 普通学习者，默认角色。
  learner: 1,
  // 教师或辅导者，预留给教师端。
  teacher: 2,
  // 管理员，预留给运营后台。
  admin: 3,
} as const

export const goalTypeEnum = {
  // 以某次 HSK 考试为目标的备考路线。
  currentExam: 1,
  // 按某个 HSK 标准等级长期学习。
  standardLearning: 2,
  // 用户不确定水平时的测级/诊断目标。
  placement: 3,
  // 教师端给学生指定的目标。
  teacherAssigned: 4,
} as const

export const goalStatusEnum = {
  // 当前正在执行的学习目标。
  active: 1,
  // 用户暂时暂停，不参与当日推荐。
  paused: 2,
  // 目标已完成。
  completed: 3,
  // 用户放弃目标，保留历史但不再推荐。
  abandoned: 4,
} as const

export const sessionStatusEnum = {
  // 会话有效，设备仍可使用。
  active: 1,
  // 用户主动退出某台设备或全部设备。
  revoked: 2,
  // 超过 expires_at 后自然过期。
  expired: 3,
} as const

export const deviceTypeEnum = {
  // 无法识别设备类型。
  unknown: 0,
  // 桌面浏览器，例如 PC / Mac。
  desktop: 1,
  // 手机浏览器，例如 iOS / Android phone。
  mobile: 2,
  // 平板浏览器，例如 iPad / Android tablet。
  tablet: 3,
} as const

export const lexicalItemKindEnum = {
  // 词汇条目，包括词、短语，或作为词汇学习的单字。
  vocabulary: 1,
  // 汉字条目，来自认读/书写字表。
  character: 2,
} as const

type Hsk2Level = (typeof hsk2LevelEnum)[number]
type Hsk3Level = (typeof hsk3LevelEnum)[number]
type StandardLevel = Hsk2Level | Hsk3Level
type SourceDatasetCode = EnumCode<typeof sourceDatasetEnum>
type UserStatusCode = EnumCode<typeof userStatusEnum>
type UserRoleCode = EnumCode<typeof userRoleEnum>
type GoalTypeCode = EnumCode<typeof goalTypeEnum>
type GoalStatusCode = EnumCode<typeof goalStatusEnum>
type SessionStatusCode = EnumCode<typeof sessionStatusEnum>
type DeviceTypeCode = EnumCode<typeof deviceTypeEnum>
type LexicalItemKindCode = EnumCode<typeof lexicalItemKindEnum>

const timestamps = {
  // 创建时间，Unix seconds，例如 1785836534。
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(unixepoch())`),
  // 更新时间，Unix seconds；业务写操作需要主动刷新。
  updatedAt: integer('updated_at')
    .notNull()
    .default(sql`(unixepoch())`),
}

// SQLite 没有原生 JSON 类型，Drizzle 会把 JSON 存为 text。
type JsonRecord = Record<string, unknown>

// 1. Users, authentication, and learner goals

/**
 * 产品内用户主表。
 *
 * Google 登录只负责证明身份，最终都要落到一条 users 记录上。
 * 示例 id: `user_01J...`
 */
export const users = sqliteTable(
  'users',
  {
    // 产品内用户主键，不直接使用 Google sub，方便以后支持多登录方式。
    id: text('id').primaryKey(),
    // 主登录邮箱，建议写入小写规范化邮箱；全表唯一。
    email: text('email').notNull(),
    // 邮箱验证时间；Google 返回 email_verified=true 时可写当前时间。
    emailVerifiedAt: integer('email_verified_at'),
    // 产品内展示名；首次登录可取 Google name，后续允许用户修改。
    displayName: text('display_name'),
    // 产品内头像 URL；首次登录可取 Google picture。
    avatarUrl: text('avatar_url'),
    // 用户状态，见 userStatusEnum；默认 active。
    status: integer('status')
      .$type<UserStatusCode>()
      .notNull()
      .default(userStatusEnum.active),
    // 用户角色，见 userRoleEnum；默认 learner。
    role: integer('role')
      .$type<UserRoleCode>()
      .notNull()
      .default(userRoleEnum.learner),
    // 最近一次成功登录时间。
    lastLoginAt: integer('last_login_at'),
    // 用户被禁用时间；仅 status=disabled 时通常有值。
    disabledAt: integer('disabled_at'),
    // 用户软删除或注销时间；仅 status=deleted 时通常有值。
    deletedAt: integer('deleted_at'),
    ...timestamps,
  },
  table => [
    uniqueIndex('users_email_unique').on(table.email),
    index('users_status_idx').on(table.status),
    index('users_role_idx').on(table.role),
  ]
)

/**
 * 第三方登录账号绑定表。
 *
 * Google 的稳定用户 ID 是 OIDC `sub`，应写入 provider_account_id。
 * 不要用邮箱作为 Google 账号唯一键，因为邮箱可能变化。
 */
export const authAccounts = sqliteTable(
  'auth_accounts',
  {
    // 账号绑定记录 ID，例如 `acct_01J...`。
    id: text('id').primaryKey(),
    // 绑定到产品内用户；删除用户时级联删除账号绑定。
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // 登录提供方；第一阶段只支持 google。
    provider: text('provider', { enum: authProviderEnum }).notNull(),
    // 外部账号 ID；Google 登录写 credential payload.sub。
    providerAccountId: text('provider_account_id').notNull(),
    // Google 返回的邮箱快照。
    providerEmail: text('provider_email'),
    // Google 返回的 email_verified 快照。
    providerEmailVerified: integer('provider_email_verified', {
      mode: 'boolean',
    })
      .notNull()
      .default(false),
    // Google profile name 快照。
    providerDisplayName: text('provider_display_name'),
    // Google picture 快照。
    providerAvatarUrl: text('provider_avatar_url'),
    // 首次绑定该第三方账号的时间。
    linkedAt: integer('linked_at')
      .notNull()
      .default(sql`(unixepoch())`),
    // 该第三方账号最近一次登录时间。
    lastLoginAt: integer('last_login_at'),
    // 非敏感扩展 JSON，例如 `{"hd":"example.com"}`；不要存明文 token。
    metadata: text('metadata', { mode: 'json' }).$type<JsonRecord>(),
    ...timestamps,
  },
  table => [
    uniqueIndex('auth_accounts_provider_account_unique').on(
      table.provider,
      table.providerAccountId
    ),
    index('auth_accounts_user_idx').on(table.userId),
    index('auth_accounts_provider_email_idx').on(
      table.provider,
      table.providerEmail
    ),
  ]
)

/**
 * 多设备登录会话表。
 *
 * 一位用户可以有多条 active session。服务端只存 token hash，
 * 请求校验时用 cookie/header 中的明文 token 计算 hash 后匹配。
 */
export const userSessions = sqliteTable(
  'user_sessions',
  {
    // 会话 ID，例如 `sess_01J...`。
    id: text('id').primaryKey(),
    // 会话所属用户；删除用户时级联删除会话。
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Session token 哈希，唯一；绝不保存明文 session token。
    sessionTokenHash: text('session_token_hash').notNull(),
    // 会话状态，见 sessionStatusEnum。
    status: integer('status')
      .$type<SessionStatusCode>()
      .notNull()
      .default(sessionStatusEnum.active),
    // 设备类型，见 deviceTypeEnum；无法识别时为 unknown。
    deviceType: integer('device_type')
      .$type<DeviceTypeCode>()
      .notNull()
      .default(deviceTypeEnum.unknown),
    // 解析或用户命名的设备名，例如 `Chrome on macOS`。
    deviceName: text('device_name'),
    // 登录或最近活跃时的 user agent，用于安全提醒和设备识别。
    userAgent: text('user_agent'),
    // 最近使用 IP；属于个人数据，展示和保留要克制。
    ipAddress: text('ip_address'),
    // 最近登录国家/地区代码，例如 `US`。
    countryCode: text('country_code'),
    // 最近活跃时间；用于设备管理和清理过期会话。
    lastSeenAt: integer('last_seen_at')
      .notNull()
      .default(sql`(unixepoch())`),
    // 会话过期时间；超过后应拒绝并可标记 expired。
    expiresAt: integer('expires_at').notNull(),
    // 用户主动退出该设备或全部设备时写入。
    revokedAt: integer('revoked_at'),
    // 非敏感扩展 JSON，例如浏览器和 OS 解析结果。
    metadata: text('metadata', { mode: 'json' }).$type<JsonRecord>(),
    ...timestamps,
  },
  table => [
    uniqueIndex('user_sessions_token_hash_unique').on(table.sessionTokenHash),
    index('user_sessions_user_status_idx').on(table.userId, table.status),
    index('user_sessions_user_expires_idx').on(table.userId, table.expiresAt),
    index('user_sessions_last_seen_idx').on(table.lastSeenAt),
  ]
)

/**
 * 用户学习偏好和当前水平画像。
 *
 * current_standard_version 与 current_standard_level 必须一起理解；
 * 不使用泛称 hsk_level，避免以后 HSK 4.0 时语义冲突。
 */
export const userProfiles = sqliteTable('user_profiles', {
  // 对应 users.id；一位用户最多一条 profile。
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  // 用户界面语言，IETF locale，例如 `en`、`es`、`zh-CN`。
  locale: text('locale').notNull().default('en'),
  // 当前自评水平采用的标准版本；为空表示还未自评。
  currentStandardVersion: text('current_standard_version', {
    enum: standardVersionEnum,
  }),
  // 当前自评等级；必须结合 current_standard_version 使用。
  currentStandardLevel: text('current_standard_level').$type<StandardLevel>(),
  // Onboarding 问卷 JSON，例如 `{"knownWords":300}`。
  selfAssessment: text('self_assessment', { mode: 'json' }).$type<JsonRecord>(),
  // 学习偏好 JSON，例如 `{"showPinyin":true}`。
  preferences: text('preferences', { mode: 'json' }).$type<JsonRecord>(),
  // 首次完成 onboarding 的时间。
  onboardingCompletedAt: integer('onboarding_completed_at'),
  ...timestamps,
})

/**
 * 用户学习目标。
 *
 * 支持 Brilliant 式路线选择：用户先确定一个目标路线，再围绕它学习。
 * 一个用户可以有多个历史目标，但通常只有一个 active 目标参与推荐。
 */
export const learningGoals = sqliteTable(
  'learning_goals',
  {
    // 学习目标 ID，例如 `goal_01J...`。
    id: text('id').primaryKey(),
    // 目标所属用户。
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // 目标类型，见 goalTypeEnum。
    goalType: integer('goal_type').$type<GoalTypeCode>().notNull(),
    // 目标标准版本，例如 `hsk3`；不能默认，必须由路线决定。
    targetStandardVersion: text('target_standard_version', {
      enum: standardVersionEnum,
    }).notNull(),
    // 目标等级，例如 `4` 或 `7-9`；必须结合 target_standard_version。
    targetStandardLevel: text('target_standard_level')
      .$type<StandardLevel>()
      .notNull(),
    // 目标考试日期，Unix seconds；长期学习路线可为空。
    targetExamDate: integer('target_exam_date'),
    // 目标状态，见 goalStatusEnum。
    status: integer('status')
      .$type<GoalStatusCode>()
      .notNull()
      .default(goalStatusEnum.active),
    // 目标开始执行时间。
    startedAt: integer('started_at')
      .notNull()
      .default(sql`(unixepoch())`),
    // 目标完成时间；仅 status=completed 时通常有值。
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

/**
 * HSK 标准等级元数据。
 *
 * 用 `standard_version + standard_level` 唯一定位等级，
 * 例如 `hsk3 + 7-9`，避免把 HSK 3.0 简写成泛称 hsk。
 */
export const standardLevels = sqliteTable(
  'standard_levels',
  {
    // 标准等级记录 ID，例如 `hsk3-1`。
    id: text('id').primaryKey(),
    // 标准版本，见 standardVersionEnum。
    standardVersion: text('standard_version', {
      enum: standardVersionEnum,
    }).notNull(),
    // 该标准内的等级代码，例如 `1`、`6`、`7-9`。
    standardLevel: text('standard_level').$type<StandardLevel>().notNull(),
    // 展示名，例如 `HSK 3.0 Level 1`。
    title: text('title').notNull(),
    // 官方能力描述或产品摘要。
    abilityDescription: text('ability_description'),
    // 排序值，越小越靠前；例如 hsk3-1 用 10，hsk3-2 用 20。
    sortOrder: integer('sort_order').notNull(),
    // 当前等级新增词数。
    vocabularyCount: integer('vocabulary_count').notNull().default(0),
    // 到该等级为止的累计词数。
    cumulativeVocabularyCount: integer('cumulative_vocabulary_count')
      .notNull()
      .default(0),
    // 主要来源，默认官网大纲。
    sourceDataset: integer('source_dataset')
      .$type<SourceDatasetCode>()
      .notNull()
      .default(sourceDatasetEnum.officialHskSyllabus),
    // 来源文件、官方说明、修订备注等扩展 JSON。
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

/**
 * 词字通用主表。
 *
 * complete-hsk-vocabulary 里的 vocabulary 和 character JSON 结构一致，
 * 因此合并到一张表，用 item_kind 区分“词汇条目”和“汉字条目”。
 * 同一个 simplified 可以因 item_kind 不同存在两条记录。
 */
export const lexicalItems = sqliteTable(
  'lexical_items',
  {
    // 词字条目 ID，例如 `lex:vocabulary:hsk3:爱好`。
    id: text('id').primaryKey(),
    // 条目类型，见 lexicalItemKindEnum；1=词汇，2=汉字。
    itemKind: integer('item_kind').$type<LexicalItemKindCode>().notNull(),
    // 简体字串，对应 complete-hsk-vocabulary 的 simplified。
    simplified: text('simplified').notNull(),
    // 主部首，对应 complete-hsk-vocabulary 的 radical。
    radical: text('radical'),
    // HSK 2.0 等级，从原始 `old-*` 标签提取，例如 `3`。
    hsk2Level: text('hsk2_level', { enum: hsk2LevelEnum }),
    // HSK 3.0 等级，从原始 `new-*` 标签提取，`new-7` 映射为 `7-9`。
    hsk3Level: text('hsk3_level', { enum: hsk3LevelEnum }),
    // 官网 HSK 3.0 汉字认读等级；通常只用于 item_kind=character。
    hsk3RecognitionLevel: text('hsk3_recognition_level', {
      enum: hsk3LevelEnum,
    }),
    // 官网 HSK 3.0 汉字书写等级；通常只用于 item_kind=character。
    hsk3WritingLevel: text('hsk3_writing_level', { enum: hsk3LevelEnum }),
    // 原始等级标签 JSON，例如 `["new-1","old-3"]`。
    levelTags: text('level_tags', { mode: 'json' }).$type<string[]>(),
    // 词频排名，数字越小越高频。
    frequencyRank: integer('frequency_rank'),
    // 原始词性代码 JSON，对应 complete-hsk-vocabulary 的 pos。
    partOfSpeechTags: text('part_of_speech_tags', { mode: 'json' }).$type<
      string[]
    >(),
    // 首个 form 的繁体，便于列表展示。
    primaryTraditional: text('primary_traditional'),
    // 首个 form 的带调拼音，例如 `ài hào`。
    primaryPinyin: text('primary_pinyin'),
    // 首个 form 的数字声调拼音，例如 `ai4 hao4`。
    primaryNumericPinyin: text('primary_numeric_pinyin'),
    // 首个英文释义，便于列表和搜索结果展示。
    primaryMeaning: text('primary_meaning'),
    // 首选读音音频 URL；音频整理后导入，不存二进制文件。
    primaryAudioUrl: text('primary_audio_url'),
    // 所有 forms 合并后的量词 JSON，例如 `["个"]`。
    classifierWords: text('classifier_words', { mode: 'json' }).$type<
      string[]
    >(),
    // 构件 JSON；第一阶段通常为空，笔顺不入库，按需调用工具库。
    components: text('components', { mode: 'json' }).$type<string[]>(),
    // 例词 JSON；可由 item_kind=vocabulary 的记录反查生成。
    sampleWords: text('sample_words', { mode: 'json' }).$type<string[]>(),
    // forms 数量，便于列表判断是否有多读音/多写法。
    formsCount: integer('forms_count').notNull().default(0),
    // 主要数据来源；complete 词汇写 2，官网字表生成的汉字写 1。
    sourceDataset: integer('source_dataset')
      .$type<SourceDatasetCode>()
      .notNull(),
    // 原始对象、license、官方字表来源、人工校正备注等扩展 JSON。
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

/**
 * 词字 form 明细表。
 *
 * 对应 complete-hsk-vocabulary 的 forms[]。
 * 一个 lexical_item 可以有多个 form，用于多读音、多繁体写法、多义项。
 */
export const lexicalForms = sqliteTable(
  'lexical_forms',
  {
    // Form ID，例如 `lform:爱好:ai4-hao4`。
    id: text('id').primaryKey(),
    // 所属词字条目；删除主条目时级联删除 forms。
    lexicalItemId: text('lexical_item_id')
      .notNull()
      .references(() => lexicalItems.id, { onDelete: 'cascade' }),
    // 繁体写法，对应 form.traditional。
    traditional: text('traditional'),
    // 带调拼音，例如 `ài hào`。
    pinyin: text('pinyin'),
    // 数字声调拼音，例如 `ai4 hao4`。
    numericPinyin: text('numeric_pinyin'),
    // Wade-Giles 转写。
    wadeGiles: text('wade_giles'),
    // 注音符号。
    bopomofo: text('bopomofo'),
    // 国语罗马字。
    romatzyh: text('romatzyh'),
    // 英文释义 JSON，例如 `["interest; hobby"]`。
    meanings: text('meanings', { mode: 'json' }).$type<string[]>(),
    // 量词 JSON，例如 `["个"]`。
    classifiers: text('classifiers', { mode: 'json' }).$type<string[]>(),
    // 当前 form 对应读音的音频 URL；多读音时应分别维护。
    audioUrl: text('audio_url'),
    // form 排序；原始顺序从 0 开始。
    sortOrder: integer('sort_order').notNull().default(0),
    // 原始 form 或人工校正备注等扩展 JSON。
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
  authAccounts: many(authAccounts),
  sessions: many(userSessions),
  goals: many(learningGoals),
}))

export const authAccountsRelations = relations(authAccounts, ({ one }) => ({
  user: one(users, {
    fields: [authAccounts.userId],
    references: [users.id],
  }),
}))

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
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
