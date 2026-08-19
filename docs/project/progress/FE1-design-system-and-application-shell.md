# FE1 设计系统与应用骨架开发进度

| 项目 | 结果 |
|---|---|
| 阶段 | FE1 |
| 状态 | 已完成 |
| 开始日期 | 2026-08-19 |
| 完成日期 | 2026-08-19 |
| 对应计划 | [前端学习体验分阶段开发计划](../12-frontend-learning-experience-development-plan.md) |
| 上一阶段 | [FE0 基线冻结与工程准备](FE0-baseline-and-engineering-preparation.md) |
| 下一阶段 | FE2 路线模型、路线 UI 与情景模拟器 |

## 1. 本阶段结论

HSKWise 已拥有第一版可运行的学习者前端骨架。首页不再请求后端状态，也不再要求先登录；用户会直接进入目标选择，并可进入学习页。

本阶段完成：

- 建立学习端语义 token、字体栈、圆角和交互反馈。
- 建立普通学习布局、桌面导航和移动底部导航。
- 建立独立的沉浸课节壳，不显示普通学习导航。
- 将 `/` 改为目标优先入口。
- 交付 `/learn` 空状态和 `/lessons/[lessonId]` unavailable 状态。
- 建立 loading、error、empty 和 unavailable 四类基础状态。
- 在 `390x844`、`768x1024`、`1440x900` 三档视口完成生产构建视觉验收。

数据库、课程 API、登录、Jotai 领域状态、路线模型和真实课程内容均未提前实现。

## 2. 实际变更

### 2.1 设计系统

学习端在 `.learning-theme` 内使用下列语义角色，避免影响冻结中的 Course Studio：

| 角色 | 色值 | 用途 |
|---|---|---|
| Ink | `#18212F` | 主文本和品牌骨架 |
| Paper | `#F7F9FC` | 学习页面背景 |
| Surface | `#FFFFFF` | 页眉、底部导航和明确控件 |
| Progress | `#1C7F58` | 主学习动作和后续完成进度 |
| Focus | `#236FD2` | 当前目标、当前导航和键盘焦点 |
| Reward | `#F2B544` | 预留给检查点与完成奖励 |
| Error | `#B83F4C` | 错误和不可恢复反馈 |

- 学习端圆角基准为 `8px`。
- 英文与中文使用无网络依赖的系统字体栈：Avenir Next、Segoe UI、PingFang SC、Noto Sans SC 和 sans-serif fallback。
- `Button` 新增 `learning` variant 和 size，提供 3px 底部触感阴影及按压位移。
- `Toggle` 新增 `learning` variant 和 size，用于 2-7 项学习目标选择。
- 从当前 Shadcn registry 增加 `Alert`、`Empty`、`Skeleton`，并将状态容器圆角收敛到 8px。

### 2.2 应用壳与导航

- 新增可复用 `LearningShell`，包含 skip link、品牌、桌面导航、内容区和移动底部导航。
- 首页和 `(learning)` route group 复用同一壳层。
- 导航只包含当前真实存在的 `Start` 和 `Learn`，没有加入指向未实现页面的死链接。
- `DesktopNavigation` 与 `MobileNavigation` 是读取 pathname 的小型 Client 叶子；布局本身保持 Server Component。
- 移动端按 65px 页眉和 64px 底部导航计算可用高度，基准视口下没有遮挡或无意义滚动。

### 2.3 首页目标入口

- 删除首页对 Eden API 状态的请求和 Google 登录前置展示。
- 使用 Shadcn `ToggleGroup` 提供三种目标：HSK 3.0 路径、考试准备、查找当前等级。
- `useLearningGoalSelection` 聚合选择与继续链接逻辑；组件不直接维护散落的路由拼接状态。
- 目标选择通过查询参数进入 `/learn`，FE2 再把选择写入 Jotai 学习状态和版本化存储。
- 普通话四声轮廓作为原创、代码原生的视觉签名贯穿入口与学习空状态。

### 2.4 学习页与课节壳

- `/learn` 展示 Level 1 标题、0% 状态、声调路线预示和标准 Empty 组件。
- `/lessons/[lessonId]` 建立退出按钮、标题、进度、单任务内容区和稳定底部动作区。
- 已冻结的四个 lesson ID 映射到稳定标题；未知 ID 使用通用标题，不使页面崩溃。
- 课节内容尚未实现时使用 Alert 展示 unavailable 状态，Continue 保持禁用。
- 学习页与课节页分别提供 Skeleton loading 和可重试 error boundary。

## 3. 路由与组件边界

```text
src/app/page.tsx
  -> LearningShell
    -> GoalEntry (Client)
      -> useLearningGoalSelection

src/app/(learning)/layout.tsx
  -> LearningShell
    -> /learn + loading/error

src/app/(lesson)/lessons/[lessonId]/page.tsx
  -> LessonChrome
    -> unavailable lesson state
```

Server/Client 边界结果：

