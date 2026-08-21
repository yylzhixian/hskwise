# FE6-P3 Daily review 答题流程校准

| 项目 | 结果 |
|---|---|
| 子阶段 | FE6-P3 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-21 |
| 影响页面 | `/review` |
| 数据与 API | 错题记录新增可选 `acceptedAnswers`；无后端 API |

## 1. 问题

原 Daily review 只要求用户在心中回忆，然后点击 `Reveal answer`。用户没有可见的作答动作，也没有留下自己的回答，揭示答案后只能凭印象选择 `Review again` 或 `I recalled it`，容易不知道应该回忆什么、如何判断。

## 2. 新流程

复习改为“开放作答 + 参考答案对照”：

1. 页面展示一条明确问题和 `Your answer` 输入区。
2. 用户输入汉字、拼音、顺序或简短解释后，点击 `Check my answer`。
3. 系统提交后自动判定，并列展示用户回答与参考答案，不再要求二次自评。
4. 答案匹配时等价于原 `My answer matches`：完成复习项并解除关联错题。
5. 答案不匹配时等价于原 `Needs more review`：保留复习项并安排 10 分钟后重试。
6. 不知道答案时可直接选择 `I don't know yet`，立即查看参考答案并安排 10 分钟后复习。

这让用户必须先参与提取练习，再看到答案，同时去掉答案出现后的二次自评，减少重复操作。

## 3. 判定边界

`MistakeRecord` 新增可选 `acceptedAnswers`，新产生的声调、词汇、对话、检查点与 lesson/v2 错题都会从课程结构写入明确答案。复习判定只做规范化后的精确匹配：忽略大小写、空格、标点和拼音声调符号，但不使用包含判断或模糊相似度，避免把近似错误答案判成正确。

旧版浏览器存档没有 `acceptedAnswers` 时，会从纠正文案中保守提取连续汉字、括号内拼音或明确声调名称。无法提取时按 `needs-review` 处理，避免误判为掌握。该字段保持可选，因此不需要升级存储版本，也不会使现有本地进度失效。

## 4. 组件与状态

- 新增 shadcn `Textarea` 公共基础组件。
- 新增页面专用 `ReviewAnswerForm`，负责输入与答案对照。
- `useReviewSession` 聚合作答判定与队列提交：正确提交 `recalled`，错误和不知道提交 `needs-review`。
- 正确、错误、不知道分别显示 `Answer matched`、`Needs more review`、`Scheduled for another look`，避免混淆错误与主动跳过。
- 继续使用现有 `submitLearningReviewAtom`；`recalled` 解除关联错题，`needs-review` 延后 10 分钟。
- 没有在 `app` 目录加入组件或业务逻辑。

## 5. 视觉与可访问性

- 延续暗色“语音导视”主题，不引入新的卡片视觉体系。
- 题目、答题区和答案对照使用连续分隔线与双栏对照；手机端自动改为纵向排列。
- Textarea 使用显式 label、description 和原生 form submit。
- 主操作在无输入时禁用；所有操作保留键盘焦点与语义化按钮名称。
- `390x844`、`768x1024` 和 `1440x900` 均无横向溢出。

## 6. 验证

| 检查 | 结果 |
|---|---|
| `bunx tsc --noEmit` | 通过 |
| `bun run lint` | 通过 |
| `bun run test` | 通过，74 项测试无失败 |
| `bun run test:e2e` | 通过，3 个视口共 30 项测试无失败 |
| `bun run build` | 由端到端命令执行并通过 |
| `git diff --check` | 通过 |

新增测试覆盖答案规范化、严格匹配、旧记录兼容、正确答案完成错题、错误答案回到复习队列、移除二次自评按钮，以及不知道答案时不显示错误提示。

## 7. 后续方向

第二阶段课程 schema 稳定后，为复习项保存结构化题型引用，而不是复制显示文本。届时 Daily review 可按原始 activity 自动恢复选择题、听辨题、排序题、填空题和开放回答，并继续复用同一 renderer registry。
