# 前端学习体验分阶段开发计划

本文是 [HSKWise 网站整体规划与正式开发主线](11-website-master-plan.md) 下的当前前端执行子计划。当前阶段只实现前端 UI、课程运行逻辑、本地模拟数据和用户学习情景，不接数据库，不调用后端 API，也不以登录系统作为进入学习的前置条件。

| 项目 | 当前值 |
|---|---|
| 决策日期 | 2026-08-19 |
| 文档状态 | 当前前端执行计划 |
| 预计周期 | 5-7 周，约 25-33 个工程日 |
| 目标版本 | Frontend Learning Alpha |
| 数据方式 | 本地 TypeScript + Zod + 版本化 localStorage |
| UI 方向 | Brilliant 的专注结构 + Duolingo 的路线、触感和反馈 |
| 课程策略 | 每种课程独立数据协议和组件，共享稳定的学习原语与运行时 |

## 1. 目标与边界

### 1.1 本阶段要证明的事情

本阶段不是制作静态 UI Demo，而是证明以下产品链路可以在纯前端环境完整运行：

```text
选择学习目标
  -> 进入 Starter 路线
  -> 完成拼音课程
  -> 完成对话课程
  -> 完成生词课程
  -> 完成检查点
  -> 错误进入复习
  -> 刷新后继续学习
```

需要同时证明：

- Brilliant / Duolingo 融合风格能够形成一致的学习产品，而不是页面拼贴。
- 路线节点、课程步骤、互动反馈和复习回流能够自然衔接。
- 拼音、对话、生词三类课程既有真实差异，又能复用共同组件。
- 本地状态模型足够稳定，未来可以把存储适配器替换成 API，而不重写 UI 和课程组件。

### 1.2 明确包含

- `/` 目标入口。
- `/learn` 当前学习页。
- `/learn/routes/[routeId]` 路线地图。
- `/lessons/[lessonId]` 沉浸课程。
- `/review` 本地复习队列。
- `/mistakes` 本地错题列表。
- 四节点 `HSK 3.0 Level 1 Starter` 路线。
- 拼音、对话、生词、检查点四种课程组件。
- 本地学习进度、尝试、错题、复习和事件日志。
- 正常、返回学习、答错、音频失败、麦克风拒绝等模拟情景。
- 桌面、平板、移动端、键盘和 reduced-motion 验收。

### 1.3 明确不包含

- 数据库、migration、Drizzle 数据写入。
- Elysia / Eden 课程、进度或用户 API。
- 服务端 Google 登录、session 和设备管理。
- 云同步和多设备同步。
- 真正的个性化推荐算法。
- AI 口语评分、ASR、TTS 服务和作文批改。
- Admin、课程编辑器和发布后台。
- 完整 HSK 一级内容。
- 付费、订阅和多语言完整本地化。

## 2. 前端交付结果

完成后，仓库应提供一个无需后端即可演示的真实学习产品：

1. 新用户选择 HSK 3.0 系统学习。
2. 路线页突出当前节点，其他节点根据状态完成、锁定或待复习。
3. 用户完成四种课程，获得即时反馈并推进路线。
4. 错误被记录并在复习页面重新出现。
5. 刷新或关闭页面后，进度可以从本地恢复。
6. 开发者可以切换预设情景，演示返回用户、待复习用户和媒体错误用户。
7. 所有课程内容来自可校验数据，不散落在 JSX 中。
8. 后续增加第二门同类型课程时，不需要复制课程外壳和运行逻辑。
9. 拼音、对话、生词组件各用第二份内容 fixture 渲染通过，证明复用不依赖首课特例。

## 3. 用户学习情景

开发过程使用固定 fixture，而不是靠手工反复修改 localStorage。

| Fixture | 初始状态 | 用于验证 |
|---|---|---|
| `new-learner` | 无目标、无进度 | 首次目标选择、第一课启动、空状态 |
| `active-learner` | 完成四声课，当前为对话课 | `/learn` Continue、路线状态、返回学习 |
| `review-due` | 有两个到期错题 | 今日复习、复习完成、路线优先级 |
| `mixed-mistakes` | 听辨、生词各有一次错误 | 错题分类、重试和答对后移出 |
| `course-complete` | 四个节点全部完成 | 完成态、下一阶段预告和进度总结 |
| `audio-unavailable` | 指定音频资源不可用 | 缺失、加载失败、重试和不阻断课程 |
| `microphone-denied` | 录音能力返回权限拒绝 | 权限说明、跳过、自我练习替代路径 |
| `storage-unavailable` | localStorage 读写抛错 | 内存降级、状态提示和页面可继续使用 |

