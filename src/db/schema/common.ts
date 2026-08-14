import { sql } from 'drizzle-orm'
import { integer } from 'drizzle-orm/sqlite-core'

/**
 * Schema notes:
 * - Turso/libSQL stores timestamps as Unix seconds.
 * - JSON columns are SQLite text columns with Drizzle `mode: 'json'`.
 * - HSK standard versions and levels stay readable strings for future HSK 4.0.
 * - Low-cardinality internal states use integer codes to reduce row size.
 */
export type EnumCode<T extends Record<string, number>> = T[keyof T]

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

export type Hsk2Level = (typeof hsk2LevelEnum)[number]
export type Hsk3Level = (typeof hsk3LevelEnum)[number]
export type StandardLevel = Hsk2Level | Hsk3Level
export type SourceDatasetCode = EnumCode<typeof sourceDatasetEnum>
export type UserStatusCode = EnumCode<typeof userStatusEnum>
export type UserRoleCode = EnumCode<typeof userRoleEnum>
export type GoalTypeCode = EnumCode<typeof goalTypeEnum>
export type GoalStatusCode = EnumCode<typeof goalStatusEnum>
export type SessionStatusCode = EnumCode<typeof sessionStatusEnum>
export type DeviceTypeCode = EnumCode<typeof deviceTypeEnum>
export type LexicalItemKindCode = EnumCode<typeof lexicalItemKindEnum>

export const timestamps = {
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
export type JsonRecord = Record<string, unknown>
