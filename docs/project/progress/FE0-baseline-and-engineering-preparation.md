# FE0 基线冻结与工程准备开发进度

| 项目 | 结果 |
|---|---|
| 阶段 | FE0 |
| 状态 | 已完成 |
| 开始日期 | 2026-08-19 |
| 完成日期 | 2026-08-19 |
| 对应计划 | [前端学习体验分阶段开发计划](../12-frontend-learning-experience-development-plan.md) |
| 下一阶段 | FE1 设计系统与应用骨架 |

## 1. 本阶段结论

HSKWise 已从规划期进入正式前端开发。FE0 完成了工程基线、纵向切片 ID、复用边界、状态边界、视觉方向和质量门的冻结。

当前结论：

- 后端 API、数据库、Google 服务端登录和 Course Studio 产品化继续暂停。
- 正式学习体验从四节点 `HSK 3.0 Level 1 Starter` 路线开始。
- 页面使用 Next.js App Router；路由壳层默认保持 Server Component，互动、Jotai、localStorage 和媒体能力下沉到 Client 叶子。
- 跨页面学习状态使用 Jotai；嵌套领域更新使用 Jotai Immer；组件通过领域 hooks 访问状态和语义动作。
- 现有 Course Studio 不删除，但只提取稳定纯逻辑和媒体能力，编辑器与通用 scene 系统冻结。
- 当前开发、测试、类型检查和生产构建均可运行。

## 2. 实际变更

### 2.1 工程配置

- 将固定的 `experimental.turbopackPluginRuntimeStrategy: "workerThreads"` 改为 phase 配置。
- `next dev` 使用 `childProcesses`；生产构建等其他阶段使用 `workerThreads`。
- 原因：worker thread 策略在 `next dev` 中执行 Tailwind PostCSS 时触发 `Cannot read properties of undefined (reading 'map')`，首页返回 500；而受限 CI/沙箱不允许构建时 loader 子进程绑定内部通信端口。分阶段配置后两条路径均可运行。
- 在 ESLint flat config 中加入依赖边界：
  - UI 不得直接导入 atoms、storage 或 adapter。
  - model 和 schema 不得依赖 React、Jotai 或 UI。
  - atoms 和 state 不得反向依赖 app 或 components。

### 2.2 阶段档案

- 建立 `docs/project/progress/` 目录。
- 规定 FE0-FE7 每阶段完成后写入独立文件。
- 阶段截图和附件放在各自目录，不与发布素材混放。

## 3. Next.js 16.3 实施基线

本阶段已阅读本地 `node_modules/next/dist/docs/` 中与当前工作直接相关的指南：

- Project structure and organization。
- Layouts and pages。
- Server and Client Components。
- Lazy loading。
- Preserving UI state。
- Playwright。
- ESLint flat config。

冻结规则：

- 使用 `(learning)` 和 `(lesson)` route groups 区分普通学习布局与沉浸课程布局，不改变 URL。
- `page.tsx` 和 `layout.tsx` 默认是 Server Component。
- 只有需要事件、hooks、Jotai、localStorage、音频或录音的模块添加 `use client`。
- Provider 尽可能下沉，不把整个根布局变成 Client Component。
- 课程类型使用顶层、静态可分析的 `next/dynamic` 路径；不拼接动态 import 字符串。
- lessonId 变化时必须重置单课临时状态；浏览器前进/后退恢复只保留明确允许的状态。
- Playwright 优先使用 role、label 和可见性查询，避免匹配被 Activity 保留但隐藏的内容。

## 4. 稳定 ID 清单

ID 使用小写 kebab-case。发布后不因标题、翻译、排序或文件路径变化而修改。

### 4.1 路线与节点

| 类型 | 稳定 ID | 当前显示名 |
|---|---|---|
| Route | `hsk3-level-1-starter` | HSK 3.0 Level 1 Starter |
| Stage | `starter-foundations` | 入门基础 |
| Node | `node-four-tones` | 认识普通话四声 |
| Node | `node-first-greeting` | 第一次打招呼 |
| Node | `node-first-words` | 记住第一组词 |
| Node | `node-starter-checkpoint` | 入门检查点 |

### 4.2 课程

| Lesson ID | 类型 | 对应节点 |
|---|---|---|
| `four-tones` | `pinyin` | `node-four-tones` |
| `first-greeting` | `dialogue` | `node-first-greeting` |
| `first-words` | `vocabulary` | `node-first-words` |
| `starter-checkpoint` | `checkpoint` | `node-starter-checkpoint` |

复用验证课程 ID：

- `tone-contrast-sample`
- `asking-name-sample`
- `daily-items-sample`

