import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

import {
  hsk2LevelEnum,
  hsk3LevelEnum,
  timestamps,
  type JsonRecord,
  type LexicalItemKindCode,
  type SourceDatasetCode,
} from './common'

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
