# HSKWise 第二阶段：规模化课程生产基础开发计划

本文是 HSKWise 完成首条 Frontend Learning Alpha 学习闭环后，进入课程规模化生产阶段的当前执行方案。网站前端已经证明“路线 -> 课程 -> 反馈 -> 错题 -> 复习”可以运行；第二阶段不再扩展 FE7 专项回归，而是稳定课程数据协议、课程类型和交互组件，为后续批量生产可审核的原创课程 JSON 做准备。

| 项目 | 当前值 |
|---|---|
| 决策日期 | 2026-08-21 |
| 文档状态 | 第二阶段当前执行方案 |
| 当前子阶段 | CP3：语音与拼音课程体系 |
| 最近归档 | [CP2-03：检查点 v2 迁移与运行时收束](progress/CP2-03-checkpoint-v2-migration-and-runtime-consolidation.md) |
| 核心目标 | 课程 schema 与 React 交互组件分离，课程实例以可校验 JSON 生产 |
| 内容边界 | 官方大纲确定范围，教材 OCR 只研究教学方法，正文、题目和反馈必须原创 |
| 技术边界 | 纯前端、本地 JSON、Zod、Jotai/Jotai Immer、`hanzi-writer@3.7.3`、`hanzi-writer-data@2.0.1`；暂不接数据库和后端 API |
| 工具策略 | 不重启通用 Course Studio；JSON 维护成为真实瓶颈后再评估轻量工具 |

## 1. 阶段决策

### 1.1 为什么现在进入第二阶段

第一阶段已经完成四类可运行课程和完整学习闭环：

- 拼音与声调课程验证了可视化、音频、听辨、跟读和录音。
- 情境对话课程验证了逐句探索、理解、拖放排序和角色扮演。
- 生词课程验证了语境发现、音形义联系、主动回忆和句中应用。
- 综合检查验证了跨课程知识引用、错误记录、复习队列和路线推进。

这些真实实现已经足以暴露稳定的重复结构，可以从“代码优先”进入“模板提取和数据生产”，不再需要继续通过更多页面原型猜测抽象。

### 1.2 第二阶段要解决的问题

当前四个课程 schema 合计 1076 行，四份课程内容合计 939 行，四个 Experience 合计 923 行。主要问题不是缺少 schema，而是协议和组件边界仍然过细：

- 课程 step 使用 `tone-overview`、`word-focus`、`dialogue-explore` 等当前组件视角命名。
- 相同的选择、听辨、排序和总结能力在不同课程 schema 中重复定义。
- `eyebrow`、`instruction`、反馈标题和完成规则存在大量重复作者输入。
- 选项通过 `isCorrect` 携带答案，不便于集中审核答案与干扰项。
- `routeId`、`nodeId` 混入课程内容，削弱课程在不同路线中的复用能力。
- 四个 Experience 重复处理提交、反馈、错题和完成逻辑。
- TypeScript 内容可以引用变量和函数，迁移成独立 JSON 后需要正式的资源引用与编译机制。

### 1.3 第二阶段不做什么

- 不继续把 FE7 扩展成大规模测试工程；迁移时只保留必要的 schema、组件和学习路径回归。
- 不建设自由画布、任意坐标、通用时间轴、任意 CSS 或任意脚本能力。
- 不允许 JSON 直接指定 React 组件、className、Jotai atom、事件函数或内部 action ID。
- 不把教材原文、原题、原图、原音频或教材专有版式转换成正式课程。
- 不接数据库、课程 API、用户账户、云端审核或发布系统。
- 不在缺少真实课程样本时一次性设计覆盖所有 HSK 等级的万能 schema。

## 2. 证据基础与研究原则

### 2.1 当前 OCR 资料规模

`docs/textbooks/` 当前包含 25 份教材与练习册 OCR Markdown，约 160585 行，覆盖旧版 HSK 1-6 级和新版 HSK Course 1-3。OCR 存在标题重复、中英双语重复、表格噪声和识别错误，因此统计结果只用于发现教学模式，不能直接成为课程数据。

初步抽样已经确认以下结构跨教材反复出现：

- 目标、热身、情境课文、生词、语言点讲解、综合练习、课堂任务和学习小结。
- 语音、声母、韵母、拼写规则、声调、跟读和辨音。
- 听力、阅读、书写、口语、汉字和文化内容。
- 选择、判断、填空、搭配、排序、回答问题、跟读、角色扮演、复述、造句和自由写作。

### 2.2 OCR 使用边界

OCR 研究只记录：

- 教学环节名称和出现频率。
- 一节课的教学顺序与内容密度。
- 练习的抽象任务类型，例如“听音后选择图片”。
- 不同等级从识别到理解、应用和表达的难度变化。

OCR 研究不得进入正式课程 JSON 的内容字段。研究输出只保留归一化标签、频次、来源文件和定位信息，不保存教材长段落或题目副本。OCR 也不作为生成原创课文和题目的直接提示词输入。

### 2.3 正式课程事实源

正式课程按以下优先级确定事实：

