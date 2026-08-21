# CP2-01 Renderer Registry 与 v2 双试点运行链路

| 项目 | 结果 |
|---|---|
| 阶段 | CP2-01 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-21 |
| 对应计划 | [规模化课程生产基础开发计划](../13-course-production-foundation-plan.md) |
| 所属阶段 | CP2：Renderer Registry 与运行时收敛 |
| 下一子阶段 | CP2-02：正式课程迁移与 Experience 去重 |

## 1. 本阶段范围

CP2-01 将 CP1 的两门 `lesson/v2` JSON 试点接入现有 Lesson Runtime，首次形成从结构化课程内容到可交互页面的完整前端链路：

```text
lesson/v2 JSON
  -> parse / validate
  -> resolve resources
  -> compile runtime definition
  -> renderer registry
  -> semantic actions
  -> Lesson Runtime / feedback / mistakes
```

本阶段只开放两个独立试点 URL，不修改 Starter 路线，不替换现有四门 v1 正式课程：

- `/lessons/first-greeting-v2-pilot`
- `/lessons/first-words-v2-pilot`

## 2. Renderer 契约与 Registry

新增统一 `ActivityRendererProps`，向 renderer 只提供四类输入：

- schema 校验后的 `activity`。
- 解析完成的 `resources`。
- `disabled`、`ready` 等最小运行状态。
- `submitResponse`、`completeMedia`、`assessRecall` 等语义动作。

唯一 registry 覆盖 CP1 的 7 个原语：

| Activity type | Renderer |
|---|---|
| `content-explore/v1` | 场景、语境、词汇聚焦和总结 |
| `audio-explore/v1` | 逐句音频探索 |
| `single-choice/v1` | 文本、词条、对话和音频选择 |
| `ordering/v1` | 文本或对话行拖放排序 |
| `role-play/v1` | 角色选择、自动轮换、录音和回听 |
| `active-recall/v1` | 揭示后自评 |
| `cloze/v1` | 选择式句中填空 |

映射使用显式、静态可分析的 `next/dynamic` 导入。JSON 不包含组件名、动态模块路径或运行时 ID。TypeScript mapped type 保证 registry 必须穷尽当前 discriminated union，新增 schema 分支而未注册 renderer 时会产生类型错误。

## 3. 资源解析

新增纯函数资源解析层，将作者友好的引用转换成 renderer 可直接消费的普通对象：

- 对话行获得已解析的音频地址、标签和占位状态。
- 词条获得本课音频及跨课程来源语境。
- `first-words-v2-pilot` 的词条语境从 `first-greeting-v2-pilot` 的 lesson、dialogue、line、token 稳定引用解析。
- 输出只包含可序列化的 record 和数组，可安全穿过 Server Component 到 Client Component 边界。

资源解析继续复用 CP1 校验器。无效引用在进入 renderer 之前失败，不在 UI 内静默猜测内容。

## 4. 领域 Hook 与状态边界

新增 `useLessonActivity` 聚合当前 activity、runtime completion rule、反馈和语义提交：

- renderer 不拼接 interaction ID 或 media ID。
- 正确、错误、信息型自评反馈由领域层集中转换。
- 错误通过 `useLessonMistakeLink` 关联 lesson、step、interaction 和 knowledge ID。
- 试点没有路线 placement，因此不会污染正式路线错题和学习进度。
- 主动回忆的 `Need another look` 保持信息提示，同时准备好未来接入正式路线后的复习关联。

选择题内部选择状态收敛到 `useActivityChoice`。公共 Hook 使用窄 Jotai 写入订阅，没有让 renderer 直接读写 atom、localStorage 或底层 session state。

## 5. 现有组件复用

对话与词汇组件从 v1 专用 schema 类型改为共享结构化 view model，视觉和交互实现保持不变。v1 内容仍可结构兼容地使用这些组件，v2 renderer 也不需要复制一套 UI。

角色练习额外完成两项协议对齐：