开发环境允许通过查询参数或内部情景切换器加载 fixture，例如：

```text
/learn?fixture=active-learner
/lessons/four-tones?fixture=audio-unavailable
```

生产构建不显示情景切换器，fixture 数据与正式本地进度分开。

## 4. 前端架构

### 4.1 分层结构

```text
Next.js 路由与布局
  -> 学习路线页面与课程入口
    -> 课程类型组件
      -> 共享学习组件
        -> shadcn/ui 基础组件

本地课程数据
  -> 各课程独立 Zod schema
    -> 课程类型组件

用户操作
  -> 领域 hooks
    -> Jotai write atoms / Jotai Immer 领域状态
      -> Lesson Session / 路线进度 / 尝试 / 错题 / 复习
        -> 版本化本地存储适配器
```

### 4.2 建议代码结构

```text
src/
  app/
    (learning)/
      learn/
        page.tsx
        routes/[routeId]/page.tsx
      review/page.tsx
      mistakes/page.tsx
      layout.tsx
    (lesson)/
      lessons/[lessonId]/page.tsx
      layout.tsx
    page.tsx

  features/
    learning-state/
      model/
        learning-state.ts
        learning-state-schema.ts
      atoms/
        learning-progress-atoms.ts
        mistake-atoms.ts
        review-atoms.ts
        learning-action-atoms.ts
        learning-selector-atoms.ts
      hooks/
        use-learning-hydration.ts
        use-learning-persistence.ts
        use-learning-progress.ts
        use-learning-actions.ts
        use-mistake-book.ts
        use-review-queue.ts
      storage/
        learning-storage.ts
        memory-storage.ts

    learning-routes/
      model/
        route-schema.ts
        route-progress.ts
      content/
        hsk3-level-1-starter.ts
      components/
        learning-home.tsx
        route-map.tsx
        route-node.tsx
        route-stage.tsx

    lesson-runtime/
      model/
        lesson-session.ts
        learning-event.ts
        attempt.ts
        review-item.ts
      state/
        lesson-session-atom.ts
        lesson-session-action-atoms.ts
        lesson-session-machine.ts
        lesson-store-provider.tsx
      hooks/
        use-lesson-session.ts
        use-lesson-step.ts
        use-lesson-completion.ts
      components/
        lesson-frame.tsx
        lesson-header.tsx
        lesson-progress.tsx
        lesson-action-bar.tsx
        step-feedback.tsx
        lesson-summary.tsx

    courses/
      shared/
        components/
          audio-control.tsx
          choice-group.tsx
          recording-control.tsx
          prompt-block.tsx
          sentence-builder.tsx
          interaction-feedback.tsx
        media/
          audio-adapter.ts
          recorder-adapter.ts
        hooks/
          use-audio-control.ts
          use-recording-control.ts
      pinyin/
        pinyin-lesson-schema.ts
        pinyin-lesson.tsx
        tone-curve.tsx
        tone-listening-step.tsx
      dialogue/
        dialogue-lesson-schema.ts
        dialogue-lesson.tsx
        dialogue-line.tsx
        role-practice-step.tsx
      vocabulary/
        vocabulary-lesson-schema.ts
        vocabulary-lesson.tsx
        vocabulary-card.tsx
        word-recall-step.tsx
      checkpoint/
        checkpoint-schema.ts
        checkpoint-lesson.tsx
      content/
        hsk3-level-1/
          four-tones.ts
          first-greeting.ts
          first-words.ts
          starter-checkpoint.ts
      registry/
        lesson-registry.ts

    learning-simulator/
      fixtures/
      scenario-provider.tsx
      capability-adapters.ts
      dev-scenario-switcher.tsx
```

路由组只组织布局，不改变 URL。`page.tsx` 默认保持 Server Component，只把真正需要浏览器状态、音频、录音或事件处理的叶子组件标记为 Client Component。

状态层不使用全局模块单例承载可变用户状态。应用根部创建跨页面 `learningStore`，单课页面按 `lessonId` 创建隔离的 `lessonStore`；切换课程时销毁旧会话，fixture 测试则注入独立 store，避免测试和课程之间串状态。LessonStore 不通过嵌套 Jotai Provider 遮蔽根 store，而由专用 Context 只传递 store 实例，课程 hooks 使用 Jotai hook 的 `{ store: lessonStore }` 选项访问。

### 4.3 组件边界

四层组件边界必须保持清楚：