### 4.3 首批知识点

| Knowledge ID | 用途 |
|---|---|
| `pinyin.tone-shapes` | 四声曲线整体辨认 |
| `pinyin.tone-1` | 第一声 |
| `pinyin.tone-2` | 第二声 |
| `pinyin.tone-3` | 第三声 |
| `pinyin.tone-4` | 第四声 |
| `dialogue.greeting-ni-hao` | 初次见面问候 |
| `dialogue.self-introduction-jiao` | 使用“叫”介绍姓名 |
| `vocabulary.first-greeting-set` | 首次问候核心词组 |
| `checkpoint.starter-foundations` | 入门阶段综合检查 |

更细粒度的词条 ID 在 FE6 从原创对话内容生成，不提前虚构。

### 4.4 情景 fixture

| Fixture ID | 验证目标 |
|---|---|
| `new-learner` | 首次目标选择和空进度 |
| `active-learner` | 返回学习和 Continue |
| `review-due` | 到期复习 |
| `mixed-mistakes` | 多类型错题 |
| `course-complete` | 完成路线 |
| `audio-unavailable` | 音频不可用 |
| `microphone-denied` | 麦克风拒绝 |
| `storage-unavailable` | localStorage 降级 |

## 5. Course Studio 复用与冻结清单

### 5.1 直接复用或移动后复用

| 资产 | 处理 |
|---|---|
| `interaction-answer.ts` | 复用文本规范化和 matching、ordering、cloze、dictation、short answer 判题纯函数 |
| `runtime-state.ts` | 提取 attempt 序号、最新 attempt 和完成规则纯逻辑，替换 Studio 类型依赖 |
| `use-voice-recorder.ts` | 提取媒体生命周期，重命名为课程共享 `useRecordingControl` |
| shadcn `Button`、`Badge`、`Progress`、`ToggleGroup`、`Dialog`、`Tooltip`、`Separator` | 继续作为基础 UI 原语 |

### 5.2 提取设计思想，不直接复制模块

| 资产 | 可提取内容 | 不保留内容 |
|---|---|---|
| `use-audio-transport.ts` | 播放、暂停、错误、清理和自动播放受阻状态 | timeline cue 和 Studio action 类型 |
| `learning-progress.ts` | 版本化存储、损坏数据降级、错题聚合思路 | project/unit/scene 数据结构 |
| `runtime-event-utils.ts` | 事件分类和调试筛选思路 | Studio 专用事件名 |
| `structured-interactions.tsx` | 已验证的交互行为 | Studio 表单布局和视觉 |

### 5.3 仅作教学与运行时参考

- `ScenePlayer` 的 pause-until-interaction 流程。
- `pinyin-lesson-template.ts` 的步骤顺序。
- sample project 的知识点引用关系。

课程正文、题目和反馈从第一版起重新原创。现有 sample 文案和素材不得直接进入发布课程。

### 5.4 冻结

- Course Studio Shell。
- Outline、Inspector、Timeline、Template Picker。
- Asset Library mock 管理。
- 通用 scene、action、timeline schema 扩张。
- `/admin/studio` 产品化和移动端适配。

冻结表示不删除、不重构、不继续投入；只有提取正式学习体验需要的稳定资产时才触碰。

## 6. Jotai 状态与 hooks 基线

### 6.1 Store 作用域

```text
learningStore
  -> route progress atoms
  -> mistake atoms
  -> review atoms
  -> hydration state

lessonStore(lessonId)
  -> current step
  -> attempts
  -> feedback
  -> completion state
```

- `learningStore` 由学习布局创建一次，跨学习页面保持。
- `lessonStore` 按 lessonId 创建，离开课程后丢弃未提交临时状态。
- LessonStore 通过轻量 Context 传递 store 实例，不用嵌套 Jotai Provider 遮蔽根 store。
- fixture 使用 `createStore()` 创建独立实例，不修改模块级可变状态。

### 6.2 依赖方向

```text
UI
  -> domain hook
    -> selector atom / semantic write atom
      -> pure model
        -> storage or media adapter
```

- `atomWithImmer` 只用于嵌套领域聚合。
- 组件不能接收 Immer draft 或通用 setState。
- write atoms 只接受 `submitAnswer`、`completeStep`、`completeLesson`、`enqueueReview` 等语义动作。
- hooks 不跨领域聚合无关副作用，不建立 `useLearningApp`。

### 6.3 首批公共 hooks