1. 官方 HSK 大纲：能力目标、任务、话题、词汇、汉字和语法范围。
2. HSKWise 原创教学设计：教学顺序、情境、例句、对话、解释、题目和反馈。
3. 已确认许可证兼容的数据：例如现有词汇主数据，并保留许可证记录。
4. 原创、明确授权或生成后经人工审核的媒体素材。
5. 教材 OCR 只提供教学法观察，不提供可发布表达。

## 3. 核心概念分层

第二阶段必须区分四个容易混淆的概念。

### 3.1 课程原型 Course Archetype

课程原型描述一节课主要培养什么能力，以及推荐的教学节奏。例如“情境对话”通常包含场景导入、逐句探索、理解检查和角色输出。原型提供受控默认流程，但不决定每个 React 组件的实现。

### 3.2 交互原语 Interaction Primitive

交互原语描述学习者实际执行的动作，例如选择、排序、填空、跟读或角色扮演。同一原语可以服务不同课程原型：听力选择和词义选择都使用 `single-choice`，只是在 stimulus 和内容资源上不同。

### 3.3 内容资源 Content Resource

内容资源是可以被多个 step 引用的教学事实，例如词条、对话、篇章、语法点、汉字、音节和媒体。资源不携带页面布局和运行时状态。

### 3.4 学习运行时 Learning Runtime

运行时负责当前步骤、提交、重试、反馈、完成、媒体状态、错题和复习关联。运行时只理解标准化 activity contract，不理解某本教材或某门具体课程。

## 4. 目标架构

```text
官方 HSK 大纲 ───────┐
                     ├─> 原创教学设计 ─> Lesson JSON
OCR 教学方法统计 ────┘                       │
                                             ▼
                                  Zod Schema + 引用校验
                                             │
                                             ▼
                                      Course Compiler
                                             │
                                             ▼
                                      LessonDefinition
                                             │
                                             ▼
                                Lesson Runtime / Jotai Store
                                             │
                                             ▼
                              Interaction Renderer Registry
                                             │
                                             ▼
                                    React 交互与视觉组件
```

依赖方向必须保持单向：

- JSON 依赖 schema 约定，不依赖 React。
- schema、compiler 和领域 model 不依赖 React、Jotai 或页面组件。
- renderer 可以依赖公共 UI 和领域 hooks，但不能直接读写 storage 或底层 atoms。
- `src/app` 继续只保留路由定义。
- 路线通过 lesson ID 引用课程，课程不反向保存路线 ID。

## 5. 课程类型目录

### 5.1 P0：语音与拼音体系

“语音与拼音”不是单独一门四声课，而是一组完整课程系列。

#### A. 发音基础

- 普通话音节由声母、韵母和声调构成。
- 发音部位、发音方法、气流和送气/不送气概念。
- 听觉辨认、口型观察、示范跟读和自我回听。

#### B. 声母系列

- 唇音：`b p m f`。
- 舌尖中音：`d t n l`。
- 舌根音：`g k h`。
- 舌面音：`j q x`。
- 翘舌音：`zh ch sh r`。
- 平舌音：`z c s`。
- 零声母及容易混淆的近音对比。

声母课程不是一次展示完整表格，而是按发音部位分组，形成“观察 -> 听辨 -> 对比 -> 跟读 -> 音节应用”的短课。

#### C. 韵母系列

- 单韵母：`a o e i u ü`。
- 复韵母和组合韵母。
- 前鼻韵母和后鼻韵母。
- `er`、儿化及容易混淆的韵母对比。
- 韵母在真实词语和双音节中的辨认。

具体分组和进入等级必须以官方大纲复核为准，不直接复制教材的章节划分。

#### D. 音节拼合与拼写

- 声母与韵母的合法组合。
- 拼读顺序和音节构建。
- `y/w` 零声母写法。
- `j/q/x` 与 `ü` 的拼写规则。
- `iu/ui/un` 等省写规则。
- 声调符号位置和隔音符号。

#### E. 声调与变调

- 四声的音高方向和声调符号。
- 轻声。
- 双音节声调组合。
- 第三声变调。
- “一”“不”等常见变调。
- 听音标调、看调号辨音和词义对比。

#### F. 音流和韵律

- 双音节和多音节节奏。
- 词重音、句重音、停顿和语调。
- 朗读、跟读、短句模仿和听觉对比。

首批语音专用交互：

| 交互 | 用途 |
|---|---|
| `pronunciation-guide/v1` | 发音部位、方法、口型和气流提示 |
| `sound-contrast/v1` | 两组或多组近音的播放、比较和辨认 |
| `syllable-builder/v1` | 声母、韵母和声调组合成合法音节 |
| `pinyin-listening/v1` | 听音选择声母、韵母、声调或完整音节 |
| `pinyin-spelling/v1` | 拼写规则、声调位置和音节输入 |
| `pronunciation-visualizer/v1` | 声调、音高路径和可视化示范 |
| `speech-repeat/v1` | 标准音频、倒计时、录音、回听和自评 |

### 5.2 P0：情境对话

