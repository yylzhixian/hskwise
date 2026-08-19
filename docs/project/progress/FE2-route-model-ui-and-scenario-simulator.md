# FE2 路线模型、路线 UI 与情景模拟器开发进度

| 项目 | 结果 |
|---|---|
| 阶段 | FE2 |
| 状态 | 已完成 |
| 开始日期 | 2026-08-19 |
| 完成日期 | 2026-08-19 |
| 对应计划 | [前端学习体验分阶段开发计划](../12-frontend-learning-experience-development-plan.md) |
| 上一阶段 | [FE1 设计系统与应用骨架](FE1-design-system-and-application-shell.md) |
| 下一阶段 | FE3 共享课程运行时与学习原语 |

## 1. 本阶段结论

HSKWise 已从学习壳进入可运行的路线体验。`/learn` 不再是空状态：新用户、返回用户、待复习用户和已完成用户会根据同一套纯状态推导看到不同的 Continue、路线节点和复习摘要，刷新后可以恢复正常学习进度。

本阶段完成：

- 建立 route、stage、node 的 Zod 数据协议和稳定 ID。
- 写入原创四节点 `hsk3-level-1-starter` Starter 路线。
- 建立 Jotai + Jotai Immer 学习 Store、领域 atoms 和窄粒度 selector atoms。
- 用领域 hooks 聚合 hydration、progress、actions、mistakes、review 和 scenario 逻辑。
- 建立版本化 localStorage、内存降级、损坏数据处理和八种隔离 fixture。
- 交付真实 `/learn` 学习首页和 `/learn/routes/hsk3-level-1-starter` 路线详情。
- 完成移动、平板、桌面三档视觉与交互验收。

本阶段没有接数据库、后端 API、Google 服务端登录，也没有提前实现课程步骤运行时。

## 2. 实际变更

### 2.1 路线协议与原创内容

- `route-schema` 将路线拆为 route、stage 和 node，课程类型限定为 `pinyin`、`dialogue`、`vocabulary`、`checkpoint`。
- 节点类型限定为 lesson、practice、review、checkpoint 和 challenge，为后续路线扩展保留语义边界。
- Starter 路线按固定顺序包含 `four-tones`、`first-greeting`、`first-words` 和 `starter-checkpoint` 四个 lesson ID。
- 路线标题、说明、节点文案和稳定知识 ID 均为本项目原创数据，不依赖教材 OCR 内容。

### 2.2 状态模型与 Jotai 边界

- `LearningStateSchema` 统一管理目标、路线进度、错题、复习队列和最近活动，并使用 `version: 1` 作为持久化协议版本。
- 学习 Store 通过 factory 创建；Provider 在学习布局生命周期内只创建一次，不暴露模块级全局单例。
- writable atoms 只存在于状态模块；页面组件通过 `useLearningProgress`、`useLearningActions`、`useMistakeBook` 和 `useReviewQueue` 读取或触发领域动作。
- Continue、节点状态、进度百分比和到期复习均由纯函数推导，不在多个组件内重复拼装。
- 当前、完成、锁定、复习和检查点同时使用图标、文字、边框或形状表达，不只依赖颜色。

### 2.3 存储与情景模拟

- 正常模式使用键名 `hskwise.learning:v1` 的版本化 localStorage；解析失败、旧版本或结构损坏时回到安全初始状态。
- 浏览器存储不可用时自动切换到内存 adapter，页面显示 session-only 提示且不阻断学习。
- fixture store 每次由 factory 创建并复制状态，切换情景不会复用或污染前一个 Store。
- 开发环境提供情景选择和进度重置；生产构建不渲染该工具。

八种 fixture：

| ID | 用途 |
|---|---|
| `new-learner` | 未开始路线 |
| `active-learner` | 已完成首课并继续下一课 |
| `review-due` | 有两项到期复习 |
| `mixed-mistakes` | 同时存在错误与复习状态 |
| `course-complete` | 四节点全部完成 |
| `audio-unavailable` | 后续课程音频不可用能力状态 |
| `microphone-denied` | 后续跟读课程麦克风拒绝状态 |
| `storage-unavailable` | localStorage 不可用并降级到内存 |

### 2.4 页面与视觉

- `/learn` 提供单一高优先级 Continue 区、中央声调曲线路线、复习队列、今日摘要和最近进度。
- 路线图在移动端保持纵向沉浸路径，在桌面端保留更多横向呼吸空间；节点尺寸和连接线不随动态文案跳动。
- `/learn/routes/hsk3-level-1-starter` 复用同一路线图并补充四步详情，没有加载具体课程 bundle。
- 开发情景工具位于文档流底部，移动端不会覆盖路线节点或底部导航。
- 学习首页只保留一个 `main` landmark，标题层级和键盘可达控件通过浏览器检查。

## 3. 代码边界

```text
src/app/(learning)/layout.tsx
  -> LearningStoreProvider
    -> hydration + persistence hooks
    -> /learn | /learn/routes/[routeId]
      -> learning domain hooks
        -> selector/action atoms
          -> pure route and state functions

learning-storage adapter
  -> localStorage in normal mode
  -> memory storage when unavailable

fixture query
  -> fixture factory
    -> isolated learningStore
```

关键约束结果：

- React 组件不直接读取 localStorage。
- 页面组件不直接导入 writable atoms。
- fixture 数据通过正式 Zod schema 校验，不维护第二套松散类型。
- 路线数据与视图分离；后续新增路线不需要复制页面运行逻辑。

## 4. 行为验收

