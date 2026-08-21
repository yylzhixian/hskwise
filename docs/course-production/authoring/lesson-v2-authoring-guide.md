# Lesson v2 与 AI 辅助创作指南

本文面向课程作者、AI 生产脚本和人工审核者。`lesson/v2` 的目标不是让 JSON 尽可能短，而是让课程内容脱离 React 和运行时代码后仍可独立理解、校验和追溯。

## 1. 文件与命令

- 课程 JSON：`src/courses/content/lessons/*.v2.json`
- Zod 事实源：`src/courses/schema/lesson-schema.ts`
- 生成的 JSON Schema：`schemas/lesson-v2.schema.json`
- compiler：`src/courses/compiler/compile-lesson-v2.ts`
- 发布审计：`src/courses/compiler/audit-lesson-publishability.ts`

常用命令：

```text
bun run content:validate
bun run content:schema:generate
bun run content:schema:check
```

`content:validate` 对目录内全部 v2 课程执行结构、答案、资源、知识点和跨课程引用检查。草稿中的发布阻断项会汇总显示，但不会让草稿校验失败。

## 2. 顶层结构

```json
{
  "$schema": "../../../../schemas/lesson-v2.schema.json",
  "schemaVersion": "lesson/v2",
  "id": "stable-lesson-id",
  "type": "dialogue",
  "meta": {},
  "objectives": [],
  "resources": {
    "media": [],
    "dialogues": [],
    "lexemes": []
  },
  "steps": []
}
```

- `meta` 保存标题、描述、等级、时长和话题。
- `objectives` 是本课允许引用的知识点清单；每个活动必须关联其中至少一个知识点。
- `resources` 集中保存媒体、对话和词条，活动只引用稳定 ID。
- `steps` 使用标准交互原语，不使用页面或组件名称。
- 路线、节点和前置关系由路线 manifest 持有，不进入课程 JSON。

## 3. CP1 支持的活动

| type | 用途 | 默认完成规则 |
|---|---|---|
| `content-explore/v1` | 场景、语境、词汇聚焦和总结 | 主动继续 |
| `audio-explore/v1` | 逐句播放对话 | 必需媒体完成 |
| `single-choice/v1` | 普通、听力或语境选择 | 答对后继续 |
| `ordering/v1` | 文本或对话行排序 | 排序正确后继续 |
| `role-play/v1` | 多轮角色练习 | 媒体流程完成 |
| `active-recall/v1` | 揭示后诚实自评 | 提交信息性结果 |
| `cloze/v1` | 首批选择式填空 | 答对后继续 |

答案使用独立 `answer` 字段，不在 option 中保存 `isCorrect`。`interactionId`、`completionRule` 和媒体完成 ID 由 compiler 稳定派生。

## 4. AI 辅助生产边界

AI 可以接收：

- 官方能力目标和已复核的知识点 ID。
- 目标等级允许使用的词汇、汉字和语法约束。
- 抽象教学顺序、活动类型、步骤数量和内容长度。
- 全新场景、角色和沟通任务要求。
- `lesson/v2` JSON Schema、原创内容规范和审核清单。

AI 不得接收教材课文、对话、例句、题目、答案、图片或音频作为“改写”输入。教材 OCR 只进入教学方法统计，不能作为正式课程生成上下文。

推荐的生成输入是原创 Brief：

```json
{
  "goal": "初次见面时问候并介绍姓名",
  "level": "hsk3-1",
  "allowedKnowledgeIds": [
    "dialogue.greeting-ni-hao",
    "dialogue.self-introduction-jiao"
  ],
  "constraints": {
    "dialogueTurns": 4,
    "newWordsMax": 5,
    "scenarioMustBeOriginal": true,
    "sourceTextAllowed": false
  },
  "sequence": [
    "content-explore/v1",
    "audio-explore/v1",
    "single-choice/v1",
    "role-play/v1"
  ]
}
```

AI 输出只能进入 draft。通过语言、教学、答案、来源、相似度和版权人工审核后，才能进入发布清单。

## 5. 资源与版权

每个媒体资源都必须声明：

- `origin`：`original`、`licensed`、`generated-placeholder` 或 `restricted-reference`。
- `publishable`：当前是否允许发布。
- `mustReplaceBeforePublish`：发布前是否必须替换。
- 已许可媒体在发布前补齐 `licenseId` 和 `attribution`。

`generated-placeholder` 必须同时满足 `publishable: false` 和 `mustReplaceBeforePublish: true`。`restricted-reference` 永远不能发布。草稿可以预览这些资源，但发布审计会阻断它们。

## 6. 试点结论

CP1 的对话与词汇 v2 JSON 合计 507 行，原 v1 TypeScript 内容合计 488 行。v2 没有通过隐藏信息追求更短：媒体权利、目标和资源引用都显式存在。

其实际改进是：

- JSON 不再包含 import、helper、函数或动态派生逻辑。
- 选项与答案分离，审核者可以直接定位答案字段。
- 课程不再耦合路线、节点、组件和运行时 action。
- 词条到另一门课程对话 token 的来源引用可以由 compiler 验证。
- IDE 使用生成的 JSON Schema 在编辑时提示结构问题。
- 错误可以定位到具体文件字段路径，适合 AI 自动修订后再次校验。

共享协议的价值会随着课程数量增长而摊薄；不能仅用首批两个 JSON 的行数判断生产效率。