- 场景目标和角色关系。
- 逐句音频、拼音、翻译和点词解释。
- 表达功能与语用提示。
- 内容理解、对话排序和缺句补全。
- 角色选择、自动轮换、录音回听和参考音频比较。

### 5.3 P0：词汇学习

- 从对话或篇章语境发现词义。
- 汉字、拼音、词义、词性、搭配、例句和音频。
- 识别、听辨、搭配、主动回忆和句中应用。
- 易混词对比和错误回流。

### 5.4 P0：综合检查与复习

- 只复用已学知识，不引入新知识。
- 复用选择、听辨、排序、填空和回忆组件。
- 通过 assessment policy 控制是否立即显示反馈、是否允许重试和如何记录结果。
- 检查点是一种编排与反馈策略，不复制一套 checkpoint 专用题型。

### 5.5 P1：语法与句型

- 从语境观察形式和意义。
- 对比例句并发现规律。
- 词块替换、选词填空、词序构建和纠错。
- 从带提示应用逐步过渡到独立造句。

### 5.6 P1：听力理解

- 音节、词语、短句、对话和篇章分级输入。
- 听音选图、判断、信息定位、顺序恢复和简答。
- 支持播放次数、字幕可见性和答题后精听策略。

### 5.7 P1：阅读理解

- 通知、消息、对话、短文和说明性篇章。
- 主旨、细节、指代、词义和顺序理解。
- 支持段落、重点词、问题和解析的结构化引用。

### 5.8 P2：汉字学习

- 字形、读音、意义和词语关联。
- 笔画、笔顺、部件、偏旁和结构。
- 部件组合、结构辨认、描写、拼音输入和汉字输入。
- 笔顺展示和书写练习统一基于已安装的 `hanzi-writer@3.7.3`，不自研笔画路径、笔顺动画和轨迹判定引擎。
- 使用静态参考、整字动画、单笔演示、笔画高亮、引导练习和 quiz 等模式组成从观察到独立书写的渐进流程。
- Hanzi Writer 的逐笔正确、错误和完成回调统一转换为 Lesson Runtime 的语义事件，不允许组件直接修改课程状态。
- 轨迹判定只说明当前笔画是否符合练习规则，不把它夸大为完整的汉字书写质量评分。

### 5.9 P2：口语任务

- 跟读、替换表达、看图说话、回答问题、复述和角色任务。
- 没有可靠评分服务时，只提供录音、回听、参考表达和 rubric 自评。
- 不用录音时长或音量虚构发音准确度。

### 5.10 P2：写作任务

- 词块组句、句子补全、看图写句和短文写作。
- 提供任务约束、关键词、结构提示、参考答案和自查清单。
- 自动判题只用于具有确定答案的拼音、汉字、词序和填空。

### 5.11 文化内容的定位

文化不是首批独立交互类型。文化目标通过对话、阅读、听力或任务课程承载，并使用 `topics`、`cultureTags` 和知识点引用标记。只有多个原创文化课程证明存在独立且稳定的教学流程后，才建立新的课程原型。

## 6. 交互原语目录

第二阶段首批交互原语控制在约 14 个。新增教材题型时先尝试映射到这些学习动作，不根据栏目名称创建组件。

| 原语 | 典型任务 | 自动判定 | 完成条件 |
|---|---|---|---|
| `content-explore/v1` | 场景导入、解释、总结 | 否 | 主动继续或完成必要展开 |
| `audio-explore/v1` | 逐条播放、精听 | 否 | 必需音频全部播放 |
| `single-choice/v1` | 词义、听辨、阅读选择和判断 | 是 | 正确或按策略提交 |
| `matching/v1` | 词义、图片、搭配 | 是 | 全部匹配正确 |
| `ordering/v1` | 词块、句子、对话排序 | 是 | 顺序正确 |
| `cloze/v1` | 选词、拖放或输入填空 | 是/部分 | 所有空完成并判定 |
| `short-input/v1` | 拼音、汉字、短答 | 是/人工 | 标准化后判定或自评 |
| `active-recall/v1` | 先回忆再揭示 | 自评 | 完成揭示与掌握选择 |
| `speech-repeat/v1` | 跟读、录音和回听 | 自评 | 完成指定录音与回听 |
| `role-play/v1` | 多角色自动轮换 | 自评 | 完成所有用户回合 |
| `free-response/v1` | 口语、复述、写作 | 人工/自评 | 提交内容并完成 rubric |
| `character-writing/v1` | Hanzi Writer 笔顺演示、逐笔练习和 quiz | 有限 | 完成指定演示或书写模式 |
| `pronunciation-explore/v1` | 发音与声调可视化 | 否 | 完成观察和示范播放 |
| `syllable-builder/v1` | 声母、韵母和声调拼合 | 是 | 合法组合完成 |

`stimulus` 与交互动作分离：

- 图片选择题 = image stimulus + `single-choice`。
- 听力判断题 = audio stimulus + `true-false`。
- 阅读排序题 = passage stimulus + `ordering`。
- 看图说话 = image stimulus + `free-response`。

