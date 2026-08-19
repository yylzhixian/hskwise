# FE4-01 语音导视视觉基础开发进度

| 项目 | 结果 |
|---|---|
| 所属阶段 | FE4 拼音与声调课程 |
| 子阶段 | FE4-01 视觉方向基础 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-19 |
| 上一阶段 | [FE3 共享课程运行时与学习原语](FE3-shared-lesson-runtime-and-learning-primitives.md) |
| 下一子阶段 | FE4-02 拼音课程协议与原创内容 |

## 1. 本次结论

HSKWise 学习端的视觉方向已从通用的 Brilliant / Duolingo 融合样式收敛为“石墨深色语言空间 + 语音导视”。Duolingo 式硬阴影不再承担品牌识别，路线轨迹、声调曲线、细分隔线和状态色成为主要视觉语言。

本次覆盖首页目标入口、学习路线、路线详情和 Lesson Runtime；Course Studio、数据库和后端不在范围内。

## 2. 视觉系统

深色学习主题使用：

| 角色 | 色值 | 用途 |
|---|---|---|
| Graphite background | `#15191F` | 学习空间主背景 |
| Raised surface | `#20252B` | 可操作选项和局部浮层 |
| Soft text | `#E9EEF4` | 正文和主要标题 |
| Muted text | `#AEB7C2` | 说明、状态和次要信息 |
| Phonetic blue | `#6CA9F2` | 当前步骤、导视和焦点 |
| Progress green | `#53C991` | 进度、完成和主动作 |
| Tone coral | `#FF8279` | 发音异常和错误反馈 |
| Review yellow | `#F5C85E` | 复习、提醒和检查点 |

同时保留完整亮色 token，亮色不是对深色的简单反相。学习端首次访问跟随系统外观；用户通过 header 图标切换后，偏好写入 `hskwise.learning-appearance:v1` 并在页面刷新和学习/课程路由间保持。

## 3. 组件调整

- `LearningAppearanceRoot` 将主题限制在学习端，并用 `useSyncExternalStore` 订阅系统主题和本地偏好。
- LearningShell 顶部栏和移动导航改为半透明石墨导视栏，当前导航通过细线与颜色表达，不再使用圆角填充标签。
- LessonChrome 使用同一主题能力，顶部进度、退出和主题切换保持对称布局，header 继续固定在顶部。
- App Brand 增加桌面端 `Mandarin route` 识别语，品牌图标使用 Phonetic Blue。
- 路线连接线由粗游戏化轨道改为细导视轨道；当前、完成、复习和锁定节点取消硬阴影，改用表面、描边、ring 和图标区分。
- Continue 区从独立圆角卡片改为全宽导视带；路线摘要与复习区继续使用无框布局和分隔线。
- learning Button、Toggle 和排序项移除底部硬阴影，保留清晰 hover、pressed、focus 和 selected 状态。
- 课程步骤 eyebrow 增加短导视线并左对齐，形成后续拼音课程可复用的步骤标记。
- 首页四声图从虚线路径改为连续声调轨迹，节点保持可读的空心站点结构。

## 4. 行为与响应式验收

| 页面/情景 | 视口 | 主题 | 结果 |
|---|---:|---|---|
| `/` | `1440x1000` | 深色 | 入口、声调轨迹和选项通过 |
| `/` | `390x844` | 亮色 | 单列选项、顶部和底部导航通过 |
| `/learn?fixture=active-learner` | `1440x1000` | 深色 | 路线、侧栏、完成/当前/锁定状态通过 |
| `/learn?fixture=active-learner` | `390x844` | 深色 | 无横向溢出，路线与底部导航通过 |
| `/lessons/runtime-lab?media=audio-blocked` | `390x844` | 深色 | 单一 main、固定 header、稳定 footer 通过 |

补充验证：

- 路线页滚动 `520px` 后 LearningShell header 仍保持 `top: 0`。
- 移动路线页 `clientWidth` 与 `scrollWidth` 均为 `375px`。
- 移动课程页 `clientWidth` 与 `scrollWidth` 均为 `390px`，footer 底边与 `844px` 视口一致。
- 明暗主题切换后语义色和文字对比保持可读，刷新后仍保留用户选择。
- 主题按钮有明确的 `Switch to light mode` / `Switch to dark mode` 无障碍名称和 Tooltip。
- 修复深色路线页底部约 `16px` 的白色文档背景：`html` / `body` 现在通过学习主题容器同步背景色和 `color-scheme`，可覆盖框架辅助节点、滚动边界和页面回弹区域。

## 5. 质量验证

| 命令 | 结果 |
|---|---|
| `bun run lint` | 通过 |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 34 pass、0 fail、99 assertions |
| `bun run build` | 通过 |
| `git diff --check` | 通过 |

## 6. 版权与素材状态

- 本次只调整原创界面、主题 token、图标和代码内声调路径。
- 没有读取或复制 `docs/textbooks` 的教材正文、图片、音频或 OCR 内容。
- 没有新增外部发布素材或待替换媒体占位。

## 7. 后续约束

- FE4 拼音课程应使用 Phonetic Blue 表达当前观察对象，Tone Coral 只用于需要关注的声学特征或错误，不把整页做成单色蓝主题。
- 继续限制硬阴影，不重新把所有按钮、节点和选项做成多邻国式实体按键。
- 深色背景上的长文本继续使用 Soft Text / Muted Text，不使用纯白和低对比灰。
- 用户一旦明确选择亮色或深色，系统主题变化不覆盖该选择；后续设置页可增加“跟随系统”入口。
- FE4-02 开始定义 `PinyinLessonSchema`、原创四声内容和素材占位清单。
