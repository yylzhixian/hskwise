# FE4-R1 前端源码结构收敛进度

| 项目 | 结果 |
|---|---|
| 所属阶段 | FE4 拼音与声调课程期间的工程校准 |
| 子阶段 | FE4-R1 前端源码结构收敛 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-20 |
| 上一归档 | [FE4-02 首门可运行拼音课程](FE4-02-first-pinyin-lesson.md) |
| 下一项 | FE4-03 原创发音素材、跟读与错误回流 |

## 1. 本次结论

移除笼统的 `src/features/` 容器，正式源码按路由、页面、公共能力、课程和学习领域重新组织。根据结构复核，`app/` 进一步收敛为纯路由定义；页面实现、公共 hooks 和全局状态分别进入 `views/`、`hooks/` 和 `store/`。

生产运行链路不再读取 `?fixture=`、显示开发情景切换器或暴露 `runtime-lab`。测试数据集中到 `tests/`，继续覆盖正式纯逻辑，但不再混入生产源码。

## 2. 新目录边界

| 目录 | 职责 |
|---|---|
| `src/app` | 纯 Next.js 路由、布局、边界和 Route Handler |
| `src/views` | 页面实现及页面私有 components、hooks 和辅助逻辑 |
| `src/components` | 跨页面公共 UI、学习外壳和课程框架 |
| `src/hooks` | 跨页面或跨课程复用的公共 hooks |
| `src/store/learning` | 跨页面 Jotai 状态和 localStorage 持久化 |
| `src/courses` | 课程注册表、课程类型协议、内容和组件 |
| `src/learning/routes` | 路线内容、schema 和派生计算 |
| `src/learning/runtime` | 隔离的 lesson store、atoms 和状态机 |
| `src/lib` / `src/types` | 公共工具与跨领域全局类型 |
| `tests/fixtures` | 仅测试使用的第二课程样本 |
| `tests/unit` | 正式纯逻辑测试 |

完整放置规则见 [源码结构索引](/Users/yanglong/Documents/YL/hskwise/src/README.md)。

## 3. 删除与保留

已删除：

- 已暂停且不属于当前产品主线的 `/admin/studio` 和 `src/features/course-studio` 原型。
- `learning-simulator`、开发 scenario switcher、八组 URL fixture 注入。
- `runtime-lab`、媒体 fixture、只服务演示页的控件和 hooks。
- 8 个随旧原型遗留且无引用的 UI 组件。
- `ahooks`、`dnd-timeline`、`motion`、`mutative`、`radash`、`travels` 六个无引用依赖。

继续保留：

- 正式拼音课程及 `pinyinLesson/v1` 协议。
- Jotai / Jotai Immer 学习状态和 lesson store 隔离。
- 路线进度、localStorage 降级、lesson 状态机和课程协议测试。
- 测试专用第二拼音课程 fixture，但仅位于 `tests/fixtures`。

删除内容均受 Git 版本历史保护，可以按需查阅或恢复；它们不再占据当前源码入口。

## 4. 行为变化

- `/learn?fixture=...` 不再覆盖真实本地学习状态。
- 页面链接不再传播 fixture 查询参数。
- `/lessons/runtime-lab` 回到普通的未发布课程占位行为。
- `/admin/studio` 路由已移除。
- 正式 `/`、`/learn`、路线详情和 `/lessons/four-tones` 的产品行为保持不变。

## 5. 验证

| 检查 | 结果 |
|---|---|
| `src/features` 残留引用 | 0 |
| `src/app` 中组件、hooks、页面实现目录 | 0；只保留路由约定文件与 Route Handler |
| fixture / runtime-lab / Course Studio 正式源码引用 | 0 |
| 保留单元测试 | 19 pass、0 fail |
| ESLint | 通过 |
| TypeScript | 通过 |
| `next build` | 通过；构建路由中不再包含 `/admin/studio` |
| 浏览器核心路径 | `/`、`/learn`、路线详情、四声课程通过，控制台 0 error |

浏览器额外验证：旧 `?fixture=course-complete` 不会覆盖真实本地进度，页面没有 scenario 控件；`/lessons/runtime-lab` 显示普通未发布课程占位，`/admin/studio` 返回 404；`390x844` 下路线详情和四声课程无横向溢出。结构校准后再次回归 `/`、`/learn`、路线详情和 `/lessons/four-tones`，均正常渲染且开发服务器返回 200。

## 6. 后续约束

- FE4-03 继续在 `src/courses/pinyin` 内扩展，不建立新的万能 feature 容器。
- `app/` 不新增页面实现、组件或 hooks；路由入口只负责参数、metadata、边界和装配 `views`。
- 页面特有的组件和 hooks 与对应 `views/{page}` 共置；只有形成真实跨页面复用后才上移到公共目录。
- 原创音频和录音能力成熟后，以正式媒体接口进入 `learning/runtime`，不恢复 fixture adapter。
- 需要复现边界状态时，在 `tests/` 直接构造 state/store；浏览器回归使用独立测试脚本设置前置状态。
