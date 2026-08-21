# CP1 Lesson Schema v2 与编译器

| 项目 | 结果 |
|---|---|
| 阶段 | CP1 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-21 |
| 对应计划 | [规模化课程生产基础开发计划](../13-course-production-foundation-plan.md) |
| 下一阶段 | CP2：Renderer Registry 与运行时收敛 |

## 1. 本阶段范围

CP1 建立课程 JSON 到现有 Lesson Runtime 的最小数据链路，不改动学习页面和 renderer：

- 建立统一 `lesson/v2` envelope、metadata、objectives、resources 和 activities。
- 为对话与词汇双试点实现 7 个交互原语 schema。
- 建立纯函数 compiler、字段级引用错误、实现字段禁入和媒体发布审计。
- 生成供 IDE 和外部生产工具使用的 JSON Schema。
- 将现有原创 `first-greeting` 与 `first-words` 迁移为并行 v2 JSON 试点。
- 保留全部 v1 内容、schema、renderer 和课程入口作为行为基线。

## 2. 协议实现

`src/courses/schema/` 现在包含：

- 公共稳定 ID、作者文本、知识点与资源引用约束。
- media、dialogue 和 lexeme 三类首批资源。
- `content-explore/v1`、`audio-explore/v1`、`single-choice/v1`、`ordering/v1`、`role-play/v1`、`active-recall/v1` 和 `cloze/v1`。
- 10 个课程原型可用的统一 `lesson/v2` 外壳；CP1 只实现双试点实际需要的资源与 activity。

JSON 不允许 `routeId`、`nodeId`、`component`、`renderer`、`className`、`style`、`action`、`interactionId` 或 `completionRule`。未知字段由 strict schema 拒绝，关键实现字段在结构解析前给出更明确的错误。

## 3. Compiler 与门禁

`src/courses/compiler/` 完成以下能力：

- 校验活动知识点均来自本课 objectives。
- 校验媒体类型、对话 speaker、line、token、词条和 activity 资源引用。
- 校验词条的跨课程来源，并确认文字、拼音和释义与来源 token 一致。
- 将答案从 option 分离，并校验单选、填空和排序答案集合。
- 从 lesson ID 与 activity ID 派生稳定 interaction/media ID。
- 将 activity 语义编译为当前 `LessonDefinition` 的 continue、interaction 和 media 完成规则。
- 保留主动回忆的 `requireCorrect: false` 信息性自评语义。
- 草稿允许占位媒体；发布审计拒绝 placeholder、restricted、不可发布、待替换和缺失许可信息的媒体。

## 4. 双试点

### `first-greeting-v2-pilot`

- 一个对话资源、两个角色、四句对话和四个占位音频资源。
- 覆盖内容导入、逐句音频、理解选择、对话排序、角色扮演和总结。
- compiler 输出的完成规则顺序与 v1 行为一致。

### `first-words-v2-pilot`

- 五个词条和五个占位音频资源。
- 每个词条使用 lesson/dialogue/line/token 四级稳定来源引用关联对话试点。
- 覆盖语境发现、词汇聚焦、词义选择、听音选择、主动回忆、选择式填空和总结。

两个 JSON 目前只用于 schema/compiler 试点，没有注册到用户学习路线，也没有替换 v1 页面内容。

## 5. 可读性与规模对比

| 指标 | v1 TypeScript 内容 | v2 JSON 试点 |
|---|---:|---:|
| 对话 + 词汇总行数 | 488 | 507 |
| import、helper 或运行函数 | 有 | 0 |
| 路线与节点字段 | 有 | 0 |
| option 内 `isCorrect` | 有 | 0 |
| 媒体发布权利状态 | 分散在媒体对象 | 集中且可审计 |
| 跨课程词条来源 | TypeScript 动态查找 | JSON 稳定引用 + compiler 校验 |

v2 总行数增加约 3.9%，主要来自显式 objectives、资源 ID 和媒体权利。它没有通过隐藏审核信息追求短 JSON；批量生产效率来自共享 schema、AI 可生成结构、字段级校验和无需修改 TSX，而不是首批文件的行数下降。

## 6. 工具与作者入口

- `bun run content:validate`：批量解析、引用校验、编译并汇总草稿发布阻断。
- `bun run content:schema:generate`：从 Zod 生成 `schemas/lesson-v2.schema.json`。
- `bun run content:schema:check`：确认 JSON Schema 未过期。
- [Lesson v2 与 AI 辅助创作指南](../../course-production/authoring/lesson-v2-authoring-guide.md)：说明原创 Brief、AI 输入边界、字段约定和审核流程。

## 7. 发布状态

两门试点结构和引用均有效，但当前共有 27 条预期发布阻断：

- 对话课 4 个占位音频产生 12 条阻断。
- 词汇课 5 个占位音频产生 15 条阻断。
- 每个占位资源分别因 `generated-placeholder`、`publishable: false` 和 `mustReplaceBeforePublish: true` 被明确报告。

这证明草稿预览与正式发布门禁已经分离。CP1 没有将占位媒体标记为可发布。

## 8. 验证记录

| 检查 | 结果 |
|---|---|
| `bun run content:analyze:check` | 通过，CP0 OCR 报告保持一致 |
| `bun run content:schema:check` | 通过，生成的 JSON Schema 未过期 |
| `bun run content:validate` | 通过，2 门 v2 课程有效并报告 27 条预期草稿发布阻断 |
| `bunx tsc --noEmit` | 通过 |
| `bun run lint` | 通过 |
| `bun run test` | 通过，65 项测试无失败 |
| `bun run build` | 通过，Next.js 生产构建及 8 个静态页面生成成功 |
| `git diff --check` | 通过 |

## 9. 已知限制

- 目前只实现 7 个双试点需要的原语；其余原语在出现真实内容 fixture 时分阶段加入。
- v2 尚未接入 renderer registry，因此用户当前仍运行 v1 课程。
- JSON Schema 提供结构提示；跨资源、答案和发布语义仍以 compiler/Zod 为事实源。
- 尚未建立 review sidecar、published catalog、内容 revision 和相似度预警，这些属于后续生产管线。
- 音频仍为占位素材，正式发布前必须替换并完成 rights review。

## 10. CP2 进入条件

统一 schema、compiler、双试点、JSON Schema、批量校验和发布阻断均已通过，CP2 可以开始建立 renderer contract、registry 和领域 hooks。CP2 首先接通两门 v2 试点，不同时扩展新的课程类型。
