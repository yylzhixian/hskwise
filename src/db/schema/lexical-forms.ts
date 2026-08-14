import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

import { lexicalItems } from './lexical-items'
import { timestamps, type JsonRecord } from './common'

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