| 情景 | Continue 结果 | 路线结果 |
|---|---|---|
| 新用户 | 开始 `four-tones` | 首节点当前，其余锁定 |
| 返回用户 | 继续 `first-greeting` | 首节点完成，第二节点当前 |
| 待复习 | 优先打开 2 项复习 | 前两节点标记 Review，第三节点当前 |
| 已完成 | 显示路线完成 | 100%，四节点完成 |
| 存储不可用 | 仍可开始学习 | 显示 session-only 降级提示 |

补充验证：

- 正常模式从首页目标进入学习，刷新后 Continue 和进度保持。
- 从待复习情景切换到已完成情景后 URL 清除旧 hash，新 Store 显示 100%。
- 路线详情返回链接保留当前 fixture，便于重复复现同一情景。
- 未知 route ID 使用 Next.js not-found 边界。

## 5. 视觉与浏览器验证

| 页面/情景 | 视口 | 横向溢出 | 遮挡 | 结果 |
|---|---:|---|---|---|
| `/learn?fixture=active-learner` | `390x844` | 无 | 无 | 通过 |
| `/learn?fixture=review-due` | `768x1024` | 无 | 无 | 通过 |
| `/learn?fixture=active-learner` | `1440x1000` | 无 | 无 | 通过 |
| `/learn/routes/hsk3-level-1-starter?fixture=active-learner` | 桌面 | 无 | 无 | 通过 |
| `/learn?fixture=storage-unavailable` | 桌面 | 无 | 无 | 通过 |

浏览器检查还确认：

- 当前、完成、锁定、复习和检查点在路线图上可同时辨认。
- 移动端开发工具和底部导航没有覆盖学习内容。
- 关键页面没有浏览器 console error 或 warning。
- 平板页面 `clientWidth` 与 `scrollWidth` 均为 `753px`（其余宽度为浏览器滚动条），不存在横向滚动。

## 6. 质量验证

| 命令 | 结果 |
|---|---|
| `bun run lint` | 通过 |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 26 pass、0 fail、69 assertions |
| `bun run build` | 通过；`/learn` 静态生成，Starter 路线详情 SSG |

新增测试覆盖：

- 稳定路线 ID、节点顺序、锁定、继续、复习优先和完成推导。
- 版本化存储 round trip、损坏/旧版本降级和不可用存储。
- 八种 fixture 的 schema 有效性、Store 隔离和存储降级。

## 7. 版权与素材状态

- 本阶段没有读取或复制 `docs/textbooks` 中的教材正文、图片、音频或 OCR 片段。
- Starter 路线文案、节点名称、声调路径和界面内容均为原创实现。
- 本阶段没有引入第三方图片、音频或其他发布素材，因此没有新增待替换素材。
- `audio-unavailable` 与 `microphone-denied` 只是能力状态 fixture，不包含受版权限制的媒体。
- FE4-FE5 若暂用图片或音频占位，仍必须同时标记 `placeholder` 和 `mustReplaceBeforePublish`，并在发布前替换为原创或已授权素材。

## 8. 已知限制

- `/lessons/[lessonId]` 仍是 FE1 的 unavailable 壳；步骤推进、作答、反馈和完成动作属于 FE3。
- 复习队列当前用于状态推导和路线入口展示，完整复习交互在 FE6 闭环。
- audio 和 microphone 能力 fixture 已进入学习状态，但由 FE3 的媒体 adapter 消费。
- localStorage 只服务当前纯前端 Alpha；后续通过 storage adapter 边界替换为 API。
- 当前只提供一条四节点 Starter 路线，尚未扩展等级、考试日期或诊断推荐。

## 9. FE3 进入条件与第一批任务

FE3 可直接开始，首批任务按以下顺序执行：

1. 定义纯 `lesson-session-machine`、步骤状态和一次性完成语义。
2. 建立按 `lessonId` 隔离的 Jotai Immer `lessonStore` 和领域 hooks。
3. 实现无课程类型分支的 Lesson Frame、顶部进度、步骤区、反馈区和稳定操作栏。
4. 提取选择题、音频、录音、排序和反馈共享原语。
5. 建立媒体真实/fixture adapter，并消费 FE2 的 unavailable/denied 能力状态。
6. 建立 lesson completion 到 progress、mistake、review 的事件桥接与测试。

FE3 继续遵守：不接数据库、不调用后端 API、不实现具体拼音/对话/生词课程，不扩大 Course Studio。

## 10. 完成后视觉校准

2026-08-19 根据路线页实机反馈完成第二轮视觉校准：

- `LearningRuntimeAlert` 改为蜂蜜黄实底、2px 边框和底部触感阴影，标题明确说明进度不会保存。
- 四个路线节点改为按圆心对应 SVG 路径坐标，修正第 2、4 节点受标签容器高度影响而偏离路线的问题。
- completed 节点使用浅薄荷底、绿色边框和深绿图标，与深绿 progress 路线形成前后层次。
- review 节点使用蜂蜜黄实底、琥珀边框和深棕图标，不再使用透明黄色叠色。
- current 继续使用 Focus 蓝，locked 使用冷灰，checkpoint 通过 Reward 金色 ring 或边框提供非颜色提示。
- `390x844` 与 `1440x1000` 复验无节点碰撞、横向溢出或底部导航遮挡。

新增路线状态色：

| Token | 色值 | 用途 |
|---|---|---|
| Route complete surface | `#DFF6EA` | 完成节点浅薄荷底 |
| Route complete border | `#55B983` | 完成节点边框与触感阴影 |
| Route complete foreground | `#176B49` | 完成节点图标与文字 |
| Route review surface | `#FFF1BF` | 复习节点和运行警示底色 |
| Route review border | `#D99B17` | 复习节点和运行警示边框 |
| Route review foreground | `#754B00` | 复习节点和运行警示文字 |
