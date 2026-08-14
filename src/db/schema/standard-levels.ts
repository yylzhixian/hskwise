import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

import {
  sourceDatasetEnum,
  standardVersionEnum,
  timestamps,
  type JsonRecord,
  type SourceDatasetCode,
  type StandardLevel,
} from './common'

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
