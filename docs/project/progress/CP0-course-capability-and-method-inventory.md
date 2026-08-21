# CP0 课程能力与教学方法盘点

| 项目 | 结果 |
|---|---|
| 阶段 | CP0 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-21 |
| 对应计划 | [规模化课程生产基础开发计划](../13-course-production-foundation-plan.md) |
| 下一阶段 | CP1：Lesson Schema v2 与编译器 |

## 1. 本阶段范围

CP0 只建立第二阶段的事实基础和协议边界，不改写现有课程运行时，也不开始 v2 renderer 开发：

- 盘点现有 4 类课程、26 个 step kind、Experience、hooks、完成规则、反馈、错题和媒体能力。
- 对 `docs/textbooks/` 的 25 份 OCR Markdown 做确定性方法统计。
- 将教材栏目和现有课程实现归并为 10 个课程原型与 14 个交互原语。
- 冻结四个 v1 schema，确定 v2 双试点和后续迁移顺序。
- 明确 OCR、原创课程、占位素材与 Hanzi Writer 数据的版权边界。

本阶段没有复制教材正文、题目、图片或音频，也没有把 OCR 文件接入产品构建。

## 2. 主要产物

- [OCR 教学方法频次报告](../../course-production/research/ocr-method-frequency.md)：统计 25 份文档、160585 行文本、8108 个标题和 4516 条学习动作候选行。
- [v1 能力盘点](../../course-production/research/v1-capability-inventory.md)：确认 4 个 schema 共 1076 行、4 个 Experience 共 923 行，并记录现有运行时能力和重复结构。
- [课程原型目录](../../course-production/research/course-archetype-catalog.md)：确定 pronunciation、dialogue、vocabulary、checkpoint 等 10 个原型及 P0/P1/P2 顺序。
- [交互原语目录](../../course-production/research/interaction-primitive-catalog.md)：确定 14 个原语，完成全部 26 个 v1 kind 的逐项映射。
- [等级与密度观察](../../course-production/research/level-density-notes.md)：把 OCR 结论限制为内容密度假设，等级事实仍以官方大纲为准。
- [版权边界](../../course-production/research/copyright-boundary.md)：正式课程必须原创或有明确许可，任何占位或受限素材不得发布。
- `scripts/content/analyze-ocr-methods.ts`：只生成归一化计数的确定性分析工具；`content:analyze:check` 可检测报告是否过期。

## 3. 关键决策

- `pinyinLesson/v1`、`dialogueLesson/v1`、`vocabularyLesson/v1`、`checkpoint/v1` 全部冻结，只接受缺陷修复和版权标记。
- v2 不按教材栏目或页面组件命名；lesson envelope、content resource、activity primitive 和 runtime 分层。
- `first-greeting` 与 `first-words` 是 CP1 双试点；`four-tones` 在 CP3 作为语音体系迁移基准。
- `character-writing/v1` 使用 `hanzi-writer`，课程 JSON 只暴露语义模式和练习 preset。
- `hanzi-writer-data` 由 catalog 驱动按字符抽取并本地按需加载，不把完整数据库打入客户端，也不依赖默认 CDN。
- 自评和自由表达不伪装为自动判对；`isCorrect: null` 保留信息性反馈语义。

## 4. 版权与发布边界

- OCR 教材只用于统计教学环节、学习动作、顺序和密度。
- 课文、对话、例句、题目、答案、图片、音频、人物设定和专有版式不得进入正式课程。
- `generated-placeholder`、`restricted-reference`、`mustReplaceBeforePublish`、`publishable: false` 和未完成 rights review 的素材必须被发布门禁拒绝。
- Hanzi Writer 代码和字形数据分别保留适用的许可证文本与 attribution；字形数据不标记为 HSKWise 原创内容。

## 5. 验证记录

CP0 退出检查全部通过：

| 检查 | 结果 |
|---|---|
| `bun run content:analyze:check` | 通过，生成报告与当前 OCR 输入及规则一致 |
| `bunx tsc --noEmit` | 通过 |
| `bun run lint` | 通过 |
| `bun run test` | 通过，58 项测试无失败 |
| `bun run build` | 通过，Next.js 生产构建和 8 个静态页面生成成功 |
| `git diff --check` | 通过 |

## 6. 已知限制

- OCR 频次受双语重复、标题漏标、HTML 表格和识别错误影响，只能用于优先级判断。
- 官方 HSK 3.0 各等级知识点顺序尚未固化到 schema；CP1 只保留引用结构，不假设完整大纲数据。
- 14 个原语是课程生产边界，不代表 CP1 一次实现全部 renderer。
- 当前 v1 内容仍是 TypeScript，CP1 双试点完成前不能证明 JSON 的实际审核效率。

## 7. CP1 进入条件与首批任务

CP0 产物、逐项映射、版权边界和 v1 冻结完成后进入 CP1。首批任务是建立最小 `lesson/v2` envelope、对话/词汇资源、双试点所需 activity schema、纯函数 compiler、发布门禁和 JSON Schema；v1 在 CP1 保留为行为对照。