1. `components/ui`：shadcn 基础组件，不包含 HSK 或课程业务。
2. `courses/shared`：音频、录音、选项、反馈等跨课程学习原语。
3. `courses/{type}`：拼音、对话、生词、检查点的专用组件和 schema。
4. `lesson-runtime`：步骤推进、尝试、完成、事件和持久化，不理解具体课程视觉。

禁止：

- 把 `kind` 判断散落在 `LessonFrame` 内。
- 建立包含所有课程字段的万能 `LessonStep`。
- 让课程数据携带 React、CSS class、图标字符串或事件处理函数。
- 为了复用而把 `ToneCurve`、`DialogueLine` 等专用语义做成无意义通用卡片。
- 让页面或课程视觉组件直接写底层 writable atom、读取 localStorage 或调用媒体 adapter。
- 建立同时处理路线、课程、音频、录音和复习的 `useLearningApp` 万能 hook。

## 5. 课程组件与数据协议

### 5.1 顶层课程联合类型

顶层只使用判别联合选择课程实现：

```ts
type LessonDefinition =
  | PinyinLessonDefinition
  | DialogueLessonDefinition
  | VocabularyLessonDefinition
  | CheckpointDefinition
```

每个定义包含共同元数据，但步骤数据由各自 schema 管理：

```ts
type LessonMeta = {
  id: string
  kind: 'pinyin' | 'dialogue' | 'vocabulary' | 'checkpoint'
  title: LocalizedText
  objectives: string[]
  estimatedMinutes: number
  knowledgeRefs: string[]
  assetRefs: string[]
}
```

`lesson-registry` 只负责根据 `lessonId` 找到元数据、内容和按需加载器，不负责把所有课程渲染成同一结构。

### 5.2 复用矩阵

| 能力 | 拼音 | 对话 | 生词 | 检查点 | 组件归属 |
|---|---:|---:|---:|---:|---|
| 课程外壳和步骤进度 | 是 | 是 | 是 | 是 | `lesson-runtime` |
| 主提示和 Continue | 是 | 是 | 是 | 是 | `lesson-runtime` |
| 单选/多选反馈 | 是 | 是 | 是 | 是 | `courses/shared` |
| 音频播放和错误状态 | 是 | 是 | 是 | 是 | `courses/shared` |
| 录音与回放 | 是 | 是 | 否 | 可选 | `courses/shared` |
| 声调曲线 | 是 | 否 | 可选展示 | 是 | `courses/pinyin` |
| 对话逐句与角色 | 否 | 是 | 否 | 是 | `courses/dialogue` |
| 生词卡和回忆 | 否 | 可点词 | 是 | 是 | `courses/vocabulary` |
| 句子排序 | 否 | 是 | 是 | 是 | `courses/shared` |
| 混合题目编排 | 否 | 否 | 否 | 是 | `courses/checkpoint` |

只有两个及以上课程真实使用且行为一致的能力才放入 `courses/shared`。

### 5.3 课程运行契约

课程类型组件接收统一运行接口：

```ts
type LessonRuntimeProps<TLesson> = {
  lesson: TLesson
  session: LessonSession
  onAnswer: (answer: LessonAnswer) => void
  onContinue: () => void
  onComplete: () => void
  capabilities: LearningCapabilities
}
```

运行时只接收语义事件，例如 `answer submitted`、`audio requested`、`step completed`，不接收 CSS selector、target ID 或通用 action 脚本。

### 5.4 按需加载

- 路线页只加载课程元数据，不加载四种完整课程组件。
- 进入课程时根据已知 `kind` 使用静态可分析路径进行动态 import。
- 录音实现只在包含跟读步骤时加载。
- 不通过动态字符串拼接 import 路径。
- 直接从实现文件导入，避免建立会扩大 bundle 的大型 barrel 文件。

### 5.5 复用证明

每种主要课程组件至少接入两份数据：

| 类型 | 路线正式内容 | 复用验证 fixture |
|---|---|---|
| 拼音 | `four-tones` | `tone-contrast-sample` |
| 对话 | `first-greeting` | `asking-name-sample` |
| 生词 | `first-words` | `daily-items-sample` |

第二份 fixture 只用于开发和测试，不进入四节点路线。验收要求：

- 不修改课程组件即可渲染第二份内容。
- 不增加只服务单份内容的布尔配置。
- 最长标题、句子、拼音和反馈不会破坏布局。
- 数据不支持的教学差异应创建新课程类型，不扩张当前 schema。

## 6. 本地状态与运行逻辑

### 6.1 状态拆分