## 7. Lesson Schema v2

### 7.1 设计原则

- 使用统一的 `lesson/v2` 外壳，活动 schema 按原语拆分文件。
- `lesson.type` 表示课程原型；`steps[].type` 表示交互原语和版本。
- JSON 只保存作者需要决定的内容，不保存可以稳定派生的运行时字段。
- 显式保留 lesson ID、step ID 和 knowledge ID；interaction ID 从 step ID 派生。
- 选项与答案分离，便于人工集中检查答案。
- 课程级资源集中定义，step 通过稳定 ID 引用，避免复制对话、词条和媒体。
- schema 校验结构，compiler 校验跨资源引用和课程原型约束。
- 发布门禁与运行时容错分离：草稿可以带占位素材，发布版本必须全部可发布。

### 7.2 建议的课程 JSON

```json
{
  "$schema": "../../schemas/lesson-v2.schema.json",
  "schemaVersion": "lesson/v2",
  "id": "hsk3-l1-initials-bpmf-01",
  "type": "pronunciation",
  "meta": {
    "title": "认识 b、p、m、f",
    "description": "观察并辨认四个唇音。",
    "level": { "standard": "hsk3", "value": "1" },
    "estimatedMinutes": 8,
    "topics": ["pronunciation", "initials"]
  },
  "objectives": [
    {
      "knowledgeId": "pinyin.initials.bpmf",
      "canDo": "辨认并跟读 b、p、m、f。"
    }
  ],
  "resources": {
    "phonemes": [
      { "id": "initial.b", "symbol": "b", "audioRef": "audio.initial-b" },
      { "id": "initial.p", "symbol": "p", "audioRef": "audio.initial-p" }
    ],
    "media": [
      {
        "id": "audio.initial-b",
        "kind": "audio",
        "src": "/audio/placeholders/initial-b.mp3",
        "rights": {
          "origin": "generated-placeholder",
          "publishable": false,
          "mustReplaceBeforePublish": true
        }
      }
    ]
  },
  "steps": [
    {
      "id": "compare-b-p",
      "type": "sound-contrast/v1",
      "targetRefs": ["initial.b", "initial.p"],
      "prompt": "听一听送气强弱有什么不同。"
    },
    {
      "id": "identify-b",
      "type": "single-choice/v1",
      "stimulus": { "kind": "audio", "ref": "audio.initial-b" },
      "prompt": "你听到的是哪个声母？",
      "options": [
        { "id": "b", "label": "b" },
        { "id": "p", "label": "p" }
      ],
      "answer": "b",
      "knowledgeIds": ["pinyin.initials.bpmf"],
      "feedback": {
        "correct": "这是较弱气流的 b。",
        "retry": "再比较一次送气强弱。"
      }
    }
  ]
}
```

正式内容首先使用英文还是中文、是否进入多语言字段，将在 CP1 结合实际内容团队工作语言决定。第一版不为了未来国际化把每个短字符串都包成复杂对象，但字段结构必须保留后续迁移空间。

### 7.3 可派生字段

以下字段默认不由课程作者填写：

- `interactionId`：从 `lessonId + stepId` 派生。
- 普通选择、排序和填空的 completion rule：从 activity contract 派生。
- 默认反馈标题、按钮文案、步骤类型标签和无障碍说明：由组件提供。
- 路线、节点和前置关系：由路线 manifest 持有。
- 当前步骤、答题状态、媒体状态和重试次数：由运行时持有。
- `isCorrect`：由独立 `answer` 与学习者答案计算。

### 7.4 必须显式保留的字段

- 课程、步骤、资源和知识点稳定 ID。
- 教学目标和知识点引用。
- 原创 prompt、选项、答案、解释和有教学价值的反馈。
- 媒体引用、来源、版权状态和占位标记。
- 对自动判题有影响的规范化规则。
- 对课程体验有实际意义的 assessment policy 覆盖。

### 7.5 独立版本

- 外壳版本：`lesson/v2`。
- 交互版本：例如 `single-choice/v1`、`role-play/v1`。
- 资源版本只在结构确实需要变化时增加。
- 已发布 JSON 不因组件更新而静默改变语义。
- migration 必须是显式纯函数，并有迁移前后 fixture。

## 8. 内容资源模型

首批资源模块：

| 资源 | 核心字段 |
|---|---|
| `phoneme` | symbol、类别、发音提示、示范音频、对比目标 |
| `syllable` | initialRef、finalRef、tone、writtenForm、audioRef |
| `lexeme` | 汉字、拼音、词性、释义、搭配、例句、audioRef |
| `dialogue` | roles、lines、tokens、translation、line audio |
| `passage` | blocks、translation、重点词、audioRef |
| `grammarPattern` | form、meaning、constraints、examples、counterExamples |
| `character` | glyph、pinyin、meaning、radicals、components、可选 strokeDataKey |
| `media` | kind、src、alt/label、rights、placeholder、publishable |

资源引用必须满足：

