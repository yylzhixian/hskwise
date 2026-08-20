# Course Studio 可用性重构实施计划

本文是 Course Studio 在 Phase 5 之前的专项重构计划。它解决的不是新增功能数量，而是让老师和教研人员能够看懂、开始并完成一次真实制课任务。

> 文档状态：已暂停，保留为历史方案和问题基线。Phase U1 第一批曾经落地，但 2026-08-20 FE4-R1 已将实现从当前源码移除，文内源码路径仅供 Git 历史定位；当前执行[代码优先课程开发与模板演进计划](10-code-first-course-development-plan.md)。

| 项目 | 当前值 |
|---|---|
| 文档状态 | 已暂停，保留历史 |
| 当前阶段 | U1 第一批完成，U2-U4 暂停 |
| 主路线状态 | 转向代码优先课程开发 |
| 历史方案 | `travels@2.2.0` |
| 最后更新 | 2026-08-18 |

原阶段决定与最新调整：

- 冻结 Phase 5 模板提效、批量处理和 AI 草稿能力。
- Phase 0-4 已完成的 schema、播放器、互动题、学习事件和进度模型继续保留。
- Phase 3、Phase 4 的产品状态调整为“底层能力存在，编辑器可用性验收未通过”。
- Phase U1 第一批完成中文壳层、工作模式和 Travels 历史实验。
- U2-U4 不再继续执行，模板能力改为从真实课程代码中提取。

## 1. 产品目标

### 1.1 用户与核心任务

目标用户是 admin、老师和教研人员。Course Studio 的单一核心任务是：

> 在不理解 Scene JSON、Action ID 和运行时事件的前提下，制作、预览并保存一节结构清晰的互动课程。

Phase U 必须支持三条黄金任务：

1. 从现有课程进入指定课节，新增一个场景并填写教学内容。
2. 在场景中添加或修改文本、对话、素材和互动题，并完成预览。
3. 制作“内容出现 -> 音频播放 -> 互动暂停 -> 回答后继续”的时间轴。

### 1.2 成功标准

- 新用户进入编辑器后，不依赖口头指导即可找到“新增场景”“添加内容”“预览课程”。
- 日常制课不需要打开 JSON、Schema、Runtime Events 或输入稳定 ID。
- 默认界面为简体中文，课程内容语言可以独立选择。
- 内容画布、属性面板和时间轴的选中对象始终一致。
- 所有持久化编辑均可撤销和重做，不发生草稿丢失。
- 时间轴在 1280x720 和 1440x900 桌面视口可稳定完成拖动、缩放和精确编辑。
- 0、1、5、20、50 个片段均有明确状态，不出现空白区域或不可操作状态。

### 1.3 本阶段不做

- 不新增 Phase 5 模板类型、AI 生成或批量替换。
- 不新增互动类型。
- 不接数据库、上传、权限、审核和发布 API。
- 不实现多人协作；`travels` 不是 CRDT 或协作冲突解决方案。
- 不实现完全自由画布、任意坐标拖放和复杂图层合成。
- 移动端以查看、预览和轻量修改为目标，不承诺完整桌面时间轴体验。

## 2. 设计原则

### 2.1 任务优先

- 默认展示当前任务所需的最少工具。
- “内容编辑”“动画时间轴”“预览检查”使用独立工作模式，不同时铺开。
- 主操作只保留一个视觉重点；低频能力放入菜单、抽屉或开发工具。
- 空状态直接提供下一步操作，例如“添加第一个场景”或“添加内容”。

### 2.2 教研语言优先

- 用户看到“场景、组件、片段、属性”，不直接看到 element、cue、action、target ID。
- JSON、Schema、Runtime Events、内部 ID 只在开发工具中显示。
- 错误信息说明对象、原因和修复入口，不只显示“校验失败”。

### 2.3 受约束的直接编辑

- 内容画布支持点击选择、内容编辑和布局预设，不在 Phase U 引入完全自由定位。
- 新增组件从组件库或画布插入点进入，不要求先打开属性面板。
- 时间轴允许自由拖动片段，但所有操作必须有数值输入和键盘替代。

### 2.4 安静的生产工具视觉

Course Studio 应呈现为低干扰、可长时间使用的教研工作台，不使用营销页式卡片堆叠。

建议视觉 token：

