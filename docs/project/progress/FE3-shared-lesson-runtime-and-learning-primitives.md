# FE3 共享课程运行时与学习原语开发进度

| 项目 | 结果 |
|---|---|
| 阶段 | FE3 |
| 状态 | 已完成 |
| 开始日期 | 2026-08-19 |
| 完成日期 | 2026-08-19 |
| 对应计划 | [前端学习体验分阶段开发计划](../12-frontend-learning-experience-development-plan.md) |
| 上一阶段 | [FE2 路线模型、路线 UI 与情景模拟器](FE2-route-model-ui-and-scenario-simulator.md) |
| 下一阶段 | FE4 拼音与声调课程 |

## 1. 本阶段结论

HSKWise 已具备不依赖具体课程类型的前端课程运行底座。`/lessons/runtime-lab` 可以完整模拟进入课程、逐步作答、即时反馈、重试、音频、录音、完成和返回路线的学习过程，并覆盖媒体不可用和权限拒绝等降级情景。

本阶段完成：

- 建立纯 Lesson Session 状态机、Zod 协议和一次性完成事件。
- 建立按课程实例隔离的 Jotai Immer Store、语义 write atoms 和领域 hooks。
- 建立无课程类型分支的 Lesson Frame、固定进度区、步骤区、反馈区和操作栏。
- 提取选择、排序、反馈、音频和录音共享学习原语。
- 建立浏览器/fixture 媒体 adapter，并覆盖音频和录音完整状态集。
- 建立原创 Runtime Lab，验证共享能力和窄组件边界。
- 将课程完成桥接到 FE2 的路线进度动作，同时保持两种 Store 相互隔离。

本阶段没有实现拼音、对话、生词或检查点正式课程，没有接数据库、后端 API、云端媒体或真实语音评分。

## 2. 运行时与状态边界

### 2.1 纯状态机

- `LessonDefinitionSchema` 校验课程、步骤、互动和媒体 ID，并拒绝重复 ID。
- `lesson-session-machine` 负责提交尝试、错误重试、媒体完成、步骤推进和整课完成。
- 必须答对的互动不能跳过；媒体未完成时不能推进；整课完成事件只产生一次。
- 判题文本规范化和排序比较下沉到 `learning-core`，Course Studio 原有判题复用同一纯函数。

### 2.2 Jotai Immer Store

- `lessonStore` 通过 factory 创建，不存在模块级可变单例。
- `LessonStoreProvider` 只通过 Context 传递 store 实例，不嵌套 Jotai Provider 遮蔽根 learning store。
- 嵌套会话更新由 `atomWithImmer` 承担；组件只调用 `submitAnswer`、`retry`、`completeMedia` 和 `continueLesson` 等语义动作。
- `useLessonSession`、`useLessonStep` 和 `useLessonCompletion` 分别聚合会话、当前步骤和跨 Store 完成桥接。
- 切换 lesson 或 fixture 会创建新 store，临时选择、反馈和媒体状态不会串到下一会话。

### 2.3 数据流

```text
课程定义
  -> lesson-session-machine
    -> lesson atoms / selectors
      -> domain hooks
        -> Lesson Frame + 课程类型组件

媒体控件
  -> audio / recording hook
    -> browser 或 fixture adapter

lesson completed
  -> useLessonCompletion
    -> learningStore.completeNode（正式路线课程接入时）
```

## 3. 共享学习原语

| 原语 | 已验证能力 |
|---|---|
| Lesson Frame | 退出、稳定进度、单任务内容区、预留反馈区、稳定底部操作栏 |
| Choice Interaction | 键盘可达选择、提交、正确/错误反馈、立即重试 |
| Ordering Interaction | 上移/下移排序、提交和顺序判定 |
| Interaction Feedback | success、warning、destructive 语义反馈，不只依赖颜色 |
| Audio Control | loading、playing、paused、unavailable、blocked、error 和 fallback 完成 |
| Recording Control | idle、requesting、recording、recorded、denied、unsupported、error 和 fallback 完成 |

Lesson Frame 不识别 `pinyin`、`dialogue`、`vocabulary` 等课程类型。只有内部 Runtime Lab 根据自己的步骤 ID 选择演示组件，FE4 起由各课程类型组件负责自身语义和布局。

音频和录音控件使用动态加载；路线页和不含媒体的课程步骤不会提前加载媒体叶子组件。

## 4. Runtime Lab 情景矩阵

内部开发入口：`/lessons/runtime-lab`。它包含六个原创步骤：欢迎、选择、排序、音频、录音和完成。

