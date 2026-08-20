# FE6-P1 主动回忆反馈语义校准

| 项目 | 结果 |
|---|---|
| 所属阶段 | FE6 生词课程校准 |
| 校准项 | `Need another look` 不应呈现为答错 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-20 |
| 关联归档 | [FE6-01 首门生词课程](FE6-01-first-vocabulary-course.md) |

## 1. 问题与结论

- `Need another look` 是学习者对回忆状态的诚实自评，不是有标准答案的判题失败。
- 原实现提交 `isCorrect: false`，导致共享运行时生成 `incorrect` 反馈和 `interaction.incorrect` 事件，虽然允许继续，但视觉和事件语义均不准确。
- 现在自评未记住时提交 `isCorrect: null`，显示 `info` 类型的 `Added to review` 提示；仍写入错题与复习队列，并保持 Continue 可用。
- `I recalled it` 仍提交 `isCorrect: true`，显示成功反馈且不加入复习。

## 2. 运行时调整

共享互动结果现在明确区分三种语义：

| `isCorrect` | 反馈类型 | 结果事件 |
|---|---|---|
| `true` | `correct` | `interaction.correct` |
| `false` | `incorrect` | `interaction.incorrect` |
| `null` | `info` | 只记录 `interaction.submitted` |

`SubmitLessonAttemptInput`、Jotai action 和 `useLessonStep` 新增 `infoFeedback`，课程组件不需要直接选择 Alert 样式。

## 3. 验证

| 检查 | 结果 |
|---|---|
| `bun run lint` | 通过 |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 48 pass、0 fail、182 assertions |
| `bun run build` | Next.js 16.3.0 生产构建通过 |
| 运行时测试 | 中性自评保存 `isCorrect: null`，不产生 `interaction.incorrect` |
| 浏览器反馈 | `data-feedback-kind="info"`，显示黄色 `Added to review` |
| 浏览器操作 | Continue 可用，不显示 Try again |

## 4. 保持不变

- `Need another look` 仍会按 knowledge id 写入错题与次日复习队列。
- 真正选择题答错仍使用红色 `incorrect` 反馈并要求 Try again。
- 本次不改变复习排期、错题去重或本地持久化协议。