- 引用存在且类型正确。
- 同一作用域 ID 唯一。
- 课程知识点引用存在于知识目录。
- 题目答案必须存在于选项或可接受答案集合。
- 对话 speaker、line、token 引用有效。
- 发布课程引用的所有媒体均通过版权门禁。

## 9. Renderer 与运行时契约

### 9.1 Renderer Registry

唯一的 renderer registry 负责将 activity type 映射为 React 组件：

```ts
type ActivityRendererProps<TActivity> = {
  activity: TActivity
  resources: ResolvedLessonResources
  state: LessonActivityState
  actions: LessonActivityActions
}
```

- registry 中保存代码映射，JSON 不保存组件名。
- 公共 activity 使用共享 renderer。
- 语音可视化、对话角色扮演和汉字描写允许专用 renderer。
- 重型专用 renderer 按课程原型建立可分析的动态加载边界。

### 9.2 领域 Hook

建立聚合但不过度膨胀的领域 hooks：

- `useLessonActivity`：当前 activity、提交、完成和反馈。
- `useActivityAttempt`：答案、重试和禁用状态。
- `useLessonMedia`：统一媒体状态与完成上报。
- `useLessonMistakeLink`：错误到 knowledge/step 的稳定关联。
- `useSpeechCapture`：录音权限、倒计时、录制、回听和释放资源。

交互组件只发出 `submit`、`completeMedia`、`completeSelfAssessment` 等语义动作，不直接写 Jotai atom 或 localStorage。

### 9.3 课程原型约束

课程原型不是另一套页面 switch。它主要负责：

- 允许的资源和 activity 集合。
- 推荐教学节奏和必需能力。
- 跨 step 约束，例如角色扮演引用同一组对话角色。
- 默认 assessment policy。
- 原型级完成和内容质量检查。

### 9.4 Hanzi Writer 集成边界

汉字笔顺和书写练习采用 `hanzi-writer@3.7.3`，笔画数据来自已安装的 `hanzi-writer-data@2.0.1`。React 层建立单一 `HanziWriterPractice` 适配组件，课程 JSON 只选择教学模式和内容，不直接暴露 Hanzi Writer 的完整 options 或数据文件路径。

首批语义模式：

| 模式 | Hanzi Writer 能力 | 学习目的 |
|---|---|---|
| `reference` | `showCharacter`、`showOutline` | 观察字形、结构和笔画轮廓 |
| `animation` | `animateCharacter`、`animateStroke` | 观看完整或单笔笔顺演示 |
| `guided-practice` | `quiz` + outline + mistake hint | 在轮廓和提示下逐笔练习 |
| `independent-practice` | `quiz` + 受控提示策略 | 减少提示后独立完成书写 |

课程 JSON 可以配置的字段保持窄范围：

```json
{
  "id": "write-ni",
  "type": "character-writing/v1",
  "characterRef": "character.你",
  "mode": "guided-practice",
  "practicePreset": "beginner",
  "knowledgeIds": ["hanzi.hsk3-l1.你"]
}
```

实现约束：

- `practicePreset` 映射到代码内受控的 outline、提示次数、宽容度和完成高亮配置，JSON 不直接传 `leniency`、颜色或任意库参数。
- `onMistake`、`onCorrectStroke` 和 `onComplete` 被 adapter 转换为 `stroke.missed`、`stroke.completed` 和 `activity.completed` 等领域事件。
- 组件卸载或字符切换时取消 quiz 和动画并销毁实例，避免重复监听和 Canvas/SVG 资源泄漏。
- 尺寸由响应式容器控制，通过 `updateDimensions` 同步，动态状态不得改变练习区布局尺寸。
- reduced-motion 下不自动循环整字动画，提供逐笔按钮和静态轮廓替代。
- 加载失败时显示明确的重试或只读字形回退，不让课程卡在无法完成状态。
- Hanzi Writer 默认从 jsDelivr 获取字形数据；正式课程改用 `characterDataLoader` 从项目本地静态目录按字符加载，避免运行时依赖第三方 CDN。
- `hanzi-writer-data` 当前包含约 9575 个字符、约 47 MB 数据。不得把整个包导入客户端 bundle，也不使用无法静态分析的变量 import 收集全部 JSON。
- catalog 构建脚本扫描已发布课程的 character refs，从 `node_modules/hanzi-writer-data/{字}.json` 复制实际使用的字符到生成目录，并输出字符数据 manifest。
- 运行时 loader 根据 glyph 或少量 `strokeDataKey` override 请求单个本地 JSON；当前步骤只加载当前字符，可在空闲时预取下一步骤字符。
- compiler 必须在构建阶段验证课程引用的字符存在于 `hanzi-writer-data`，缺失字符阻止进入 published catalog。
- 生成的字符静态文件是可重复构建产物，不由课程作者手工维护，也不在 lesson JSON 中写文件路径。
- Hanzi Writer 代码采用 MIT License；`hanzi-writer-data` 的 package license 明确指向 `ARPHICPL.TXT`，数据源自 Make Me a Hanzi。发布产物需要携带对应许可证文本和 attribution，不能把依赖安装视为版权审核完成。

## 10. 当前 v1 到 v2 的映射

