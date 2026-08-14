import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

import {
  timestamps,
  userRoleEnum,
  userStatusEnum,
  type UserRoleCode,
  type UserStatusCode,
} from './common'

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
