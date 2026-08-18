# Course Studio 开发计划

Course Studio 是 HSKWise 的课程生产平台。它面向 admin、老师和教研人员，让他们像制作 PPT 一样制作课程，但底层不是 PPT 文件、视频文件或题库文件，而是一套统一的可编排互动学习场景。

## 1. 核心定位

Course Studio 的核心对象不是“静态页”“互动页”“视频式课件”三种类型，而是统一的 `Scene`：

```text
Course
  Unit
    Lesson / Section
      Scene
        Elements
        Timeline
        Events
        Actions
        Interactions
        Assets
        Knowledge bindings through course_scene_refs
```

同一个 `Scene` 可以表现为：

- 普通图文讲解：只有 elements。
- 互动练习：elements + interactions。
- 自动播放课件：elements + timeline。
- 吉祥物讲解课：mascot element + speak action + timeline。
- 实时课堂测验：timeline 中插入 quiz interaction。
- AI 助学片段：scripted prompt + bounded chat interaction。

因此，`staticPage`、`interactivePage`、`scriptedScene` 不应成为底层表结构里的分叉类型。它们更适合作为模板、预设或播放模式。

## 2. 设计原则

- 统一编辑器：老师始终在同一个 Studio 里制作 scene，只是选择不同模板和组件。
- 模板优先：不要让老师从空白画布开始。拼音、对话、生词、听力、跟读、测验都应有模板。
- 结构化存储：保存元素、时间轴、互动规则和知识点引用，不把课程导出成不可分析的视频。
- 播放器先行：学习者端 `ScenePlayer` 和 admin 预览共用同一套 renderer，避免编辑出来和实际播放不一致。
- 前端体验先行：先用本地 sample scenes、mock outline、mock assets 和浏览器状态完成编辑/预览体验，不急着接数据库、上传、发布和权限。
- 版权内建：每个 scene、元素和素材都要能标记 `content_origin` 或版权状态。
- 数据闭环：互动、答题、跟读、AI 对话等行为必须能回流到进度、错题、SRS 和弱项推荐。
- 先约束后自由：MVP 使用布局模板和属性面板，暂不做完全自由拖拽画布。

## 3. 与课程存储模型的关系

当前 [课程存储与 Admin 制课方案](06-course-storage-design.md) 已经定义了 course / unit / section / scene / experience。它是后端目标模型，不要求在 Studio 前端 MVP 一开始全部落库。前端阶段可以先用同一份 scene 协议构造 mock 数据：

| 当前概念 | Course Studio 中的含义 |
|---|---|
| `course_sources` | 内部参考来源，供老师制课时查看，不直接成为发布内容。 |
| `courses` | 课程产品资产。 |
| `course_units` | 课程单元或课。 |
| `course_sections` | 教学段落或 lesson 容器。 |
| `course_scenes` | 最小可编辑、可播放、可交互、可记录的学习场景；核心内容存在 `scene_data`。 |
| `course_scene_refs` | 把 scene / 元素 / 互动绑定到词汇、读音、标准等级和来源片段，定位字段使用 `target_locator`。 |
| `course_assets` | 音频、图片、视频、字幕、动画资源。 |
| `course_experiences` | 多个 scene 或 scene steps 组成的学习体验配方。 |

因此课程 schema 不再沿用 block 思维：`course_scenes` 不是文本块集合，而是统一的 scene、页面与运行时容器。图文讲解、自动播放、互动题、小游戏和受控 AI 对话都应由同一个 Scene Editor 生产，由同一个 ScenePlayer 执行。

落地顺序上，先把 `scene_data` 当作前端协议稳定下来。只要 sample scene 能被编辑、预览、复制、导入导出和播放，后续把它保存到 `course_scenes.scene_data` 就是持久化问题，不应该反过来用数据库设计限制早期交互探索。

## 4. Scene 数据协议

Scene JSON 建议用 Zod 定义版本化 schema，由 editor、player、API 校验共同使用。