| 角色 | 建议值 | 用途 |
|---|---|---|
| 工作区底色 | `#F6F7F8` | 画布外背景和分区 |
| 主表面 | `#FFFFFF` | 面板、工具栏、画布 |
| 主文字 | `#17201D` | 标题和正文 |
| 品牌动作 | `#176B4D` | 主按钮、完成状态 |
| 编辑选中 | `#2563EB` | 画布选框、播放头、选中片段 |
| 警告 | `#B45309` | 缺失素材和待处理问题 |
| 错误 | `#B42318` | 阻断错误和删除操作 |

字体角色：

- 中文正文和标题：`PingFang SC`、`Microsoft YaHei`、系统无衬线回退。
- 时间、毫秒、ID 和开发工具：`SFMono-Regular` 或现有等宽字体。
- 不为工作台引入展示型大标题字体；通过字重、分隔和空间表达层级。

Course Studio 的识别性来自“教学结构与时间片段使用同一对象颜色编码”：同一个文本、音频或互动对象在画布、属性面板和时间轴保持一致的图标与选择色。

## 3. 中文界面与术语体系

### 3.1 语言状态分离

必须区分：

```ts
type StudioUiLocale = 'zh-CN' | 'en'

type CourseStudioPreferences = {
  uiLocale: StudioUiLocale
  contentLocale: string
}
```

- `uiLocale` 控制工具栏、菜单、表单、错误和帮助文本，默认 `zh-CN`。
- `contentLocale` 控制当前编辑的课程文本，默认使用项目 `defaultLocale`。
- 切换 UI 语言不能改变课程内容。
- 切换内容语言不能改变 Studio 工具文字。

首轮不引入大型国际化框架，先建立类型安全的 `studio-messages.ts`，禁止新组件继续硬编码界面文字。

### 3.2 统一术语

| 当前技术词 | 中文界面 | 使用位置 |
|---|---|---|
| Course outline | 课程结构 | 左侧大纲标题 |
| Unit | 单元 / 课 | 依据课程模型显示 |
| Section | 教学环节 | 课程结构第二层 |
| Scene | 场景 | 最小制课单元 |
| Element | 组件 | 文本、图片、对话、互动等 |
| Scene Player | 场景预览 | 编辑模式中的预览区域 |
| Inspector | 属性 | 右侧上下文面板 |
| Timeline | 时间轴 | 动画工作模式 |
| Cue | 片段 | 时间轴上的动作片段 |
| Action | 动作 | 片段属性中的行为类型 |
| Editor | 编辑 | Studio 工作状态 |
| Learner | 学员预览 | 全屏预览入口 |
| Checks | 检查 | 预览检查模式 |
| Assets | 素材库 | 内容编辑辅助面板 |
| Templates | 新建 / 从模板添加 | 结构和空状态入口 |
| Schema valid | 数据有效 | 仅检查模式显示 |
| JSON | JSON | 仅开发工具显示 |

## 4. 信息架构

### 4.1 顶部栏

```text
返回课程  /  课程名称        已自动保存       撤销  重做  学员预览  更多
```

顶部栏保留：

- 返回课程。
- 当前课程名称和当前场景面包屑。
- 自动保存状态。
- 撤销、重做。
- 学员预览主按钮。
- 更多菜单：导入、导出、开发工具、重置本地草稿。

顶部栏移除：

- Editor / Learner 技术上下文切换。
- 常驻 Schema valid 徽章。
- 与主操作等权展示的 Import、Export、Assets、Templates。

### 4.2 工作模式

```text
课程结构 | 内容编辑 | 动画时间轴 | 预览检查
```

模式进入 URL：

```text
/admin/studio?mode=content&scene=scene_id&element=element_id
/admin/studio?mode=timeline&scene=scene_id&cue=timeline_step_id
/admin/studio?mode=preview&scene=scene_id
```

URL 只保存可分享、可恢复的工作上下文。播放头、缩放范围、悬停和临时输入不进入 URL。

### 4.3 内容编辑模式

```text
┌ 课程结构 ┬──────────── 内容画布 ────────────┬ 组件属性 ┐
│ 单元      │  + 添加组件                      │ 文本内容 │
│ 教学环节  │  点击组件直接选中                 │ 布局预设 │
│ 场景      │  画布尺寸 / 响应式预览            │ 素材绑定 │
│           │                                  │ 知识点   │
└──────────┴──────────────────────────────────┴──────────┘
```

