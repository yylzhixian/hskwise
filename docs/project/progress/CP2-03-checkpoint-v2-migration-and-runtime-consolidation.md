# CP2-03 检查点 v2 迁移与运行时收束

| 项目 | 结果 |
|---|---|
| 阶段 | CP2-03 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-21 |
| 对应计划 | [规模化课程生产基础开发计划](../13-course-production-foundation-plan.md) |
| 所属阶段 | CP2：Renderer Registry 与运行时收敛 |
| 下一子阶段 | CP3：语音与拼音课程体系 |

## 1. 本阶段范围

CP2-03 将 Starter 路线的综合检查迁移为正式 `lesson/v2` JSON，并用已有标准活动完成整门课：

- `content-explore/v1` 承担检查点导入和总结。
- 三个 `single-choice/v1` 分别检查声调听辨、词义和对话回应。
- `ordering/v1` 通过拖放恢复初次见面的自然顺序。
- 四道题都使用 `requireCorrect` 完成规则；答错会进入现有 Mistakes 与 review queue，重试答对后才能继续。
- `/lessons/starter-checkpoint` 原 URL、route ID、node ID 和路线进度协议保持不变。

本阶段不迁移四声课程。四声课依赖声调轮廓、发音示范、录音回听等专用体验，属于 CP3 语音原语范围。

## 2. 课程数据与资源边界

新增 `starter-checkpoint.v2.json`，课程正文只包含可审核的元数据、目标、资源引用、活动和答案，不包含 React 组件、样式、route placement 或内部 atom/action。

检查点复用已经学过的 knowledge ID，不引入新知识。声调题暂时引用本地生成音频占位，并明确标记：

- `origin: generated-placeholder`
- `publishable: false`
- `mustReplaceBeforePublish: true`

内容审计因此保留 3 条检查点发布阻断；它们是预期门禁，不是校验失败。发布前必须替换为原创或明确授权音频。

## 3. Registry 与运行时收束

正式 v2 registry 现在包含：

```text
first-greeting
  -> first-words
      -> starter-checkpoint
```

依赖只用于编译和资源引用校验。路线 placement 继续由 `LessonView` 从 route manifest 注入，JSON 不反向依赖路线。

删除 `checkpoint-experience.tsx` 及其课程页面分支。检查点提交、反馈、错题记录和完成推进统一经过：

- `V2LessonExperience`
- `useLessonActivity`
- `useLessonMistakeLink`
- `LessonActivityRenderer`

正式 v1 registry 现在只保留尚待 CP3 迁移的四声课程。

## 4. 排序组件校准

检查点证明 `ordering/v1` 不只服务对话音频。共享拖放组件新增受控描述参数：

- 对话排序仍显示“按听到的顺序排列”，并保留说话人标签。
- 纯文本排序显示“排列成自然顺序”，不再显示无意义的 `Sequence` 角色名。

拖放实现、按钮、禁用态和答案提交协议没有分叉，也没有新增检查点专用组件。

## 5. 回归覆盖

新增或调整的验证覆盖：

- checkpoint JSON 的 schema、依赖和 compiler 输出。
- 六个步骤依次编译为两个 continue 和四个必须答对的 interaction。
- 正式 v2 registry 发布 checkpoint，v1 registry 不再发布它。
- route manifest 能派生 checkpoint 的 route/node placement。
- renderer 静态回归包含纯文本 ordering 展示路径。
- 原正式 URL 展示 v2 首步，不落入 preview 或旧 Experience。
- 完整检查点覆盖音频结束、选择题错误重试、拖放排序、路线达到 100% 和错题页记录。

## 6. 验证结果

| 检查 | 结果 |
|---|---|
| `bun run content:schema:check` | 通过，JSON Schema 未过期 |
| `bun run content:validate` | 通过，3 门正式 v2 课程有效；保留 30 条预期草稿发布阻断 |
| `bunx tsc --noEmit` | 通过 |
| `bun run lint` | 通过 |
| `bun run test` | 通过，76 项测试无失败 |
| `bunx playwright test` | 通过，3 个视口共 39 项测试无失败 |
| `bun run build` | 通过 |
| `git diff --check` | 通过 |

端到端覆盖 `390x844`、`768x1024` 和 `1440x900`。检查点的选择、拖放、底部操作区、完成返回和错题展示在三种视口均通过。

## 7. CP2 收束结论

CP2 已完成标准活动链路的收束。对话、词汇和综合检查都由 JSON + registry 渲染；新增同类 activity 不再修改课程页面 switch。

仍保留的 v1 对话、词汇和检查点 schema/内容只作为 legacy fixture 参与回归，不是正式页面入口。暂不立即删除它们，避免在 CP3 迁移四声课之前同时扩大协议清理范围。

四声课程是最后一个正式 v1 Experience。它没有被强行映射为通用选择题，因为这样会丢失声调可视化与发音练习语义。CP3 首先建立语音专用原语，再迁移四声课并评估统一清理全部 v1 fixture。

## 8. CP3 第一批任务

1. 以现有四声课程为行为基准，列出声调轮廓、示范音频、听辨、倒计时录音和回听所需状态。
2. 定义首批语音 activity schema 和 renderer contract，优先覆盖现有体验而非一次设计完整拼音系统。
3. 将四声课写成原创、可审核的 `lesson/v2` JSON，并保留所有占位素材发布门禁。
4. 用唇音声母与单韵母两组原创 fixture 验证组件可复用性。