```json
{
  "version": 1,
  "canvas": {
    "aspectRatio": "16:9",
    "safeArea": "responsive",
    "background": { "kind": "color", "value": "#ffffff" }
  },
  "playback": {
    "mode": "guided",
    "autoStart": false
  },
  "elements": [
    {
      "id": "mascot_1",
      "kind": "mascot",
      "role": "teacher",
      "name": "Panda",
      "position": { "preset": "right-bottom" }
    },
    {
      "id": "text_1",
      "kind": "text",
      "content": { "en": "Today we will learn the four tones." },
      "position": { "preset": "center" }
    }
  ],
  "timeline": [
    { "id": "tl_1", "at": 0, "actionId": "act_show_mascot" },
    { "id": "tl_2", "at": 500, "actionId": "act_speak_intro" },
    { "id": "tl_3", "at": 2500, "actionId": "act_show_text" },
    { "id": "tl_4", "at": 5000, "actionId": "act_pause_for_quiz" }
  ],
  "events": [
    {
      "id": "evt_quiz_submit",
      "on": "interaction.submit",
      "targetId": "quiz_1",
      "actions": ["act_record_answer"]
    }
  ],
  "actions": [
    { "id": "act_show_mascot", "kind": "show", "targetId": "mascot_1" },
    {
      "id": "act_speak_intro",
      "kind": "speak",
      "targetId": "mascot_1",
      "text": { "en": "Listen carefully to the tone shape." }
    },
    { "id": "act_show_text", "kind": "show", "targetId": "text_1" },
    {
      "id": "act_pause_for_quiz",
      "kind": "pauseUntilInteraction",
      "interactionId": "quiz_1"
    },
    {
      "id": "act_record_answer",
      "kind": "emitLearningEvent",
      "eventName": "interaction.submitted"
    }
  ],
  "interactions": [
    {
      "id": "quiz_1",
      "kind": "multipleChoice",
      "prompt": { "en": "Which tone is high and level?" },
      "options": [
        { "id": "a", "text": { "en": "First tone" }, "isCorrect": true },
        { "id": "b", "text": { "en": "Fourth tone" }, "isCorrect": false }
      ]
    }
  ]
}
```

知识点绑定不必重复塞进 `scene_data`。正式保存时用 `course_scene_refs.target_locator` 指向 `elementId`、`interactionId`、`lineId` 或 `questionId`；编辑器内部可以临时展示绑定草稿，但关系表才是可查询的事实源。

MVP 不一定立刻建出所有字段，但需要先把 schema 思路定住，否则编辑器、播放器、API 和数据库会各自长出一套格式。

## 5. 系统模块

### 5.1 Scene Player

学习者端和 admin 预览共用播放器。

职责：

- 渲染 scene canvas。
- 渲染元素：文本、图片、音频、视频、吉祥物、对话、生词、题目、按钮、提示。
- 执行 timeline：show、hide、move、highlight、speak、playAudio、pause、wait、branch。
- 执行 interaction：选择题、填空、配对、排序、听写、跟读、角色扮演、AI 对话入口。
- 记录事件：开始、完成、暂停、答题、错误、重试、跳过、求助。

### 5.2 Scene Editor

老师制作 scene 的主界面。

建议布局：

```text
左侧：课程大纲 / Scene 列表
中间：Scene 画布和预览
右侧：元素属性 / 互动属性 / 知识点绑定
底部：时间轴
顶部：模板、预览、保存、审核、发布
```

MVP 使用模板布局和属性面板，不做任意拖拽自由画布。高级阶段再增加拖拽、吸附、对齐线、多选和图层面板。

### 5.3 Template Generator

提高制课效率的关键模块。

老师不应手动创建每个元素和 timeline action。更合理的流程是：

1. 选择模板。
2. 填教学目标。
3. 选择词汇、拼音点、语法点或对话文本。
4. 系统生成 scene 草稿。
5. 老师审核和微调。

首批模板：

- 拼音声调讲解。
- 声母/韵母对比。
- 生词介绍。
- 生词闪卡。
- 对话精读。
- 听音选择。
- 跟读练习。
- 角色扮演。
- 小测验。
- 吉祥物讲解。

### 5.4 Mock Asset Library

