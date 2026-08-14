import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

import { users } from './users'
import {
  authProviderEnum,
  timestamps,
  type JsonRecord,
} from './common'

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