- `useLearningHydration`
- `useLearningPersistence`
- `useLearningProgress`
- `useLearningActions`
- `useMistakeBook`
- `useReviewQueue`
- `useLessonSession`
- `useLessonStep`
- `useLessonCompletion`
- `useAudioControl`
- `useRecordingControl`

## 7. 视觉基线

### 7.1 设计方案

具体对象：面向非汉语母语成年学习者的 HSK 学习工具。页面的单一任务是让用户立刻知道下一步学什么，并进入当前课程。

初始视觉 token：

| 角色 | 色值 |
|---|---|
| Ink | `#18212F` |
| Paper | `#F7F9FC` |
| Surface | `#FFFFFF` |
| Progress | `#1C7F58` |
| Focus | `#236FD2` |
| Reward | `#F2B544` |
| Error | `#B83F4C` |

字体方向：英文与 UI 使用 Plus Jakarta Sans，中文使用 Noto Sans SC；数字和进度使用同一 sans 并启用 tabular numerals，不增加装饰字体。

页面结构：

```text
Desktop learning       Mobile learning       Immersive lesson
┌────┬────────┬────┐   ┌──────────────┐      ┌─ exit ─ progress ─┐
│nav │ route  │info│   │ compact top  │      │                   │
│    │ path   │    │   │ tone route   │      │ one learning task │
│    │        │    │   │              │      │                   │
└────┴────────┴────┘   ├──────────────┤      ├───────────────────┤
                       │ bottom nav   │      │ stable action bar │
                       └──────────────┘      └───────────────────┘
```

唯一显著视觉签名是普通话声调曲线构成的学习路线。复盘后删除了通用 SaaS 卡片阵列、装饰性 hero、绿色主导界面和无教学含义的曲线装饰；奖励黄色只用于检查点和阶段完成。

### 7.2 截图基线

| 页面 | Mobile | Tablet | Desktop |
|---|---|---|---|
| 当前首页 | [390x844](fe0/assets/home-mobile.jpg) | [768x1024](fe0/assets/home-tablet.jpg) | [1440x900](fe0/assets/home-desktop.jpg) |
| Course Studio | [390x844](fe0/assets/studio-mobile.jpg) | [768x1024](fe0/assets/studio-tablet.jpg) | [1440x900](fe0/assets/studio-desktop.jpg) |

基线结论：

- 首页仍是登录占位和 API 状态展示，没有产品入口、学习路线或品牌识别。
- Studio 桌面端可工作，但不属于学习者体验。
- Studio 在移动端存在明显横向溢出和大面积空白；本阶段只记录，不修复冻结模块。
- FE1 截图必须与这些基线对比，证明首页和学习壳层已经脱离实验状态。

## 8. 质量验证

| 检查 | 结果 |
|---|---|
| `bun run lint` | 通过 |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 16 通过，0 失败，41 次断言 |
| `bun run build` | 通过 |
| `next dev` 首页 | 修复前 500，修复后 200 |
| 浏览器运行 | 无 Next 错误覆盖层；首页无横向溢出 |
| 生产路由 | `/`、`/_not-found`、`/admin/studio`、`/api/[[...slugs]]` |
| 浏览器基线 | 6 张截图已保存并人工检查 |

shadcn CLI 在线信息查询因当前网络环境拒绝连接而未完成。本阶段改用本地 `components.json` 和已安装组件源码审计，确认配置为 Base UI、`base-rhea`、RSC、Tailwind v4、CSS variables 和 lucide。

## 9. 已知限制

- 当前首页仍调用 `/api/db`，FE1 必须移除学习入口对后端状态的依赖。
- 当前 Google Identity 占位在受限网络下会记录 FedCM token 获取错误；FE1 移除登录前置后不再加载该脚本。
- 当前 `<html lang="en">`，FE1 需要根据首发界面语言和多语言策略校准。
- 尚未安装 Playwright；按计划在 FE7 正式配置，FE0 使用受控浏览器完成基线检查。
- 当前没有正式学习路由、Jotai store、课程组件或本地学习数据，这些分别属于 FE1-FE6。
- 截图中的现有 Studio/sample 内容只用于代码与视觉基线，不代表可发布课程素材。

## 10. FE1 进入条件

FE0 退出标准已经满足。FE1 第一批任务固定为：

1. 在 `tailwind.css` 建立学习产品语义 token 和字体层级。
2. 建立 `(learning)` 与 `(lesson)` 布局骨架。
3. 将 `/` 改为无需登录、目标优先的真实入口。
4. 实现桌面主导航、移动底部导航和课程空壳。
5. 建立 loading、empty、error、unavailable 的基础状态表达。
6. 在三组基准视口重新截图，并写入独立 FE1 进度档案。