前端 MVP 阶段先做“假素材库”，只登记内置图片、音频占位、视频占位、角色动画占位和远程 URL 示例，不做真实上传、转码、对象存储和版权工作流。

MVP 能力：

- 选择内置素材或填写临时 URL。
- 标记 asset kind、用途和缺失状态。
- 绑定到 scene、element、timeline action 或 interaction。
- 检查缺失音频、缺失图片和无效 URL；版权状态只保留字段和 UI 占位。

### 5.5 Knowledge Binding

每个 scene 和 interaction 都应能绑定知识点：

- `lexical_items`
- `lexical_forms`
- HSK 标准等级
- 拼音概念
- 语法/表达点
- 技能标签：listening、speaking、reading、writing、pronunciation 等
- 学习模式标签：shadowing、rolePlay、flashcards、examPrep 等

MVP 可以先绑定 `lexical_items` / `lexical_forms` 和标签；拼音概念、语法点可以先用 scene 标签或 metadata，等内容体系稳定后再拆表。

## 6. 开发阶段

### Phase 0：前端协议与样例冻结

目标：先定义可执行的 scene 数据协议，并准备能驱动前端体验的样例数据；不建数据库、不做上传、不做发布流。

交付：

- `SceneSchema` Zod 定义。
- Element registry 草案。
- Timeline action registry 草案。
- Interaction registry 草案。
- 3-5 个手写 sample scenes。
- Mock course outline：course / unit / section / scene 列表。
- Mock asset list：图片、音频、视频、吉祥物占位。
- 前端本地导入/导出 JSON。

验收：

- sample scene 能被 TypeScript 校验。
- sample scene 能覆盖图文、音频、选择题、吉祥物讲解、timeline pause。
- 刷新页面后可以从本地 sample 或 browser storage 恢复编辑状态。

### Phase 1：Scene Player MVP

目标：先让 scene 能被稳定播放和预览。

交付：

- `ScenePlayer`。
- `ElementRenderer`。
- `TimelineRuntime` 基础版。
- `InteractionRuntime` 基础版。
- `/admin/studio/preview` 或内部预览路由。

支持元素：

- text
- image
- audio
- video
- mascot
- panel / group
- dialogue
- vocabularyCard
- quiz

支持 timeline action：

- show
- hide
- highlight
- speak
- playAudio
- pause
- pauseUntilInteraction

验收：

- 同一份 scene JSON 在 admin 预览和学习者端渲染一致。
- 桌面和移动端都不溢出、不重叠。
- 选择题互动能产生答题事件。

### Phase 2：Course Studio Frontend MVP

目标：老师能用统一编辑器在纯前端环境制作、预览和调整第一批 scene。

交付：

- `/admin/studio` 或 `/admin/courses/:courseId/studio` 前端入口。
- Mock 课程大纲树：course / unit / section / scene。
- Scene CRUD。
- 模板选择。
- 表单式属性编辑。
- 画布预览。
- Mock 知识点搜索和绑定。
- 本地保存草稿、复制 scene、导入/导出 scene JSON。

暂不做：

- 真实数据库保存。
- 真实资源上传。
- 真实审核发布。
- 真实权限系统。
- 任意拖拽画布。
- 多人实时协作。
- 复杂分支剧情。
- 真实 AI 自由问答。

验收：

- 老师可以从模板生成一节 5-8 个 scene 的拼音小课。
- 每个 scene 能保存、预览、重新编辑。
- 前端能提示缺失音频、缺失知识点绑定和 scene schema 错误。

### Phase 3：Timeline 与自动播放

目标：支持“像视频一样”的程序化课件。

交付：

- 时间轴面板。
- action 排序和时间编辑。
- guided / auto / manual 播放模式。
- 基础动画：fade、slide、scale、emphasis、highlight。
- 吉祥物 speak action。
- timeline 中插入互动暂停点。

验收：

- 老师可以制作“吉祥物开场 -> 内容出现 -> 音频播放 -> 小测暂停 -> 继续讲解”的自动课件。
- 学习者可以暂停、继续、重做互动。
- timeline 不影响移动端布局。