| 状态 | 生命周期 | 建议位置 |
|---|---|---|
| 当前题目的临时选择 | 当前步骤 | 课程步骤组件本地 state |
| 当前步骤、尝试和反馈 | 当前课程会话 | `lessonStore` 内的 `atomWithImmer` |
| 路线节点完成状态 | 跨页面 | `learningStore` 内的 progress atoms |
| 错题与复习队列 | 跨页面 | `learningStore` 内的 mistake / review atoms |
| 派生完成、锁定和到期状态 | 由领域状态计算 | 只读 selector atoms |
| 音频播放状态 | 当前媒体控件 | 独立 audio hook / adapter |
| 录音状态和 blob URL | 当前跟读步骤 | 独立 recorder hook / adapter |
| fixture 初始学习状态 | 开发会话 | 独立预置 Jotai store |
| fixture 媒体能力 | 开发会话 | `ScenarioProvider` 注入 adapter |

固定采用已安装的 `jotai` 和 `jotai-immer`。不建立一个包含全部 UI、媒体和课程数据的巨大 Context，也不把所有数据塞入单个根 atom。

使用规则：

- `atomWithImmer` 用于 Lesson Session、路线进度、错题和复习队列等有嵌套更新的领域聚合；简单布尔值、ID 和只读派生继续使用普通 atom。
- 领域写操作通过 write atom 表达为 `submitAnswer`、`completeStep`、`completeLesson`、`enqueueReview` 等语义动作；组件不能提交任意 Immer producer。
- 纯判题、状态迁移和复习计算放在 `model` 中，不依赖 React、Jotai 或浏览器 API；atom 只负责编排这些纯函数。
- 组件订阅 `isCurrentNode`、`lessonProgress`、`dueReviewCount` 等最小派生 atom，不订阅完整状态对象后再自行筛选。
- 只读组件使用 `useAtomValue`，只触发动作的组件使用 `useSetAtom` 或封装后的 action hook；不为方便统一使用 `useAtom`。
- Immer 只出现在 atom/state 层，领域对象在组件 props、事件和存储边界上仍视为不可变数据。

### 6.2 Hooks 聚合与依赖方向

hooks 是组件与状态/能力层之间的公开接口，用于聚合一个完整且单一的业务能力：

| Hook | 聚合职责 | 不负责 |
|---|---|---|
| `useLearningHydration` | 恢复、校验和降级状态 | 路线渲染 |
| `useLearningPersistence` | 订阅可持久化切片并写入 adapter | 业务状态迁移 |
| `useLearningProgress` | 当前路线、当前节点、完成摘要 | 写错题、控制媒体 |
| `useLearningActions` | 选择路线、完成节点、重置进度 | 返回整棵 store |
| `useLessonSession` | 会话状态机和会话级语义动作 | localStorage、路线布局 |
| `useLessonStep` | 当前步骤的最小展示状态和提交动作 | 整课统计、页面导航 |
| `useLessonCompletion` | 单次完成桥接与路线解锁 | 具体课程判题 |
| `useMistakeBook` | 错题查询、纠正动作 | 课程媒体能力 |
| `useReviewQueue` | 到期队列和复习结果 | 直接修改课程内容 |
| `useAudioControl` | 音频加载、播放、暂停和错误映射 | 课程推进 |
| `useRecordingControl` | 权限、录制、回放和清理 | 路线进度 |

依赖方向必须保持为 `UI -> domain hook -> atom / pure model -> adapter`。具体约束：

- 页面和课程组件默认只导入领域 hook，不直接导入 writable atom、storage 或媒体 adapter。
- hook 返回语义化字段和稳定动作，例如 `{ currentStep, submitAnswer, retry, continueLesson }`，不返回 `setState`、draft 或完整 store。
- 独立副作用拆成独立 hook；不建立同时监听存储、路由、媒体和课程会话的万能 hook。
- 能在用户事件中完成的逻辑放入事件动作，不用 effect 观察状态后补做同一件事。
- 需要 effect 的场景仅限外部系统同步，例如本地存储、音频事件、录音权限和卸载清理；依赖项优先使用稳定的原始值。
- hook 之间通过参数、返回值或 atoms 协作，不通过组件层级中的隐藏回调链耦合。
- 为 hooks 编写行为测试，组件测试只验证用户可见结果，不重复测试内部 atom 实现。

### 6.3 Store 作用域与初始化