- 根布局、学习布局、课节布局和路由页面默认保持 Server Component。
- pathname 导航和目标选择是当前仅有的新增 Client 叶子。
- FE1 不引入 Jotai store；跨页面领域状态按计划在 FE2 一次性建立。
- Course Studio 源码未修改，学习主题通过容器作用域隔离。

## 4. 视觉与交互验收

生产构建在 `http://127.0.0.1:3100` 临时运行后完成截图；验收结束后关闭该临时服务器，日常开发服务器继续使用 `http://127.0.0.1:3000`。

| 页面 | 视口 | client | scroll | 横向溢出 |
|---|---:|---:|---:|---|
| `/` | `390x844` | `390x844` | `390x844` | 无 |
| `/` | `768x1024` | `768x1024` | `768x1024` | 无 |
| `/` | `1440x900` | `1440x900` | `1440x900` | 无 |
| `/learn` | `390x844` | `390x844` | `390x844` | 无 |
| `/lessons/four-tones` | `390x844` | `390x844` | `390x844` | 无 |
| `/lessons/four-tones` | `1440x900` | `1440x900` | `1440x900` | 无 |

截图：

| 页面 | Mobile | Tablet | Desktop |
|---|---|---|---|
| 首页 | [390x844](fe1/assets/home-mobile.jpg) | [768x1024](fe1/assets/home-tablet.jpg) | [1440x900](fe1/assets/home-desktop.jpg) |
| 学习空状态 | [390x844](fe1/assets/learn-mobile.jpg) | - | - |
| 课节壳 | [390x844](fe1/assets/lesson-mobile.jpg) | - | [1440x900](fe1/assets/lesson-desktop.jpg) |

交互检查：

- 点击目标会更新单选 pressed 状态和 Continue 链接。
- ToggleGroup 使用 roving tabindex；方向键移动焦点，空格确认目标。
- 键盘焦点使用 Focus 蓝色边框和 3px ring，不只依赖颜色变化。
- 移动端主按钮位于底部导航上方；页面不存在横向滚动。
- 浏览器控制台未发现 error 或 warning。

## 5. 质量验证

| 命令 | 结果 |
|---|---|
| `bun run lint` | 通过 |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 16 pass、0 fail、41 assertions |
| `bun run build` | 通过；`/`、`/learn` 静态生成，`/lessons/[lessonId]` 动态渲染 |

## 6. 版权与素材状态

- 本阶段没有读取或复制 `docs/textbooks` 中的教材正文、图片、音频或 OCR 片段。
- 声调路径、品牌图形、界面文案和布局均为本阶段原创实现。
- FE1 截图是本项目运行结果，不是第三方竞品素材。
- 当前没有引入课程图片或音频占位，因此没有待替换的发布素材。
- FE2 以后若临时使用教材启发的图片、音频或题目，必须在内容数据与素材清单同时标记 `placeholder` 和 `mustReplaceBeforePublish`，且不得进入最终发布资产。

## 7. 已知限制

- `/learn` 仍是计划内空状态；真实路线、当前节点和 Continue 逻辑由 FE2 实现。
- 目标选择仅体现在 URL 查询参数，刷新后不会恢复，也不会改变学习路线数据。
- 课节页只有通用壳和 unavailable 状态；步骤推进、答案、反馈和完成动作属于 FE3。
- error boundary 已通过类型和生产构建验证，本阶段未为截图人为注入运行时异常。
- 字体目前使用本地系统 fallback，尚未打包独立品牌字体文件。
- 暂不提供深色学习主题；`.learning-theme` 明确保持浅色，避免未验收的暗色对比问题。

## 8. FE2 进入条件与第一批任务

FE2 可直接开始，首批任务按以下顺序执行：

1. 建立 route、stage、node 的 Zod schema 和状态推导纯函数。
2. 写入原创的四节点 `hsk3-level-1-starter` 路线数据。
3. 建立根级 Jotai `learningStore`、Jotai Immer 进度聚合和窄 selector atoms。
4. 实现版本化 localStorage、内存降级和八种独立 fixture store factory。
5. 将 `/learn` 空状态替换为 Continue、今日复习摘要和声调曲线路线。
6. 新增 `/learn/routes/hsk3-level-1-starter`，验证完成、当前、锁定、复习和检查点状态。

FE2 继续遵守：不接数据库、不调用课程后端 API、不恢复 Google 登录前置、不扩张 Course Studio。

## 9. 完成后视觉校准

2026-08-19 根据首页实机预览调整学习主题的主动作颜色：

| Token | 调整前 | 调整后 |
|---|---|---|
| Primary | `#1C7F58` | `#36B97A` |
| Primary foreground | `#FFFFFF` | `#10291D` |
| Primary pressed shadow | `#145C42` | `#218456` |

Progress 继续使用 `#1C7F58`，从而让“可点击的主要学习动作”和“已取得的学习进度”保持可辨认的层级。该调整只修改 `.learning-theme` 语义 token，没有改写业务组件或 Course Studio 主题。