- 左侧只承担课程树和场景 CRUD。
- 中央为真正的可选择编辑画布，不显示运行事件和学习进度。
- 右侧根据选中对象显示场景属性或组件属性。
- 素材库以可搜索抽屉或资源面板打开。
- 组件未选中时显示场景属性，不显示空白 Inspector。

### 4.4 动画时间轴模式

```text
┌ 课程结构 ┬──────── 场景预览 ────────┬ 片段属性 ┐
│ 当前场景  │ 播放 / 暂停 / 播放头      │ 动作类型 │
├──────────┴──────────────────────────┴──────────┤
│ 组件轨道  │ 时间标尺、片段、吸附、缩放、滚动             │
│ 音频轨道  │                                             │
│ 互动轨道  │                                             │
└────────────────────────────────────────────────────────┘
```

- 时间轴占工作区主要垂直空间，不再挤在所有模式底部。
- 选中片段的属性进入右侧，不再使用底部超宽表单。
- 左侧轨道名称与画布对象同步选择。
- 时间轴首次加载显示轨道骨架和加载状态，禁止出现无解释空白。

### 4.5 预览检查模式

- 默认显示干净的学员预览。
- 检查结果位于右侧抽屉，可定位到场景、组件或时间片段。
- 学习事件、进度和 Review 进入开发调试抽屉，默认关闭。
- JSON 编辑进入开发工具，并明确标记为高级能力。

## 5. 状态架构

### 5.1 状态分类

| 状态类型 | 示例 | 管理方式 | 是否进入撤销历史 |
|---|---|---|---|
| 课程文档 | course、unit、section、scene、asset、knowledge ref | `travels` | 是 |
| 工作区 UI | mode、选中场景、选中组件、面板开关 | React/UI store + URL | 否 |
| 时间轴视图 | zoom、range、滚动、hover、drag preview | Timeline UI state | 否 |
| 播放器运行时 | playhead、playing、waiting、runtime events | Scene runtime | 否 |
| 学习结果 | SceneProgress、attempt、Review | 独立 progress store | 否 |
| 临时表单 | 正在输入但尚未提交的值、IME composition | 组件本地状态 | 否，提交后进入 |

严禁把播放器播放头、事件、Review 或面板开关放入课程文档历史。

### 5.2 组件职责

目标拆分：

```text
CourseStudioApp
  CourseStudioProvider
    CourseStudioTopbar
    StudioModeNavigation
    CourseOutline
    ContentWorkspace
      SceneCanvasEditor
      ComponentLibrary
      ContextInspector
    TimelineWorkspace
      ScenePreview
      TimelineEditor
      CueInspector
    PreviewWorkspace
      LearnerPreview
      ValidationDrawer
    StudioDevTools
```

运行时继续拆分：

```text
SceneRuntimeEngine       纯播放和事件状态
SceneRenderer            纯渲染
SceneCanvasEditor        编辑选择层和插入层
ScenePreview             编辑器播放器外壳
LearnerScenePlayer       学员播放器外壳
```

## 6. Travels 撤销与重做方案

### 6.1 已确认依赖

- 使用已安装的 `travels@2.2.0`。
- 使用已安装的 `mutative@1.3.0`。
- 使用 `createTravels` 的 immutable 模式。
- React 通过 `useSyncExternalStore` 订阅，不再同时维护另一份可写 `project` state。
- 初始建议 `maxHistory: 100`，根据 50 片段压力测试结果调整。

建议入口：

```ts
const travels = createTravels<CourseStudioProject>(initialProject, {
  autoArchive: false,
  maxHistory: 100,
  enableAutoFreeze: true,
  onBranchDiscard: handleBranchDiscard,
  onError: handleHistoryError,
})
```

选择 `autoArchive: false` 的原因：文字输入、连续拖动和多个关联字段更新需要合并成一个用户动作，不能让每个键盘字符或 pointer move 成为一条历史。

### 6.2 历史 metadata

```ts
type StudioHistoryMetadata = {
  label: string
  timestamp: number
  source:
    | 'outline'
    | 'canvas'
    | 'inspector'
    | 'timeline'
    | 'assets'
    | 'import'
    | 'system'
  command: string
  sceneId?: string
  elementId?: string
  timelineStepId?: string
}
```

`label` 使用中文，例如：