- 应用学习布局创建一次 `learningStore` 并交给根 Jotai Provider，保存跨路线页面的进度、错题、复习和恢复状态。
- 课程入口按 `lessonId` 创建独立 `lessonStore`，初始状态来自课程定义和已确认进度；离开或切换课程即丢弃未提交的会话临时状态。
- `LessonStoreProvider` 只用轻量 Context 传递 store 实例，不嵌套第二个 Jotai Provider；课程 hooks 从 Context 取得实例，并通过 `useAtomValue(atom, { store })` / `useSetAtom(atom, { store })` 访问会话 atoms。
- `useLessonCompletion` 可分别读取 lessonStore 并向根 learningStore 提交完成动作，两种状态不会因 Provider 遮蔽而断开。
- fixture 使用 `createStore()` 构造全新实例并注入初始状态，禁止修改模块级默认 atom 值来切换情景。
- Server Component 只传递可序列化的课程和路线输入，不读取或修改客户端 Jotai store。
- Provider 只定义 store 边界，不承载业务方法；业务 API 统一由领域 hooks 提供。

### 6.4 Lesson Session 状态机

```text
idle
  -> active
    -> answered
      -> feedback
        -> active(next step)
          -> completed
```

需要处理：

- 必做互动没有提交时不能继续。
- 错误提交先记录尝试，再显示反馈。
- 重试保留 attempt 序号，但只用最新结果判断当前掌握。
- 完成课程只触发一次完成事件。
- 刷新恢复到最近已确认步骤，不恢复未提交的临时选择。
- 切换 lessonId 时重置课程临时状态，不泄漏上一课反馈。

状态迁移由纯 `lesson-session-machine` 定义，`lesson-session-action-atoms` 调用迁移函数并通过 Jotai Immer 提交嵌套更新。这样状态机可以脱离 React 测试，UI 只通过 `useLessonSession` 和 `useLessonStep` 使用它。

### 6.5 本地存储

使用版本化 key：

```text
hskwise.learning:v1
```

只保存：

- 当前路线 ID。
- 已确认的节点和课程进度。
- 必要的互动尝试。
- 错题和复习到期时间。
- 最小事件日志，用于调试学习流程。

不保存音频对象、录音 blob、完整课程数据、token、用户资料或组件状态。

读写要求：

- 所有 `getItem` / `setItem` 包裹异常处理。
- 读取后通过 Zod 校验；失败时降级为新状态并保留诊断信息。
- 对外暴露 `hydrating`、`ready`、`degraded` 三种恢复状态；恢复完成前显示尺寸稳定的页面骨架，不能短暂渲染“新用户”进度。
- 存储不可用时退回内存存储，学习流程仍可完成。
- schema 升级显式 migration，不静默解释旧数据。
- 测试提供内存 adapter，不直接依赖浏览器 localStorage。
- `useLearningHydration` 负责一次性恢复，独立持久化 hook 只订阅需要保存的领域切片；组件不得自行读写或重复解析存储。

### 6.6 复习逻辑

本阶段使用可解释的简化规则：

- 首次答错立即创建 `ReviewItem`。
- 当前课程内答对重试后仍保留“曾经答错”记录，但标记为已纠正。
- 课程完成后，未纠正错误进入 `/review`。
- fixture 可注入当前时间，稳定模拟到期复习。
- 复习答对后从当前队列移除；再次答错则保持并增加 attempt。

本阶段不实现正式 SRS 算法，只保留未来需要的 `dueAt`、`interval` 和 `difficulty` 字段边界。

## 7. UI 组件策略

### 7.1 shadcn 使用规则

项目当前使用 `base-rhea`、Base UI、RSC、Tailwind v4、CSS variables 和 lucide。

- 优先复用现有 `Button`、`Badge`、`Progress`、`ToggleGroup`、`Dialog`、`Tooltip`、`Separator`。
- 新增组件前通过项目包管理器查询当前 shadcn 文档和 registry，不根据旧 API 猜写。
- Base UI trigger 使用 `render`，不用 Radix 的 `asChild`。
- 颜色写入 `src/styles/tailwind.css` 的语义 CSS variables，不在业务 JSX 写 raw color。
- `className` 只负责布局；组件外观通过 variant 和语义 token 管理。
- 图标使用 `lucide-react`，按钮内图标使用 `data-icon`，不手工指定尺寸。
- 反馈优先显示在当前步骤内，不用 toast 代替教学解释。
- 页面区段不套 Card；答案选项和重复词条才使用明确边界。

预计可能补充的 shadcn 组件：`Alert`、`Skeleton`、移动端需要时的 `Drawer`。是否添加以实现阶段的组件文档和真实需求为准。

### 7.2 视觉实现顺序

1. 在 `tailwind.css` 建立 background、surface、primary/progress、focus、reward、destructive 和路线状态 token。
2. 校准英文与中文字体、标题、正文、拼音和辅助文本层级。
3. 建立按钮、答案选项、路线节点、进度和反馈状态。
4. 实现声调曲线路线这一唯一显著视觉签名。
5. 最后增加完成推进和课程反馈动效，避免先做装饰动画。

