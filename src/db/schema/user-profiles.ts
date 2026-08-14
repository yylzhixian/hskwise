import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { users } from './users'
import {
  standardVersionEnum,
  timestamps,
  type JsonRecord,
  type StandardLevel,
} from './common'

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