| 当前 kind | v2 目标 |
|---|---|
| `tone-overview` | `pronunciation-explore/v1` |
| `pitch-guide` | `pronunciation-explore/v1` + audio resources |
| `pronunciation-practice` | `speech-repeat/v1` |
| `tone-choice` | `single-choice/v1` + tone stimulus |
| `tone-listening-choice` | `single-choice/v1` + audio stimulus |
| `lesson-check` | 展开为多个标准 activity，由 section/group 编排 |
| `scene-intro` | `content-explore/v1` |
| `dialogue-explore` | `audio-explore/v1` 或对话专用展示模式 |
| `comprehension-choice` | `single-choice/v1` |
| `line-order` | `ordering/v1` |
| `role-practice` | `role-play/v1` |
| `context-discovery` | `content-explore/v1` + lexeme refs |
| `word-focus` | `content-explore/v1` 的词汇展示模式 |
| `meaning-choice` | `single-choice/v1` |
| `listening-choice` | `single-choice/v1` + audio stimulus |
| `active-recall` | `active-recall/v1` |
| `sentence-application` | `cloze/v1` 或 `single-choice/v1` |
| 各类 `*-summary` | `content-explore/v1` 的 summary purpose |
| `checkpoint-*` | 标准 activity + assessment policy |

迁移原则：先保证现有课程行为一致，再删除 v1 schema。CP2 迁移可由现有标准原语完整表达的对话、词汇和检查点；四声课需要语音专用原语，由 CP3 作为语音 v2 基准迁移。全部四门课程完成迁移且内容 diff 人工审核后，才移除 v1。

## 11. 建议目录结构

```text
src/courses/
  content/
    lessons/                  # 人工维护的课程 JSON
    reviews/                  # 审核状态 sidecar JSON
    catalog.json              # 可发布课程清单
  schema/
    lesson-schema.ts          # lesson/v2 外壳
    resources/                # phoneme、lexeme、dialogue 等
    activities/               # 每个交互原语独立 schema
    archetypes/               # 原型级约束
  compiler/
    compile-lesson.ts
    resolve-resources.ts
    validate-references.ts
    migrations/
  interactions/
    registry.ts
    single-choice/
    ordering/
    cloze/
    speech-repeat/
    role-play/
    character-writing/       # HanziWriterPractice 与领域 adapter
    ...
  archetypes/
    pronunciation/
    dialogue/
    vocabulary/
    grammar/
    ...
  lesson-registry.ts

scripts/content/
  analyze-ocr-methods.*
  validate-lessons.*
  build-lesson-catalog.*
  audit-publishability.*
  build-hanzi-data.*          # 从 hanzi-writer-data 抽取课程所需字符

docs/course-production/
  research/
  authoring/
  reviews/
```

目录在 CP1 实现前根据实际依赖再确认，不为了匹配文档提前移动全部文件。

## 12. OCR 教学方法盘点流程

### 12.1 自动提取

- 枚举教材、级别、教材/练习册类型和行数。
- 提取 Markdown 标题、题目指令和中英双语活动名称。
- 去除 HTML 表格属性、页码、题号和明显 OCR 噪声。
- 合并“选择正确答案”“请选择正确答案”等同义标签。
- 统计活动在不同级别、教材和章节中的分布。

### 12.2 人工归类

每个抽象活动记录：

- 学习技能：语音、听、说、读、写、词汇、语法、汉字。
- 认知动作：识别、理解、回忆、比较、排序、应用、表达、反思。
- 输入形式：文本、音频、图片、对话、篇章。
- 输出形式：选择、拖放、输入、录音、自由表达、自评。
- 判定方式：确定答案、多答案、rubric、人工或自评。
- 适用等级和内容密度。

### 12.3 研究产物

- `ocr-method-frequency.md`：归一化教学活动频次。
- `course-archetype-catalog.md`：课程原型及证据。
- `interaction-primitive-catalog.md`：活动到交互原语的映射。
- `level-density-notes.md`：不同等级的步骤、文本和输出密度观察。
- `copyright-boundary.md`：研究材料与原创生产之间的隔离规则。

这些文件只保存研究结论和定位，不成为课程内容仓库。

## 13. 内容生产与人工审核

### 13.1 生产流程

```text
选择官方能力目标
  -> 选择课程原型
  -> 编写原创教学设计
  -> 编写原创资源与活动 JSON
  -> schema 和引用校验
  -> 本地可视化预览
  -> 语言审核
  -> 教学审核
  -> 答案与反馈审核
  -> 媒体版权审核
  -> OCR 相似度预警与人工复核
  -> 加入可发布 catalog
```

### 13.2 审核 sidecar

课程正文和审核状态分开保存，避免审核记录污染内容 schema：

```json
{
  "lessonId": "hsk3-l1-initials-bpmf-01",
  "contentRevision": "sha256:...",
  "status": "instructional-review",
  "checks": {
    "language": "approved",
    "instructional": "pending",
    "answers": "approved",
    "rights": "blocked",
    "similarity": "review-required"
  }
}
```