| fixture | 预期结果 |
|---|---|
| `normal` | 可完成全部六步，进度到 100% |
| `audio-loading` | 显示加载状态 |
| `audio-playing` / `audio-paused` | 播放状态和控制一致 |
| `audio-unavailable` / `audio-blocked` / `audio-error` | 明确警示，可用 fallback 完成当前步骤 |
| `microphone-requesting` / `microphone-recording` / `microphone-recorded` | 权限、录制和完成状态一致 |
| `microphone-denied` / `microphone-unsupported` / `microphone-error` | 明确警示，可用 fallback 完成当前步骤 |

开发情景切换器只在开发环境渲染；生产学习界面不显示内部 fixture 工具。

## 5. 行为与视觉验收

完整主路径已在浏览器中验证：

1. 欢迎步骤继续后进度更新。
2. 选择题答错显示原因且不能推进，重试答对后可以继续。
3. 排序题按正确顺序提交后可以继续。
4. 音频可播放、暂停并完成步骤。
5. 录音可进入录制、结束和已录制状态并完成步骤。
6. 最终动作只完成一次，进度到 100%，可返回学习路线。

| 页面/情景 | 视口 | 横向溢出 | 遮挡 | 结果 |
|---|---:|---|---|---|
| Runtime Lab 正常路径 | `390x844` | 无 | 无 | 通过 |
| `microphone-denied` 降级 | `390x844` | 无 | 无 | 通过 |
| `audio-blocked` 降级 | `768x1024` | 无 | 无 | 通过 |
| Runtime Lab 正常路径 | `1440x1000` | 无 | 无 | 通过 |

反馈区始终预留稳定空间，错误、成功和媒体警示不会挤动主体或底部操作栏；移动端和平板端的正文、按钮和 alert 均无重叠。

## 6. 质量验证

| 命令 | 结果 |
|---|---|
| `bun run lint` | 通过 |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 34 pass、0 fail、99 assertions |
| `bun run build` | 通过；`/lessons/[lessonId]` 按请求服务 |

新增测试覆盖：

- 课程协议、步骤推进、强制答对、重试、媒体完成和单次完成事件。
- Store factory 隔离、语义 action 和 selector 结果。
- 音频与录音 fixture adapter 的状态转换和清理。
- Course Studio 判题提取到共享纯函数后的兼容行为。

Next 16.3 的 Turbopack PostCSS 运行时统一使用官方默认的 `childProcesses` 隔离模式，避免实验性 worker thread 在生产构建中串用解析状态。

## 7. 版权与素材状态

- 本阶段没有读取或复制 `docs/textbooks` 的教材正文、图片、音频或 OCR 内容。
- Runtime Lab 的标题、题目、反馈和步骤数据均为项目原创内部验证内容。
- fixture 音频和录音只模拟状态，没有携带教材或第三方媒体文件。
- 本阶段没有新增发布素材，也没有需要在代码中伪装为正式素材的占位文件。
- FE4 若使用临时音频、图片或发音示意，必须显式标记 `placeholder` 和 `mustReplaceBeforePublish`，发布前替换为原创或已授权素材。

## 8. 已知限制

- Runtime Lab 是内部共享能力验收页，不是面向学习者发布的正式课程。
- 浏览器 media adapter 已实现控制边界，当前验收重点是可重复 fixture；真实教学音频和设备录音在 FE4 随正式课程验收。
- 当前会话刷新后重新开始；课程中途恢复和云端持久化不属于纯前端 Alpha。
- 路线完成桥接已具备，但 Runtime Lab 没有 route node ID，因此不会污染 Starter 路线进度。
- mistake 与 review 的正式课程事件写入在 FE4-FE6 随真实题目和复习闭环落地。

## 9. FE4 进入条件与第一批任务

FE4 可直接开始，首批任务按以下顺序执行：

1. 冻结首门《认识普通话四声》的原创教学目标、完成脚本和素材占位清单。
2. 定义窄范围 `PinyinLessonSchema` 和第二份复用 fixture，不扩展万能步骤协议。
3. 实现声调观察、分步讲解、听辨、跟读和课末检查等拼音专用组件。
4. 用 FE3 的 Lesson Frame、选择、反馈、音频、录音和完成桥接组成正式课程。
5. 接入 `four-tones` 路线节点，验证完成后路线解锁且错误进入待复习数据。
6. 完成移动、平板、桌面、键盘和媒体异常验收，并独立归档 FE4。

FE4 继续遵守：内容数据可校验、素材来源可追溯、版权占位必须标记，不接数据库和后端 API，不恢复 Course Studio 产品化。