- 新增场景“声调练习”
- 修改文本
- 删除互动题
- 移动片段“播放音频”
- 调整片段时长
- 绑定素材“tone-2.mp3”
- 导入场景 JSON

metadata 必须保持 JSON 可序列化，不保存组件实例、函数、Map、Set、Date 或 DOM 对象。

### 6.3 编辑命令层

所有文档修改统一经过命令，不允许组件继续直接调用散落的 `setProject`：

```text
studio-commands/
  course-commands.ts
  scene-commands.ts
  element-commands.ts
  timeline-commands.ts
  asset-commands.ts
  knowledge-commands.ts
```

首批命令：

- `renameCourse`
- `addSceneFromTemplate`
- `duplicateScene`
- `deleteScene`
- `renameScene`
- `addElement`
- `updateElement`
- `duplicateElement`
- `deleteElement`
- `reorderElement`
- `addTimelineCue`
- `moveTimelineCue`
- `resizeTimelineCue`
- `updateTimelineAction`
- `deleteTimelineCue`
- `bindAsset`
- `bindKnowledgeRef`
- `importScene`

每条命令负责：

1. 找到稳定 ID 对应对象。
2. 在 Travels draft 中完成修改。
3. 保证关联引用同步更新。
4. 通过 Zod 校验可提交状态。
5. 生成一条明确 metadata。

### 6.4 历史边界

| 用户操作 | Travels 策略 | 历史结果 |
|---|---|---|
| 文本连续输入 | 本地 draft；防抖或 blur 后 `setState + archive` | 一次输入会话一条 |
| 中文输入法 composition | composition 期间不 archive；结束后提交 | 不拆分拼音组合过程 |
| Select、Switch | `setState` 后立即 `archive` | 一次选择一条 |
| 新增、复制、删除场景 | `transaction` | 所有关联更新一条 |
| 新增、删除组件 | `transaction` | 元素与引用更新一条 |
| 时间轴拖动 | drag 期间仅 UI preview；drag end 提交 | 一次拖动一条 |
| 时间轴缩放片段 | resize preview；resize end 提交 | 一次缩放一条 |
| 数值输入时间 | 本地 draft；blur/Enter 提交 | 一次编辑一条 |
| 批量调整 | `transaction` | 整批一条 |
| JSON 导入 | 校验后 `transaction` | 一次导入一条 |
| 音频 metadata 回填 | 独立 system 命令，仍可撤销 | 一次回填一条 |
| 自动保存 | 只序列化，不调用 `setState` | 不产生历史 |
| 播放、暂停、播放头、缩放 | UI/runtime state | 不产生历史 |
| 切换场景和模式 | UI state + URL | 不产生历史 |

拖动取消时只丢弃 UI preview，不触碰 Travels。不要在每个 pointer move 中写课程文档。

### 6.5 Undo/Redo 行为

- 顶部栏使用图标按钮，分别调用 `back()` 和 `forward()`。
- `canBack()` / `canForward()` 控制 disabled 状态。
- 支持 `Meta/Ctrl + Z` 撤销。
- 支持 `Shift + Meta/Ctrl + Z` 和 `Ctrl + Y` 重做。
- IME composition、打开的 Select/Dialog 和正在拖动时不响应全局历史快捷键。
- 如果存在尚未 archive 的表单编辑，先提交当前编辑，再执行撤销。
- 撤销删除后恢复对象；如果当前选择已不存在，自动选择同场景最近对象。
- 撤销后执行新编辑会丢弃 redo 分支；通过 `onBranchDiscard` 记录调试信息，不弹阻断提示。
- 不在产品 UI 暴露 `reset()` 和 `go(position)`；它们只用于测试或开发工具。

### 6.6 历史持久化

目标存储键：

```text
hskwise.course-studio.document.v2:<projectId>
```

保存：

- 订阅 Travels 变化，500ms 防抖。
- 使用 `travels.serialize({ strict: true })`。
- 保存当前 state、patches、inversePatches、position 和 metadata。
- 写入失败时保持编辑状态，并在顶部保存状态显示可恢复错误。

恢复：