在进入 Phase 4 前增加一个短周期的 Phase 3.5，先稳定播放器与学习数据之间的契约，避免每增加一种题型就重新设计完成状态和事件字段。

### Phase 3.5：播放器运行时契约

目标：把时间轴播放、互动提交和学习进度统一到一份版本化、可测试的前端运行时模型，再扩展题型。

交付：

- editor / learner 两种播放上下文，预览切换时使用独立播放器会话。
- 版本化 learning event：场景开始/完成、播放/暂停/跳转、cue 进入、答题、错误、重试和媒体状态。
- `InteractionAttempt`：保存作答内容、尝试序号、正确性、播放头时间和 `target_locator`。
- `SceneProgress`：由最长实际播放时间、timeline 完成状态和最新一次作答统一计算。
- guided / auto / manual 三种模式具备明确且可测试的执行语义。
- 纯函数单元测试覆盖完成规则、重试和最新作答状态。

验收：

- 拖动播放头不能伪造观看进度；`viewed.minTimelineMs` 按实际播放的最长位置判断。
- 错误作答后可重试，完成状态按最新一次作答计算，同时保留完整尝试历史。
- 同一事件对象已包含未来 API 入库所需的 scene、版本、上下文、时间和定位信息。
- admin 预览与 learner 预览使用同一 renderer，但上下文清晰可辨。

### Phase 4：互动体验闭环

目标：基于稳定的运行时契约扩展真实题型、反馈和学习记录，不再使用“模拟提交”作为验收标准。

交付：

- 多题型 interaction：multipleChoice、matching、ordering、cloze、dictation。
- 跟读录音占位流程：录音、回放、提交，评分可后续接入。
- 角色扮演占位流程。
- 前端事件面板：筛选和检查 Phase 3.5 定义的版本化学习事件。
- 基于 `SceneProgress` 的 lesson 级 Mock 进度聚合。
- Mock 错题与 `course_scene_refs` / `target_locator` 关联。

验收：

- 用户完成 scene 后能在前端看到完成状态。
- 答错题能在前端事件流中关联到 scene、interaction、知识点。
- 后端接入前已经能验证哪些事件值得持久化。

### Phase U：Course Studio 可用性重构（当前优先）

目标：在继续扩展提效功能之前，把现有底层能力重组为老师和教研人员可以理解、操作和恢复的完整制课工作流。

交付：

- U0：冻结 Phase 5，建立黄金任务、问题基线和回归入口。
- U1：默认中文界面、任务模式、命令层和基于 `travels@2.2.0` 的撤销 / 重做。
- U2：可直接选择、插入和编辑组件的内容画布。
- U3：可拖动、缩放、吸附、精确编辑并与播放器同步的时间轴。
- U4：聚焦学员体验的预览检查、质量门和真实用户验收。

验收：

- 三条黄金任务无需 JSON、内部 ID 或口头指导即可完成。
- 文档修改具有明确历史边界，刷新后可恢复草稿和撤销 / 重做历史。
- 内容画布、属性面板、课程结构和时间轴保持选择同步。
- 详细任务、退出标准和 Phase 5 解冻条件以 [Course Studio 可用性重构实施计划](08-course-studio-usability-refactor-plan.md) 为准。

### Phase 5：模板和效率工具

> 当前状态：冻结。Phase 3、Phase 4 的底层能力已经存在，但编辑器信息架构、内容画布和时间轴未通过产品可用性验收。必须先完成 [Course Studio 可用性重构实施计划](08-course-studio-usability-refactor-plan.md) 中的 Phase U0-U4，并满足 Phase 5 解冻条件。

目标：真正提高老师制课效率。

交付：

- 模板库。
- 一键复制 scene / lesson。
- 批量替换词汇或音频。
- 从 course source 生成 outline 草稿。
- 根据词汇列表生成闪卡 scene。
- 根据对话文本生成精读 / 跟读 / 角色扮演 scene。
- AI 辅助生成 scene 草稿。

AI 规则：