当内容 revision 改变时，相关审核自动失效，不允许旧审核状态覆盖新内容。

### 13.3 生命周期

```text
draft
  -> language-review
  -> instructional-review
  -> rights-review
  -> approved
  -> published
```

任何 `placeholder`、`restricted-reference`、`publishable: false`、损坏引用或未完成审核都会阻止进入 published catalog。

相似度检测是人工审核的预警工具，不把某个百分比阈值视为版权安全证明。

## 14. 分阶段开发路线

### CP0：能力盘点与课程分类，3-5 个工程日

任务：

- 冻结当前 v1 schema，不继续增加 course-specific kind。
- 完成现有 schema、Experience、hooks、运行时和媒体能力清单。
- 建立当前 26 类左右 step 到交互原语的完整映射。
- 扫描 25 份 OCR 文档，生成归一化活动频次。
- 结合官方大纲确定 P0/P1/P2 课程原型清单。
- 明确哪些能力复用、哪些需要新组件、哪些延后。

产物：OCR 方法统计、课程原型目录、交互原语目录、v1 映射表、版权研究边界。

退出标准：每个拟开发组件都能对应真实教学动作；没有因为教材栏目名称创建组件。

### CP1：Lesson Schema v2 与编译器，5-7 个工程日

任务：

- 建立统一 lesson envelope、资源 schema 和首批 activity schema。
- 建立引用解析、答案校验、稳定 ID 和发布门禁。
- 生成供编辑器和 IDE 使用的 JSON Schema。
- 建立显式 migration 约定和 schema version 规则。
- 用一门对话课和一门词汇课制作 v2 JSON 试点。
- 对比 v1/v2 的可读性、字段数量和人工审核效率。

退出标准：两门试点课程不包含代码或样式；JSON 可以独立校验、编译和人工理解。

### CP2：Renderer Registry 与运行时收敛，6-8 个工程日

任务：

- 建立 activity renderer contract 和 registry。
- 建立 `useLessonActivity` 等领域 hooks。
- 集中提交、反馈、错题、完成和媒体上报逻辑。
- 把现有选择、排序、主动回忆、音频探索和角色扮演接入 registry。
- 迁移可由标准原语表达的对话、词汇和检查点课程，保持学习体验不变。
- 移除三门已迁移课程 Experience 中重复的业务提交代码；四声 Experience 在 CP3 语音原语就绪后移除。

退出标准：通用活动课程由 JSON + registry 渲染；新增相同 activity 不修改课程页面 switch；四声课的专用迁移边界和 CP3 任务明确。

### CP3：语音与拼音课程体系，8-12 个工程日

任务：

- 先迁移现有四声课程作为语音 v2 基准。
- 实现 `pronunciation-guide`、`sound-contrast`、`syllable-builder`、`pinyin-listening` 和 `pinyin-spelling`。
- 为声母、韵母、拼合、声调和音流建立原创 fixture。
- 优先制作一组唇音声母课和一组单韵母课验证协议。
- 验证音频占位、播放失败、录音拒绝和自评路径。
- 检查拼音 Unicode、声调符号和答案规范化。

退出标准：至少两组声母/韵母内容共用同一组件和 schema；新拼音课程只增加 JSON 和素材。

### CP4：高频理解与语言结构组件，8-12 个工程日

任务：

- 实现 `true-false`、`matching`、`cloze`、`short-input`。
- 建立语法、听力和阅读课程原型约束。
- 支持文本、图片、音频和篇章 stimulus。
- 为每个原语准备两份内容长度不同的原创 fixture。
- 建立 assessment policy，供学习、练习和检查点复用。

退出标准：语法、听力和阅读课程可以主要通过组合共享原语生产，不增加专用页面。

### CP5：汉字、口语与写作组件，8-12 个工程日

任务：

- 建立 character resource 和笔画/部件模型。
- 基于 `hanzi-writer@3.7.3` 实现 `character-writing/v1`，覆盖 reference、animation、guided-practice 和 independent-practice。
- 建立窄范围 practice preset，不把 Hanzi Writer 原始 options 泄漏到 JSON。
- 使用 `hanzi-writer-data@2.0.1` 作为本地笔画数据源，建立 catalog 驱动的字符抽取脚本和数据 manifest。
- 使用 `characterDataLoader` 按当前汉字加载单个本地 JSON，不把完整数据包打入客户端，并完成缺失数据和加载失败回退。
- 将逐笔正确、错误和 quiz 完成回调接入统一 Lesson Runtime；正确释放实例和监听。
- 实现自由表达 `free-response`。
- 扩展 `speech-repeat` 支持复述和看图表达。
- 建立口语/写作 rubric 和诚实自评流程。
- 明确哪些题目自动评分，哪些必须人工或自评。

退出标准：两组不同汉字内容通过同一 `character-writing/v1` schema 和组件完成笔顺演示与练习；浏览器只请求课程所需的单字数据且不访问外部 CDN；产出型活动不会虚构准确度；学习者能保存、回听或检查自己的输出。

