import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { users } from './users'
import {
  goalStatusEnum,
  standardVersionEnum,
  timestamps,
  type GoalStatusCode,
  type GoalTypeCode,
  type StandardLevel,
} from './common'

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