- AI 只生成草稿，不能直接发布。
- AI 生成内容必须标记 `content_origin = referenceRewrite` 或类似审核态。
- 发布前必须由老师确认并转为 `original`、`licensed` 或 `openLicensed`。

验收：

- 老师制作一节标准 lesson 的时间明显少于手工搭建。
- 模板生成的 scene 能通过基础校验。
- AI 草稿不会绕过版权和教研审核。

### Phase 6：后端接入与持久化

目标：当前端 Studio 体验稳定后，再补全数据库、API、上传、权限、审核和发布。

交付：

- `course_scenes.scene_data` 持久化。
- course / unit / section / scene CRUD API。
- asset 上传或稳定 URL 登记。
- `course_scene_refs.target_locator` 保存与校验。
- 草稿、审核、发布状态。
- 后端发布校验。
- 学习者端读取已发布 scene。

验收：

- 前端 mock scene 可以无损保存到数据库再读回。
- 同一份 scene JSON 在 admin 预览和学习者端播放一致。
- 上传/素材/发布/权限不影响已有编辑体验。

### Phase 7：高级编辑能力

目标：在模板稳定后增加更自由的创作能力。

交付：

- 拖拽定位。
- 图层面板。
- 多选、组合、对齐、分布。
- 断点布局。
- 自定义动画曲线。
- 分支剧情。
- 角色状态和表情。
- 课堂实时投屏 / live quiz。
- 版本历史和发布快照。

验收：

- 高级老师可以做更复杂的互动课件。
- 普通老师仍然可以只用模板高效制课。
- 历史学习记录不会因为课件更新而丢失关键引用。

## 7. 推荐代码结构

```text
src/
  features/
    course-studio/
      scene-schema/
        scene-schema.ts
        element-schema.ts
        timeline-schema.ts
        interaction-schema.ts
        runtime-schema.ts
      renderer/
        scene-player.tsx
        element-renderer.tsx
        runtime-state.ts
        timeline-runtime.ts
        interaction-runtime.tsx
      editor/
        course-studio-shell.tsx
        outline-panel.tsx
        scene-canvas.tsx
        inspector-panel.tsx
        timeline-panel.tsx
        template-picker.tsx
      templates/
        pinyin-tone-template.ts
        vocabulary-card-template.ts
        dialogue-reading-template.ts
        quiz-template.ts
      assets/
        asset-library.tsx
      knowledge/
        knowledge-ref-picker.tsx
```

开发 Next.js 页面前，需要继续遵守仓库 `AGENTS.md` 的要求，先读对应版本的 Next 文档。

## 8. API 规划

前端 MVP 不要求实现这些 API。先用 mock repository / browser storage / JSON import-export 跑通体验；当 Studio 的编辑体验、播放器、模板和事件模型稳定后，再按资源组织 API：

| API | 职责 |
|---|---|
| `/api/admin/courses/*` | 课程、unit、section、scene 管理。 |
| `/api/admin/course-scenes/*` | scene 保存、复制、预览、校验、发布。 |
| `/api/admin/course-templates/*` | 模板列表和模板生成 scene 草稿。 |
| `/api/admin/course-assets/*` | 素材管理和版权检查。 |
| `/api/admin/course-review/*` | 发布前检查、审核状态、问题列表。 |
| `/api/courses/*` | 学习者端读取已发布课程和 scene。 |
| `/api/course-events/*` | 学习者端 scene 事件、答题和进度提交。 |

## 9. 发布校验

前端阶段先做“预发布校验”，它只给老师提示问题，不真正发布。后端接入后，这些规则再变成服务端硬校验。

- scene JSON 通过 Zod 校验。
- 所有 element id 唯一。
- timeline target id 存在。
- interaction answer 合法。
- 必填知识点引用存在。
- `content_origin` 字段存在且有明确值。
- 绑定素材能在前端预览或明确标记为缺失。
- 移动端预览不溢出。
- 自动播放 scene 有暂停和重放控制。
- AI 生成草稿有明显审核状态占位。

## 10. 优先级建议

最优先：

