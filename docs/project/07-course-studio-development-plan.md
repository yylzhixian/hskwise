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

### Phase 4：互动体验闭环

目标：先让 Course Studio 做出的课件在前端形成完整互动体验，再决定后端事件模型。

交付：

- 多题型 interaction：multipleChoice、matching、ordering、cloze、dictation。
- 跟读录音占位流程：录音、回放、提交，评分可后续接入。
- 角色扮演占位流程。
- 前端事件面板：显示开始、暂停、答题、错误、重试、完成等事件。
- Mock scene progress。
- Mock 错题与 `course_scene_refs` / `target_locator` 关联。

验收：

- 用户完成 scene 后能在前端看到完成状态。
- 答错题能在前端事件流中关联到 scene、interaction、知识点。
- 后端接入前已经能验证哪些事件值得持久化。

### Phase 5：模板和效率工具

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
      renderer/
        scene-player.tsx
        element-renderer.tsx
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