## 8. 分阶段执行

### FE0：基线冻结与工程准备，1-2 天

任务：

- 确认本计划为当前前端执行方案，后端工作暂停。
- 阅读本地 Next.js 16.3 项目结构、布局与页面、Server/Client Components、lazy loading、UI state preservation 和 Playwright 指南。
- 建立现有 Course Studio 代码的“直接复用、提取复用、仅参考、冻结”清单。
- 确定四门课程 ID、路线节点 ID、知识点 ID 和 fixture ID。
- 冻结 `learningStore` / `lessonStore` 作用域、atom 依赖图、Immer 使用边界和领域 hooks 公共接口。
- 定义 ESLint `no-restricted-imports` 分层规则，阻止 UI 直连 atoms、storage、adapter，以及 model 反向依赖 React。
- 确定测试命令、浏览器基准视口和开发 URL。
- 记录当前首页和 Studio 的截图基线，不在本阶段删除旧代码。

交付：

- 稳定 ID 清单。
- 组件复用清单。
- 状态所有权表、atom 依赖图和 hooks 接口清单。
- 测试与视觉验收清单。

退出标准：后续任务不再讨论后端、通用 Studio 或新的产品路线。

### FE1：设计系统与应用骨架，2-3 天

任务：

- 把总规划中的颜色、字体、圆角、边框、触感和动效规则映射为语义 token。
- 为 `Button` 增加确有需要的学习场景 variant，不在页面覆盖颜色。
- 建立学习布局和沉浸课程布局。
- 实现桌面主导航和移动底部导航。
- 将 `/` 从登录占位页改为目标优先入口。
- 建立基础 loading、empty、error 和 unavailable 状态。

交付页面：

- `/`
- 空状态 `/learn`
- 课程空壳 `/lessons/[lessonId]`

验收：

- UI 能看出 Brilliant 的专注骨架和 Duolingo 的触感反馈，但不复制两者品牌。
- `390x844`、`768x1024`、`1440x900` 无溢出和遮挡。
- 导航、焦点和主按钮可用键盘操作。
- 页面不出现嵌套卡片和同权重 Dashboard 卡片阵列。

### FE2：路线模型、路线 UI 与情景模拟器，3-4 天

任务：

- 建立 route / stage / node Zod schema。
- 编写四节点 Starter 路线真实数据。
- 实现 `/learn` Continue、今日复习摘要和最近进度。
- 实现声调曲线路线、节点状态、锁定和检查点。
- 实现根级 `learningStore`、progress / mistake / review atoms 和窄粒度 selector atoms。
- 实现 `useLearningHydration`、`useLearningProgress`、`useLearningActions`、`useMistakeBook` 和 `useReviewQueue`。
- 实现版本化本地存储、内存降级和 fixture store factory。
- 实现开发环境情景切换和进度重置。

交付：

- `/learn`
- `/learn/routes/hsk3-level-1-starter`
- 八种 fixture 可稳定复现。

验收：

- 新用户、返回用户和已完成用户看到不同且正确的 Continue。
- 刷新后进度保持；损坏数据自动降级。
- 本地状态恢复期间不闪现错误的路线、连胜或新用户状态，骨架切换不引发布局跳动。
- 页面组件不直接导入 writable atoms 或 storage；fixture 切换会创建新 store，不污染其他情景。
- 路线页不加载完整课程 bundle。
- 当前、完成、锁定、复习和检查点同时使用颜色与非颜色提示。

### FE3：共享课程运行时与学习原语，4-5 天

任务：

- 实现纯 `lesson-session-machine`、`atomWithImmer` 会话状态和语义 write atoms。
- 实现按 `lessonId` 隔离的 `lessonStore`，以及 `useLessonSession`、`useLessonStep`、`useLessonCompletion`。
- 实现课程外壳、顶部进度、步骤区域、反馈区和底部操作栏。
- 实现选择题、音频控制、录音控制、句子排序和互动反馈原语。
- 复用或提取现有文本规范化、判题、音频状态和录音逻辑，并封装 `useAudioControl`、`useRecordingControl`。
- 建立事件记录和 progress / mistake / review 更新桥接。
- 为媒体能力定义真实 adapter 和 fixture adapter。

交付：

- 可用通用 Lesson Frame。
- 独立演示各共享互动状态的开发页面或测试 fixture。

验收：

