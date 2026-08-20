# FE6-02 混合检查点与错误关联升级开发进度

| 项目 | 结果 |
|---|---|
| 所属阶段 | FE6 生词课程、检查点与复习闭环 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-20 |
| 上一归档 | [FE6-01 首门生词课程](FE6-01-first-vocabulary-course.md) |
| 下一项 | FE6-03 复习页、错题页与答对移出闭环 |

## 1. 本次结论

`/lessons/starter-checkpoint` 已成为 Starter 路线可运行的第四节点。课程以“导入 -> 声调听辨 -> 词义判断 -> 对话回应 -> 拖放排序 -> 路线总结”检查前三课已经学习的能力，不引入新知识；完成后由共享运行时完成路线第四节点并生成 `route-completed` 活动。

## 2. 检查点协议与课程实现

- 新增独立 `checkpoint/v1` Zod 协议和运行时投影，不扩大拼音、对话或生词 schema。
- 四个问题步骤全部使用 `requireCorrect: true`；错误必须重试，正确后才允许推进。
- 听辨题复用四声课第三声占位音频，并保留音频失败时的文字音高 fallback。
- 词义与对话事实从 `firstWordsLesson`、`firstGreetingLesson` 派生；题目编排和干扰项为项目原创。
- 排序题复用公共 ordering hook 与现有 dnd-kit 能力，支持指针和键盘拖放。
- 检查点组件集中在 `src/courses/checkpoint`，路由目录只保留路由定义。

## 3. 错误关联与本地迁移

- `LearningState` 从 v1 升级为 v2。
- `MistakeRecord` 新增 `stepId`、`interactionId`。
- `ReviewItem` 新增 `sourceStepId`、`sourceInteractionId`。
- 新错误按 lesson、node、step、interaction 和 knowledge 去重，检查点的每个错误可以追溯到具体题目。
- 存储适配器优先读取 `hskwise.learning:v2`，并可读取旧 `hskwise.learning:v1`。
- v1 数据迁移时保留路线、错题、复习和活动；旧错误使用 `legacy-unlinked` 标记缺失的历史关联，下一次写入后落到 v2 key 并移除旧 key。

## 4. 素材与版权

- 检查点没有引入教材 OCR 的图片、音频或题目。
- 声调音频继续复用 FE4 已登记的 `generated-placeholder` TTS 素材，带有 `placeholder` 和 `mustReplaceBeforePublish` 标记。
- 公开发布前必须替换为项目原创录制或具有明确授权记录的真人普通话音频。

## 5. 验证

| 检查 | 结果 |
|---|---|
| `bun run lint` | 通过，无 warning |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 54 pass、0 fail、200 assertions |
| `bun run build` | Next.js 16.3.0 生产构建通过 |
| 存储迁移 | v1 错题和复习数据保留并迁移为 v2 |
| 检查点协议 | 已学来源、唯一答案、完整排序集合和运行时投影通过 |
| 浏览器错误路径 | 听辨答错显示错误反馈和 Try again，正确后推进 |
| 浏览器排序 | 键盘拖放可把乱序内容恢复为正确顺序 |
| 浏览器完成态 | 进度到达 100%，显示路线完成摘要与 Return to route |
| `390x844` 窄屏 | 无横向溢出，固定底栏可用，控制台无错误 |

## 6. 未做事项与下一步

- `/review` 和 `/mistakes` 尚未实现，现有真实检查点错误将作为这两个页面的输入。
- 复习项目仍按固定次日到期；尚未实现答对移出、答错重新排期和错题 resolved 状态联动。
- FE6-03 将先建立复习判题与调度纯函数和 atoms，再实现两个页面，避免页面直接修改全局状态。