- `countdownSeconds` 与 `handoffDelayMs` 真正由 activity schema 驱动；v1 缺省时仍使用 3 秒和 1000 毫秒。
- `roleRefs` 与 `lineRefs` 按 JSON 作者顺序解析，不被资源声明顺序覆盖。

## 6. 页面接入策略

`app` 目录没有新增组件、Hook 或业务逻辑。现有动态 lesson route 继续只转发参数到 `LessonView`。

`LessonView` 先查找 v2 pilot registry，再回退到现有 v1 published lesson registry。两个试点使用独立 ID，因此：

- `/lessons/first-greeting` 和 `/lessons/first-words` 行为不变。
- `/learn` 路线节点及正式进度不变。
- v2 可以在相同 LessonChrome、LessonFrame 和 runtime 中独立对照验证。

## 7. 测试与验证

| 检查 | 结果 |
|---|---|
| `bunx tsc --noEmit` | 通过 |
| `bun run lint` | 通过 |
| `bun run test` | 通过，68 项测试无失败 |
| `bun run content:schema:check` | 通过 |
| `bun run content:validate` | 通过，2 门课程有效，保留 27 条预期草稿发布阻断 |
| `bun run build` | 通过，Next.js 生产构建和 8 个静态页面生成成功 |
| `git diff --check` | 通过 |

新增回归覆盖：

- 本地对话音频和跨课程词条语境解析。
- registry 的 7 个 activity type 穷尽性。
- 两个 pilot 的 JSON 步骤和 runtime 步骤一致。
- 7 个 renderer 均可用真实试点 activity 完成静态渲染。

浏览器在 `1280x720` 和 `390x844` 验证：

- v2 对话首屏正常渲染，4 条音频完成后从 `0 / 4 listened` 变为 `4 / 4 listened`。
- 错误选择显示可重试反馈，重试后正确答案解锁 Continue。
- v2 词汇首屏显示跨课程解析的 `你好！我叫林月。`、拼音、翻译与三个词条。
- 移动端无横向溢出；header、主滚动区和固定 footer 没有重叠。
- 原 `/lessons/first-greeting` v1 URL 仍正常显示原课程，浏览器控制台无错误。

## 8. 素材与版权状态

两个试点使用的 9 个音频仍是 `generated-placeholder`，仅用于交互和教学流程验证。它们在 UI 中显示 `TTS placeholder`，并继续满足：

- `publishable: false`
- `mustReplaceBeforePublish: true`
- 发布前必须替换为原创或已取得明确授权的音频

本阶段没有复制或发布 `docs/textbooks` 中的 OCR 文本、图片或音频。教材只继续作为教学方法研究来源。

## 9. 已知限制

- CP2 尚未完成；四声课、正式对话课、正式词汇课和检查点仍使用 v1 Experience。
- `useActivityAttempt` 与 `useLessonMedia` 还没有从现有专用 Hook 中进一步提取；CP2-02 应在出现第二个真实复用点时收敛，避免只改名不减复杂度。
- 两门 v2 试点没有 route placement，因此错误反馈可验证，但不会写入正式错题和复习队列。
- 角色练习的浏览器麦克风授权流程未在自动验收中触发；已有 v1 单测、复用组件和静态 renderer 回归覆盖结构边界。
- 动态 renderer 目前按 activity 原语拆分；后续应结合构建分析判断是否需要按课程原型合并过细 chunk。

## 10. CP2-02 进入条件

双试点已经证明 JSON、资源解析、runtime 和 registry 可以连通。下一子阶段按以下顺序推进：

1. 对照 v1/v2 完整走通对话排序、角色练习、主动回忆和填空交互。
2. 为正式课程补 route placement，并验证错题、复习和课程完成桥接。
3. 先将正式对话课与词汇课迁移到 v2 registry，保持原 URL 和路线 ID 不变。
4. 删除对应两个 Experience 中已被 `useLessonActivity` 与 renderer 取代的重复提交 switch。
5. 再评估四声课与检查点所需的新原语，不提前删除仍在使用的 v1 schema。