- Lesson Frame 不包含拼音、对话或生词的 `kind` 分支。
- Lesson Frame 和课程组件只通过领域 hooks 触发会话动作，不获取 Immer draft 或完整 store。
- 必做题不能跳过，错误可以重试，完成只触发一次。
- 音频 loading / playing / paused / unavailable / blocked / error 状态可复现。
- 录音 idle / requesting / recording / recorded / denied / unsupported / error 状态可复现。
- 状态变更只重渲染必要组件，不以一个巨大 Context 驱动全页。
- 切换 `lessonId` 后旧课程的临时选择、反馈和媒体状态不会泄漏。

### FE4：拼音与声调课程，3-4 天

任务：

- 建立窄范围 `PinyinLessonSchema`。
- 编写原创《认识普通话四声》内容数据。
- 实现四声曲线、逐声讲解、示范音频、听辨、跟读和课末检查。
- 接入音频失败、自动播放受阻和麦克风拒绝替代路径。
- 所有占位音频写入版权和替换标记，并在开发预览显示。
- 使用 `tone-contrast-sample` 验证同一拼音组件只换数据即可工作。

课程步骤建议：

1. 四条曲线观察。
2. 第一声发现与解释。
3. 第二至第四声对比。
4. 点击曲线播放示范。
5. 三组听辨。
6. 跟读录音与回放。
7. 五题课末检查。
8. 学习总结。

验收：

- 用户不阅读长篇说明也能理解四声差异。
- 听辨题提交前不泄露答案。
- 权限拒绝不阻断课程完成。
- 课程完成后路线节点点亮并解锁下一课。
- 拼音专用视觉没有污染共享 Lesson Frame。
- 两份拼音内容使用同一组件和 schema 渲染通过。

### FE5：对话精读与跟读课程，3-4 天

任务：

- 建立 `DialogueLessonSchema`。
- 编写完全原创的初次问候场景、角色、句子、翻译和题目。
- 实现场景导入、逐句选择、角色区分、拼音/翻译渐进揭示和点词解释。
- 实现逐句音频、跟读和简化角色扮演。
- 实现内容理解和句子排序。
- 使用 `asking-name-sample` 验证第二组角色、句长和题目结构。

验收：

- 对话行是语义组件，不是通用卡片数组。
- 当前播放句、选中句和练习句状态明确。
- 汉字、拼音和翻译不会同时造成信息过载。
- 角色扮演复用录音原语，不复制录音状态机。
- 完成后正确推进路线并记录错误引用。
- 两份对话内容使用同一组件和 schema 渲染通过。

### FE6：生词课程、检查点与复习闭环，5-6 天

任务：

- 建立 `VocabularyLessonSchema` 和 `CheckpointSchema`。
- 从原创对话引用第一组生词，不复制词条事实。
- 实现语境发现、词卡、音义选择、主动回忆、句中应用。
- 实现混合检查点，组合听辨、词义、对话理解和句子排序。
- 实现 `/review` 和 `/mistakes`。
- 打通答错 -> 错题 -> 到期复习 -> 答对移出的完整流程。
- 使用 `daily-items-sample` 验证第二组词数、释义长度和练习组合。

验收：

- 生词课程不是翻卡片到底，至少包含识别、回忆和应用。
- 检查点只编排已经学过的能力，不引入新知识。
- 错误可关联 lesson、step、interaction 和 knowledge ref。
- `review-due`、`mixed-mistakes`、`course-complete` fixture 全部可演示。
- 刷新后复习和错题状态保持。
- 两份生词内容使用同一组件和 schema 渲染通过。

### FE7：整体验收、性能和回归，4-5 天

功能回归：

- 从 `/` 开始完整走通四节点路线。
- 每个课程分别验证正确、错误、重试、退出和刷新恢复。
- 验证所有 fixture 和媒体异常。
- 验证浏览器前进/后退时课程临时状态不会错误泄漏。

质量工作：

- 补齐 schema、状态机、atoms、领域 hooks、判题、完成规则、存储 migration 和复习逻辑单元测试。
- 配置 Playwright，覆盖主学习路径、错误回流和刷新恢复。
- 在三组基准视口截图，检查路线、每种课程、反馈和完成态。
- 检查键盘、焦点、ARIA、触控目标、对比度和 reduced-motion。
- 检查动态 import、课程 bundle 边界和不必要的 Client Component。
- 检查受限导入规则，确认组件、hooks、atoms、model 和 adapter 的依赖方向没有反转。
- 运行 lint、test、build 和浏览器回归。

退出标准：

- 四节点路线无需开发者解释即可完成。
- 三种课程共享稳定组件，但保留各自教学结构。
- 拼音、对话和生词组件分别通过第二份内容 fixture，新增同类内容无需修改组件。
- 所有正常和异常情景均有明确 UI。
- 无后端环境下可以作为完整 Frontend Learning Alpha 演示。
- 没有阻断级移动端、键盘、内容校验或版权标记问题。