- 使用 `Travels.deserialize(..., { validation: 'semantic' })`。
- 提供已知安全的当前 sample project 作为 fallback。
- 将旧 `hskwise.course-studio.project.v1` 项目草稿迁移为 v2 baseline，旧草稿没有历史但不能丢失。
- 恢复后再次执行 `CourseStudioProjectSchema` 校验。
- 项目切换或加载服务端新版本使用 `replaceStateWithoutHistory` 或重建 Travels 实例，不能把另一项目记录成 Undo 步骤。

学习进度继续使用独立 storage key，不进入文档历史快照。

## 7. Phase U 分阶段实施

### U0：冻结与可用性基线

预计：1-2 个工程日。

任务：

- [x] U0-01 在 07 开发计划中冻结 Phase 5。
- [x] U0-02 确认三条黄金任务及样例课程。
- [ ] U0-03 记录当前桌面首屏、时间轴和移动端截图。
- [ ] U0-04 为黄金任务记录当前完成时间、失败点和阻断问题。
- [ ] U0-05 建立 Phase U 测试目录与浏览器回归入口。
- [x] U0-06 标记现有硬编码英文、技术入口和直接状态更新位置。

交付：

- 本文档作为 Phase U 唯一实施清单。
- 可重复运行的三条人工验收脚本。
- 当前问题基线和截图。

退出标准：

- 团队对“Phase 3/4 技术能力保留、产品验收未通过”达成一致。
- Phase 5 没有继续新增范围。

### U1：中文壳层、工作模式与历史基础

预计：3-5 个工程日。

任务：

- [ ] U1-01 新增 `studio-messages.ts` 和 `StudioUiLocale`。
- [x] U1-02 将 Studio 壳层、课程结构、模板入口翻译为简体中文。
- [x] U1-03 分离 UI 语言与内容语言。
- [ ] U1-04 重做顶部栏，收纳导入、导出和开发工具。
- [x] U1-05 新增课程结构、内容编辑、动画时间轴、预览检查模式。
- [ ] U1-06 将 mode、scene 和主要 selection 同步到 URL。
- [x] U1-07 建立 `CourseStudioProvider` 和 Travels 文档状态。
- [ ] U1-08 将 Shell 的 Scene CRUD 迁移到命令层。
- [x] U1-09 实现撤销、重做按钮和键盘操作。
- [x] U1-10 实现 v1 草稿到 Travels v2 snapshot 的迁移。

退出标准：

- 首屏只有一个明确主任务。
- 默认 UI 为中文，英文课程内容不受影响。
- 新增、复制、删除、重命名场景均可撤销和重做。
- 刷新后草稿和历史可恢复。
- 直接 `setProject` 只允许存在于迁移适配层，业务组件不得调用。

### U2：内容画布可用性重构

预计：5-8 个工程日。

任务：

- [ ] U2-01 将播放器外壳与画布渲染拆分。
- [ ] U2-02 新增 `SceneCanvasEditor` 选择覆盖层。
- [ ] U2-03 点击画布组件同步右侧属性。
- [ ] U2-04 新增组件库和画布插入入口。
- [ ] U2-05 支持组件新增、复制、删除和顺序调整。
- [ ] U2-06 将场景属性和组件属性改为上下文面板。
- [ ] U2-07 将素材绑定和知识点绑定放入对应组件属性。
- [ ] U2-08 完成 text、callout、dialogue、vocabulary、quiz、media 的核心编辑路径。
- [ ] U2-09 为无场景、无组件、素材缺失提供任务型空状态。
- [ ] U2-10 所有内容修改接入 Travels 命令和历史边界。

退出标准：

- 不打开 JSON 即可制作图文、对话和选择题场景。
- 画布、课程结构和属性面板的选择状态一致。
- 重复类型组件可以通过名称和位置区分，不再只显示 `text`、`quiz` 等 kind。
- 删除被时间轴引用的组件时提供影响说明和确认。
- 黄金任务 1、2 全部通过。

### U3：时间轴专项重做

预计：7-10 个工程日。

#### U3.0 库决策门

先用最多 2 个工程日验证当前 `dnd-timeline`，不预设保留或替换。

必须验证：

- 50 个片段性能。
- 多轨道拖动和左右缩放。
- 水平滚动、缩放、适配全部内容。
- 播放头连续拖动。
- 吸附与最小时长。
- 拖动结束后生成单个 Travels 历史步骤。
- React 19、Next 16 动态加载和尺寸变化稳定性。

任一核心能力需要大规模绕过库内部模型时，停止继续包装并更换实现。库选型结果写入本文档的决策记录。