### CP6：内容生产管线与小批量试产，5-8 个工程日加内容制作时间

任务：

- 建立课程 catalog、批量验证、引用检查和审核 sidecar。
- 建立占位素材和未审核内容的发布阻断。
- 建立 OCR 相似度预警流程，只输出风险定位供人工审核。
- 使用原创内容制作 10-20 门跨类型课程。
- 记录单课制作时间、审核轮次、schema 缺口和组件缺口。
- 根据真实数据决定是否需要轻量表单工具。

退出标准：非组件开发工作可以主要通过新增和校订 JSON 完成；所有发布课程均有可追溯审核状态。

## 15. 每阶段验证要求

不继续扩展 FE7 的全站专项回归，但第二阶段的架构迁移仍必须有必要验证：

- schema 接受合法 JSON 并拒绝代码、样式、损坏引用和错误答案。
- compiler 输出稳定 LessonDefinition，不依赖 React。
- 每个新交互至少使用两份不同内容 fixture。
- 每次 v1 -> v2 迁移对现有课程执行一条核心浏览器 smoke path。
- 交互组件覆盖键盘、触控、反馈、错误和 reduced-motion 基线。
- 媒体失败和权限拒绝不阻断整门课程。
- Hanzi Writer 字形数据缺失或加载失败时提供可完成的回退路径；reduced-motion 不自动循环动画。
- 发布检查拒绝所有占位或版权未确认素材。
- 阶段完成后保存独立进度文件。

## 16. 规模化生产指标

第二阶段不以组件数量作为唯一进度，重点观察：

| 指标 | 目标方向 |
|---|---|
| 新增同类课程是否修改 TSX | 应为否 |
| JSON 中代码/样式字段 | 必须为 0 |
| 损坏资源或知识点引用 | 必须为 0 |
| 未审核内容进入 catalog | 必须为 0 |
| 占位素材进入 published | 必须为 0 |
| 单课程 schema 错误定位 | 必须能定位到文件和字段路径 |
| 同一交互跨课程复用 | 每个公共原语至少 2 份 fixture |
| 人工审核可读性 | 审核者无需阅读 React 或运行时代码 |
| 新课程生产时间 | 在 CP6 记录基线并持续下降 |
| schema 逃生字段 | 任意 CSS、脚本、坐标和表达式必须为 0 |

## 17. 风险与控制

| 风险 | 控制方式 |
|---|---|
| 统一 schema 再次膨胀 | 一个外壳 + 分模块 activity；单例需求建立专用原语或延后 |
| 课程变成通用幻灯片 | 原型保留教学节奏和专用体验，原语只统一学习动作 |
| JSON 比 React 更难读 | 删除派生字段，资源集中引用，用两门试点做人工审核 |
| 所有 renderer 打进同一 bundle | 按课程原型建立静态可分析的动态加载边界 |
| OCR 噪声误导分类 | 自动统计只做候选，人工抽样和官方大纲复核后定稿 |
| 教材内容进入正式课程 | 研究目录与生产目录隔离，原创审核和相似度预警 |
| AI 生成内容质量不稳定 | AI 只草拟，不自动发布；语言、教学、答案和版权逐项审核 |
| 自动评分虚构能力 | 确定答案才自动判定，口语写作使用回听、rubric 或人工审核 |
| Hanzi Writer 外部数据不可用 | 从已安装的 `hanzi-writer-data` 抽取课程字符并本地按需加载，adapter 提供失败回退 |
| 完整汉字数据库进入客户端 | catalog 只生成已发布课程字符清单，禁止变量 import 收集整个 47 MB 数据包 |
| Hanzi Writer 配置泄漏到 JSON | 课程只选择语义 mode 和 practice preset，原始 options 保留在 adapter 代码中 |
| 汉字依赖许可证遗漏 | 同时记录库的 MIT License 和字形数据的 Arphic Public License attribution |
| 过早重建 Studio | 完成 CP6 且 JSON 维护成为量化瓶颈后再决策 |

## 18. 下一步立即执行顺序

CP2 已完成并归档。CP3 按以下顺序推进：

1. 盘点现有四声课程中声调轮廓、听辨、跟读、录音回听和综合检查的真实协议，确定可复用部分与语音专用状态。
2. 先定义 `pronunciation-guide/v1`、`pronunciation-visualizer/v1`、`sound-contrast/v1` 和 `speech-repeat/v1` 的最小 schema 与 renderer contract。
3. 将四声课迁移为 `lesson/v2` 语音基准，保持现有声调路径动画、四选项听辨和录音反馈体验。
4. 删除最后一个正式 v1 Experience，并在确认 legacy fixture 已无独立价值后清理 v1 schema 与 TypeScript 内容。
5. 用一组唇音声母课和一组单韵母课验证同一语音原语能服务不同内容，不通过 TSX 分支扩展课程。
6. 补齐拼音 Unicode、声调符号、媒体失败、录音拒绝和 reduced-motion 验证。

第二阶段完成前，数据库、后端 API、完整 Course Studio 和批量 AI 自动发布继续保持暂停。