1. Scene JSON schema。
2. Scene Player。
3. 模板式 Scene Editor。
4. 本地 sample scenes、browser storage、JSON 导入/导出。
5. Mock 知识点绑定。
6. 前端预发布校验。
7. 拼音课模板。
8. 对话精读模板。
9. 选择题 / 听音选择互动。
10. 后端持久化和上传。

暂缓：

- 真实数据库保存。
- 真实资源上传。
- 审核发布流。
- 完整自由画布。
- 多人实时协作。
- 高级动画编辑器。
- AI 自由课堂对话。
- 复杂角色系统。
- 视频导出。

这个顺序的好处是：Course Studio 很早就能生产真实可预览的课程草稿，同时不会一开始陷入“做一个低配 Figma / PowerPoint”的坑里。

## 11. 当前实现状态

已落地 Phase 0 的前端协议基础：

- `SceneDataSchema`：见 [scene-schema.ts](/Users/yanglong/Documents/YL/hskwise/src/features/course-studio/scene-schema/scene-schema.ts)，定义 canvas、playback、elements、timeline、events、actions、interactions、completionRule，并校验关键 ID 引用。
- Element / action / timeline / interaction schema：见 [src/features/course-studio/scene-schema/](/Users/yanglong/Documents/YL/hskwise/src/features/course-studio/scene-schema/)。
- `CourseStudioProjectSchema`：见 [project-schema.ts](/Users/yanglong/Documents/YL/hskwise/src/features/course-studio/scene-schema/project-schema.ts)，用于前端 mock course / unit / section / scene 草稿文件。
- Registry：见 [registries.ts](/Users/yanglong/Documents/YL/hskwise/src/features/course-studio/scene-schema/registries.ts)，集中维护当前支持的元素、动作和互动类型。
- Sample scenes 和 sample project：见 [samples.ts](/Users/yanglong/Documents/YL/hskwise/src/features/course-studio/scene-schema/samples.ts)，当前包含拼音声调讲解、对话精读/跟读、生词配对三类样例。

已落地 Phase 1 的播放器预览基础：

- `ScenePlayer`：见 [scene-player.tsx](/Users/yanglong/Documents/YL/hskwise/src/features/course-studio/renderer/scene-player.tsx)，支持 reset、step、play / pause / continue、受控播放头、runtime event log 和 state 预览。
- `ElementRenderer`：见 [element-renderer.tsx](/Users/yanglong/Documents/YL/hskwise/src/features/course-studio/renderer/element-renderer.tsx)，当前能渲染 text、callout、mascot、pinyinChart、dialogue、vocabulary、quiz mount、button、hotspot 和媒体占位。
- `InteractionRenderer`：见 [interaction-renderer.tsx](/Users/yanglong/Documents/YL/hskwise/src/features/course-studio/renderer/interaction-renderer.tsx)，当前能操作 multipleChoice、matching、ordering、cloze、dictation、shortAnswer、speechRepeat、rolePlay，并仅对尚未实现的互动类型保留模拟提交。
- `/admin/studio`：见 [page.tsx](/Users/yanglong/Documents/YL/hskwise/src/app/admin/studio/page.tsx)，提供本地 sample project 的 Course Studio 预览入口。

已落地 Phase 2 的第一版前端编辑工作台：

- `CourseStudioShell`：见 [course-studio-shell.tsx](/Users/yanglong/Documents/YL/hskwise/src/features/course-studio/editor/course-studio-shell.tsx)，统一管理当前项目、Scene 选择、浏览器草稿恢复和本地自动保存。
- 课程大纲与 Scene CRUD：可以按 section 从模板新建 Scene、复制 Scene、删除 Scene，并保持当前 Scene 选择。
- 模板入口：当前提供拼音声调、对话精读和生词练习三类单 Scene 模板，并提供可一次生成 6 个 Scene、知识点引用和素材占位的四声入门小课模板；生成后仍使用同一份 `SceneData` 编辑和播放。
- Inspector：支持 Scene 标题、类型、播放模式、画布比例、版权来源、标签和时长编辑；支持元素选择、常用元素内容、布局预设和兼容素材绑定编辑。
- Mock 素材库：支持查看素材类型和引用 ID，维护 `available`、`placeholder`、`missing` 状态及临时 HTTP(S) URL；状态变化会即时进入预发布检查。
- Mock 知识点绑定：支持本地搜索、添加和移除词汇、拼音与技能引用。
- 本地 JSON 工作流：支持当前 Scene JSON 导入、导出、直接编辑和 Zod 校验后应用。
- 前端预发布检查：提示 schema、知识点、版权来源、素材状态和自动播放控制问题。
- 响应式编辑器：桌面使用大纲、画布、Inspector 三栏布局；移动端改为纵向工作流，时间轴在自己的容器内横向滚动，不撑开页面。