#### U3.1 产品实现

- [ ] U3-01 时间轴改为独立工作模式。
- [ ] U3-02 建立组件轨、音频轨、互动/控制轨。
- [ ] U3-03 轨道对象与画布对象双向选中。
- [ ] U3-04 新增片段使用动作菜单，不再默认创建未知 `show` action。
- [ ] U3-05 片段显示中文名称、图标、开始时间和有效时长。
- [ ] U3-06 支持拖动、左右缩放、吸附和跨轨移动。
- [ ] U3-07 支持键盘微调和右侧数值精确编辑。
- [ ] U3-08 选中片段属性移入右侧 Cue Inspector。
- [ ] U3-09 实现空、加载、错误和无可用目标状态。
- [ ] U3-10 接入 Travels，一次拖动或缩放只产生一条历史。
- [ ] U3-11 Undo/Redo 后恢复轨道、画布和播放头的一致状态。
- [ ] U3-12 补 0、1、5、20、50 片段测试场景。

退出标准：

- 黄金任务 3 全部通过。
- 1280x720 下时间轴仍有足够操作高度。
- 片段不依赖 hover 才能理解或操作。
- 拖动和缩放都有键盘、数值输入替代。
- 20 次连续拖动后逐步撤销可回到初始状态，再重做可恢复最终状态。
- 时间轴加载期间不出现无解释空白。

### U4：预览检查、质量门与收口

预计：3-5 个工程日。

任务：

- [ ] U4-01 建立干净的学员预览模式。
- [ ] U4-02 将检查结果做成可定位问题列表。
- [ ] U4-03 将 JSON、Runtime Events、Progress、Review 移入开发工具。
- [ ] U4-04 完成中文错误、保存和恢复状态。
- [ ] U4-05 完成键盘焦点、触控目标和减少动画检查。
- [ ] U4-06 完成 1280、1440 和窄屏视觉回归。
- [ ] U4-07 完成黄金任务端到端测试。
- [ ] U4-08 让至少 3 名未参与开发的测试者独立完成黄金任务。
- [ ] U4-09 更新 07 开发计划的实际完成状态。

退出标准：

- 三条黄金任务成功率 100%。
- 没有数据丢失、不可恢复编辑或控制台错误。
- 界面除课程内容、品牌和开发工具外无未翻译英文。
- 主页面无横向滚动；时间轴只在自身容器内滚动。
- Undo/Redo、自动保存和刷新恢复组合测试通过。
- 测试者不需要解释 Scene JSON、Action 或 target locator。

## 8. 测试策略

### 8.1 单元测试

- 每条 Studio command 的正向、撤销、重做。
- 删除场景、组件和片段时的引用维护。
- 中文输入历史合并。
- Undo 后新编辑丢弃 redo 分支。
- `maxHistory` 边界。
- v1 项目草稿迁移到 Travels v2 snapshot。
- 损坏 history 使用 fallback 恢复。
- Zod 校验失败不 archive。

### 8.2 集成测试

- `useSyncExternalStore` 订阅后 UI 与 Travels state 一致。
- 模式和 URL 双向同步。
- 画布选择与 Inspector 同步。
- 时间轴选择与 Cue Inspector 同步。
- 自动保存不产生历史记录。
- 学习进度更新不影响文档历史。

### 8.3 浏览器端到端测试

黄金任务 1：

1. 打开课程。
2. 新增场景。
3. 重命名。
4. 撤销、重做。
5. 刷新并确认恢复。

黄金任务 2：

1. 添加文本和选择题。
2. 从画布选择并编辑。
3. 绑定素材或知识点。
4. 删除组件并撤销。
5. 学员预览。

黄金任务 3：

1. 添加出现片段。
2. 添加音频片段。
3. 添加互动暂停。
4. 拖动和缩放片段。
5. 播放验证。
6. 连续撤销、重做。

### 8.4 视觉与无障碍矩阵

| 视口 | 内容模式 | 时间轴模式 | 预览模式 |
|---|---|---|---|
| 1440x900 | 必测 | 必测 | 必测 |
| 1280x720 | 必测 | 必测 | 必测 |
| 1024x768 | 必测 | 降级可用 | 必测 |
| 390x844 | 轻量编辑 | 不承诺完整编辑 | 必测 |

还需验证：

