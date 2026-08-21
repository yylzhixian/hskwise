# v1 课程协议与能力盘点

| 项目 | 结果 |
|---|---|
| 盘点日期 | 2026-08-21 |
| 课程原型 | 拼音、对话、词汇、检查点，共 4 类 |
| 已发布课程 | `four-tones`、`first-greeting`、`first-words`、`starter-checkpoint` |
| v1 step kind | 26 个课程内判别值 |
| schema 规模 | 4 个 schema 文件约 1076 行 |
| Experience 规模 | 4 个 Experience 文件约 923 行 |
| 决策 | v1 冻结；只修缺陷，不增加新的课程专用 kind |

## 1. 当前协议

### 拼音与声调

`pinyinLesson/v1` 包含 7 种 step：

- `tone-overview`
- `pitch-guide`
- `pronunciation-practice`
- `tone-choice`
- `tone-listening-choice`
- `lesson-check`
- `lesson-summary`

已验证声调资源、音高曲线、示范音频、听辨、选择、录音、自评和多题检查。

### 情境对话

`dialogueLesson/v1` 包含 6 种 step：

- `scene-intro`
- `dialogue-explore`
- `comprehension-choice`
- `line-order`
- `role-practice`
- `dialogue-summary`

已验证角色、逐句 token、拼音与翻译、逐句音频、全部音频完成规则、拖放排序、角色自动轮换、倒计时、录音回听和练习反馈。

### 词汇

`vocabularyLesson/v1` 包含 7 种 step：

- `context-discovery`
- `word-focus`
- `meaning-choice`
- `listening-choice`
- `active-recall`
- `sentence-application`
- `vocabulary-summary`

已验证词条、来源语境、音频、音形义展示、选择、听辨、主动回忆、自评和句中应用。

### 综合检查

`checkpoint/v1` 包含 6 种 step 判别值：

- `checkpoint-intro`
- `meaning-choice`
- `dialogue-choice`
- `listening-choice`
- `line-order`
- `checkpoint-summary`

已验证跨课程来源引用、混合题目、稳定知识点关联、错误记录和路线完成。

## 2. 应保留的运行时能力

- `LessonStoreProvider` 为每门课程建立隔离的 Jotai store。
- `LessonDefinition` 使用 `continue`、`interaction`、`media` 三类完成规则。
- attempt 保留 step、interaction、序号、答案、时间和 `boolean | null` 正确性。
- feedback 区分 `completion`、`correct`、`incorrect`、`info`。
- runtime event 记录 lesson/step/interaction/media 的关键转换。
- 只有需要答对的 interaction 才阻止继续；诚实自评可以提交 `null`。
- 媒体完成、错误回流、复习关联和路线推进已经打通。

这些能力进入 v2 时通过 compiler 和领域 hook 复用，不重写为新的通用播放器。

## 3. 当前重复与耦合

- 四个 Experience 都使用 switch 将课程 step 映射到 React 组件。
- 四个 Experience 重复组织 `submitAnswer`、feedback 标题和 `recordMistake`。
- 三套选择题分别定义 option、正确答案约束和反馈字段。
- 两套 `line-order` 分别处理对话行和 checkpoint item。
- intro、overview、focus 和 summary 本质都是受控内容探索，却被定义为多个课程专用 kind。
- `lesson-check` 把多个题目封装在一个 step 内，削弱单题 attempt 和审核粒度。
- 课程 schema 同时包含课程事实、页面文案和运行时派生信息。

## 4. v1 冻结规则

- 四个 v1 schema 已添加冻结标记。
- 允许修复 schema 缺陷、版权标记和现有课程行为。
- 禁止为新课程在 v1 中增加 `z.literal` 或扩大现有 enum。
- 新题型先归类到交互原语目录；确需新增时进入 `lesson/v2`。
- v1 在四门现有课程迁移、内容 diff 审核和必要 smoke path 通过后删除。

## 5. v2 双试点

### `first-greeting`

选择原因：包含资源引用密度最高的角色、对话行、token、音频、排序和角色扮演，可以验证 resource resolver 与复杂媒体 activity。

### `first-words`

选择原因：依赖对话来源，又包含选择、听辨、主动回忆和句中应用，可以验证跨课程引用、答案分离和共享原语。

`four-tones` 保留为 CP3 语音体系迁移基准；`starter-checkpoint` 在 assessment policy 稳定后迁移，避免 CP1 同时解决所有问题。
