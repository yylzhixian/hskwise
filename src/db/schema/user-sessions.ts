import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

import { users } from './users'
import {
  deviceTypeEnum,
  sessionStatusEnum,
  timestamps,
  type DeviceTypeCode,
  type JsonRecord,
  type SessionStatusCode,
} from './common'

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