## 9. 测试矩阵

### 9.1 单元测试

- 每种课程 schema 接受合法数据并拒绝代码/样式泄漏。
- `LessonSession` 每个状态转换。
- Jotai write atoms 只接受语义动作，并正确调用纯状态迁移。
- `learningStore` 与 `lessonStore`、不同 fixture store 之间互不泄漏状态。
- 领域 hooks 只返回所需派生值和动作，不暴露 draft、storage 或底层 writable atom。
- 重试 attempt 序号和最新正确性。
- 完成规则不会提前完成。
- 路线解锁和 Continue 选择。
- localStorage 合法、损坏、旧版本和不可用分支。
- 错题创建、纠正、复习和移除。
- 音频和录音 adapter 的状态映射。

### 9.2 浏览器路径

1. 新用户完成目标选择和四声课。
2. 用户答错听辨题后重试并完成。
3. 用户拒绝麦克风权限后使用替代路径。
4. 用户完成对话、生词和检查点。
5. 错误进入复习并在答对后移出。
6. 刷新页面后恢复到正确节点。
7. localStorage 不可用时仍能完成当前会话。

### 9.3 视觉状态

每个视口至少保存：

- 新用户 `/learn`。
- 路线当前、完成、锁定和复习节点。
- 四种课程的默认步骤。
- 正确、错误和重试反馈。
- 音频失败和录音拒绝。
- 课程完成和路线完成。
- 空复习和有待复习状态。

## 10. 每阶段通用完成定义

一个阶段只有同时满足以下条件才算完成：

- 真实文案和接近真实长度的数据已经接入，不使用 `Lorem ipsum`。
- 页面同时检查移动、平板和桌面。
- 新增互动有键盘路径和可见焦点。
- 动态内容不会导致控件尺寸或页面结构跳动。
- 错误和空状态告诉用户下一步能做什么。
- 新组件边界符合四层架构，没有为了复用建立万能配置。
- 状态所有权明确；组件通过高内聚领域 hooks 访问业务状态，没有跨领域万能 hook 或直接存储访问。
- 课程内容通过 Zod；占位素材有版权与替换标记。
- 相关单元测试通过，阶段末 lint 和 build 通过。
- 完成截图检查后再进入下一阶段。

## 11. 前端性能约束

- Server Component 负责路由壳层和静态数据选择，Client Component 缩小到互动叶子。
- 路线页只传递节点展示所需的最小序列化数据。
- 课程类型和录音能力动态加载，路由页不携带未使用课程实现。
- 组件直接导入，避免大型 barrel import。
- 派生状态在 render 或 selector 中计算，不通过 effect 再写一份状态。
- atoms 按领域拆分，组件只订阅最小 selector；只触发动作的组件不订阅对应领域状态。
- hooks 按独立依赖和副作用拆分，避免一个状态变化使不相关媒体、路线或复习逻辑一起执行。
- 高频音频时间值放在 ref 或局部媒体组件，不推动整个 Lesson Frame 重渲染。
- 默认非原始 props 提升到模块级，课程组件不在 render 内定义子组件。
- SVG 声调曲线动画作用于包装元素或受控属性，减少布局和绘制开销。
- localStorage 只在存储层读取并缓存，不在多个组件中重复同步读取。

## 12. 后续接入后端时的替换点

本阶段不实现后端，但需留下明确适配边界：

| 当前前端实现 | 后续替换 |
|---|---|
| `lesson-registry` 本地内容 | 课程 API / 发布内容读取 |
| `learning-storage` localStorage | 进度 API adapter |
| fixture route state | 用户真实路线和推荐结果 |
| 内存事件日志 | 学习事件持久化 |
| 本地 review queue | SRS / review API |
| placeholder capability adapter | 真实媒体和语音服务 |

React 页面、课程类型组件、Lesson Session 状态机和共享学习原语不应因为存储方式变化而重写。

## 13. 当前立即执行顺序

1. 完成 FE0 的稳定 ID、复用清单和截图基线。
2. 实现 FE1 语义 token、学习布局和目标入口。
3. 实现 FE2 Starter 路线、fixture 和版本化本地存储。
4. 实现 FE3 Lesson Runtime，再开始任何具体课程。
5. 按 FE4 -> FE5 -> FE6 顺序完成三类课程和闭环。
6. FE7 通过后，将 Frontend Learning Alpha 交给真实用户试用。

在 FE7 完成前，不启动数据库、后端 API、Google 服务端登录或 Course Studio 工作。