Phase 3 的时间轴编辑主链路已落地：

- 轨道式时间轴：`TimelinePanel` 见 [timeline-panel.tsx](/Users/yanglong/Documents/YL/hskwise/src/features/course-studio/editor/timeline-panel.tsx)，轨道画布见 [timeline-canvas.tsx](/Users/yanglong/Documents/YL/hskwise/src/features/course-studio/editor/timeline-canvas.tsx)。基于 MIT 开源库 `dnd-timeline`，按 Visual、Audio、Control 三类轨道展示 cue，支持片段横向自由拖动、100ms 级吸附和可持续 action 的左右边缘缩放。
- 视频编辑器式导航：时间标尺提供可点击和连续拖动的播放头，并支持放大、缩小、适配全部内容；拖动和缩放会直接写回 `TimelineStep.at`、`TimelineStep.durationMs`，需要持续时间的 action 同步更新 `durationMs`。
- Action 属性编辑：时间轴可以切换并编辑 show、hide、highlight、playAudio、speak、pause、wait、pauseUntilInteraction 和 animate 等常用 action，目标元素、音频素材、互动暂停点和基础动画参数均使用当前 Scene 的稳定 ID。
- 精确属性编辑：选中轨道片段后仍可用下方紧凑属性栏编辑 cue 名称、action、精确起点和持续时间，适合键盘微调和无障碍操作；新增、删除、Scene 自动保存和 schema 校验流程保持不变。
- 时间轴响应式：轨道自动适应容器宽度，移动端保留完整三轨，精确属性栏在自身容器内横向滚动，不改变页面宽度或挤压 Inspector。
- 播放头双向同步：播放器使用单一 `requestAnimationFrame` 时钟推进，实时回写编辑器播放头；在时间标尺点击或拖动会停止播放并重建目标时刻的元素可见性、runtime state、highlight、move 和 animation 快照。
- 真实暂停语义：手动 Pause 会冻结播放时钟并可从原位置 Continue；timeline `pause` 只阻塞一次，Continue 后进入下一 cue；`pauseUntilInteraction` 会停在 cue 时间点，目标互动提交后自动继续，不再出现旧版后续 timer 穿透暂停的问题。
- 播放设置：Inspector 已能编辑 `autoStart`、`allowPause` 和 `allowReplay`，播放器即时遵守三个设置；播放状态、当前时间和总时长在预览工具栏中持续可见。
- 基础视觉动作：highlight 支持 pulse、outline、glow、underline，move 使用 action 的 duration / easing 更新运行时位置，animate 支持 fadeIn、fadeOut、slideIn、slideOut、scale 和 shake；拖动播放头时可预览对应时刻的视觉状态。
- 真实音频 transport：`playAudio` 会解析 action URL 或素材 URL，按片段的 `startMs`、`endMs` 和时间轴持续时间播放；手动暂停、互动暂停、继续、重置、播放结束以及拖动播放头都会同步控制媒体位置，播放器会明确显示 loading、playing、paused、blocked、unavailable 和 error 状态。
- 音频时长回填：音频 metadata 可用后会更新素材真实时长，并仅对尚未人工调整持续时间的 cue 写入片段时长；已经通过时间轴缩放设置的 `TimelineStep.durationMs` 不会被覆盖，素材库和时间轴总长度会立即反映新时长。

Phase 3.5 的第一批运行时契约已落地：