- Tab 顺序和可见焦点。
- 图标按钮 `aria-label`。
- 拖动操作的键盘替代。
- 中文长标题和英文长单词。
- 空课程、空场景、空时间轴。
- 素材缺失、Schema 错误、存储失败。
- `prefers-reduced-motion`。

## 9. 推荐代码结构

```text
src/features/course-studio/
  app/
    course-studio-app.tsx
    course-studio-provider.tsx
    studio-router-state.ts
  i18n/
    studio-messages.ts
    studio-terminology.ts
  history/
    course-studio-travels.ts
    course-studio-history-storage.ts
    use-course-studio-document.ts
    history-shortcuts.ts
  commands/
    course-commands.ts
    scene-commands.ts
    element-commands.ts
    timeline-commands.ts
    asset-commands.ts
    knowledge-commands.ts
  outline/
    course-outline.tsx
    outline-row.tsx
  canvas/
    scene-canvas-editor.tsx
    canvas-selection-layer.tsx
    component-library.tsx
  timeline/
    timeline-workspace.tsx
    timeline-editor.tsx
    timeline-track.tsx
    timeline-cue.tsx
    cue-inspector.tsx
    timeline-view-state.ts
  preview/
    preview-workspace.tsx
    validation-drawer.tsx
  devtools/
    studio-devtools.tsx
```

该结构是职责目标，不要求一次性移动所有文件。每个阶段只迁移正在重构的功能，避免无行为收益的大规模改名。

## 10. 风险与处理

| 风险 | 处理方式 |
|---|---|
| 命令层迁移期间出现双状态源 | Travels 成为唯一可写文档源；React state 只读订阅 |
| 每个字符形成历史 | `autoArchive: false`，本地 draft + 明确 archive 边界 |
| 中文输入被拆成多步 | composition 期间禁止 archive |
| 历史包含 Map、Set、Blob URL | 只记录 Zod 文档；运行时对象保留在独立 store |
| 导入大 JSON 产生巨大 patch | 单事务记录并测量 snapshot 大小；必要时为导入建立 checkpoint |
| Undo 后 selection 指向已删除对象 | 导航后执行 selection reconciliation |
| 音频 metadata 异步修改破坏历史 | 通过 system command 提交，不直接 set state |
| 时间轴库限制产品交互 | U3.0 设置明确淘汰门，不继续无限包装 |
| 中文化与课程语言耦合 | `uiLocale` 和 `contentLocale` 独立建模 |
| 旧草稿无法恢复 | v1 -> v2 migration + semantic validation + fallback |

## 11. Phase 5 解冻条件

> 本节为旧方案的历史质量门，不再作为当前模板开发的前置条件。新的模板提取条件见 10 号文档 CF3-CF4。

以下条件必须全部满足：

- [ ] U0-U4 所有退出标准完成。
- [ ] 三条黄金任务有稳定端到端测试。
- [ ] 3 名独立测试者无需指导完成任务。
- [ ] 默认简体中文界面完整。
- [ ] 内容画布可以直接选择和编辑。
- [ ] 时间轴通过 50 片段和连续 Undo/Redo 测试。
- [ ] Travels 历史与本地草稿可以安全恢复。
- [ ] 开发工具默认隐藏。
- [ ] 07 开发计划按实际状态更新。

满足后，Phase 5 应优先复用已经稳定的命令层、画布插入能力和历史事务，而不是重新从模板代码直接修改项目对象。

## 12. 决策记录

| 日期 | 决策 | 原因 |
|---|---|---|
| 2026-08-18 | 冻结 Phase 5，新增 Phase U | 当前编辑器信息架构、内容编辑和时间轴未达到可用状态 |
| 2026-08-18 | UI 默认简体中文，内容语言独立 | 便于当前开发调试，同时避免污染多语言课程内容 |
| 2026-08-18 | Undo/Redo 使用 `travels@2.2.0` | 已安装，支持 patch 历史、事务、metadata 和持久化 |
| 2026-08-18 | 使用 `createTravels` immutable + manual archive | 当前文档是 JSON 结构，且需要合并输入和拖动历史 |
| 2026-08-18 | 时间轴库在 U3.0 重新验收 | 已使用开源库不等于产品交互可用 |
| 2026-08-18 | 暂停 U2-U4，转向代码优先课程开发 | 通用编辑器投入过高，先用真实课程验证模板边界 |