- 运行时 schema：`runtime-schema.ts` 定义版本化 learning event、`InteractionAttempt`、`SceneProgress` 和 editor / learner 上下文。
- 进度纯模型：`runtime-state.ts` 统一处理观看阈值、timeline 结束、必做互动、指定互动和最少答对数；拖动播放头不会增加实际观看进度。
- 事件面板：播放器直接展示结构化的场景、播放、cue、互动、重试和媒体事件，不再以调试字符串代替学习事件。
- 作答与重试：multipleChoice 提交前不再泄露正确答案，提交后提供明确反馈；错误后再次作答会保留尝试历史，并按最新一次结果计算正确状态。
- 播放上下文：Studio 顶部可切换 Editor / Learner，项目的 `previewMode` 已真正控制播放器上下文；manual 模式按 cue 推进，autoStart 不再覆盖 manual 语义。
- 测试入口：根目录 `bun test` 已接入，当前覆盖观看完成规则、未开始状态和重试后的最新正确性。

Phase 4 的互动体验主链路已落地：

- `interaction-answer.ts` 集中维护 matching、ordering、cloze、dictation、shortAnswer 的纯判题逻辑，答案继续通过 `InteractionAttempt.answer` 保存为结构化 JSON。
- matching 使用来源词条和打乱后的目标下拉框，支持错误反馈、交换答案和重试，不再直接展示正确配对。
- ordering 使用稳定列表和上下移动控制完成排序，提交时按 `correctOrder` 判定。
- cloze 为每个 blank 渲染独立输入和 hint，按各自 `acceptedAnswers` 判定并显示字段错误状态。
- dictation 支持素材音频播放、文本输入、`expectedText` 与显式备选答案判定；素材缺失时提供明确状态。
- shortAnswer 支持 open、sample、exact 三种语义和最小长度约束；开放回答提交后标记为未评分，sample 模式在提交后展示参考回答，exact 模式才进入自动对错判定。
- speechRepeat 已接入浏览器麦克风权限、开始/停止录音、本地回放、重新录制和提交；attempt 只保存录音元数据，本地 Blob URL 不进入可持久化 Scene 数据。
- `InteractionAttempt.isCorrect` 支持 `null`，明确区分“已提交但未评分”和“答对”；未评分互动可满足必做提交规则，但不会被 `minCorrect` 统计为正确，运行时也不会错误发送 correct / incorrect 事件。
- 文本判题统一执行 Unicode NFKC、首尾空白、连续空白和大小写规范化，不自动忽略未配置的标点差异。
- `SceneProgressStore` 按 project、editor / learner 上下文和 scene 隔离保存 Mock 进度；刷新后恢复完整尝试历史、最长实际播放时间和完成状态，Reset、Scene 删除和 JSON 替换会同步清理失效进度。
- 课程大纲展示 lesson / unit 完成聚合、Scene 的未开始 / 进行中 / 已完成状态和完成比例；编辑者与学习者预览互不污染。
- 错题队列按每个 interaction 的最新一次作答聚合；答对重试会自动移出 Review，并通过 `target_locator` 关联 Scene 知识点引用，可从课程大纲直接返回错题场景。
- 运行事件面板支持 All、Scene、Answers、Media、Custom 筛选，并把当前 Scene 的事件与 Review 结果分开展示。
- 判题、运行时、事件筛选和 lesson 进度测试共 16 个，覆盖正确、错误、顺序、文本规范化、开放/精确简答、观看完成、重试、上下文隔离、错题关联和事件分类。

Phase 4 计划中的题型、录音占位、角色扮演占位、事件检查、lesson 进度和错题关联已经形成前端运行时闭环，但当前 Course Studio 的信息架构、内容编辑画布和时间轴尚未达到产品可用标准。Phase 5 已冻结，下一阶段改为执行 [Course Studio 可用性重构实施计划](08-course-studio-usability-refactor-plan.md) 中的 Phase U0-U4。撤销 / 重做统一使用已安装的 `travels@2.2.0`，完成中文界面、模式化工作区、直接内容编辑、时间轴重做和真实用户验收后，再恢复模板与效率工具。

仍未接入数据库、API、资源上传、权限、审核发布和真实学习进度。
