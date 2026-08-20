# FE4-02 首门拼音课程开发进度

| 项目 | 结果 |
|---|---|
| 所属阶段 | FE4 拼音与声调课程 |
| 子阶段 | FE4-02 首门可运行拼音课程 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-20 |
| 上一子阶段 | [FE4-01 语音导视视觉基础](FE4-01-phonetic-wayfinding-visual-foundation.md) |
| 下一子阶段 | FE4-03 原创发音素材、跟读与错误回流 |

## 1. 本次结论

`/lessons/four-tones` 已从 unavailable 占位变为第一门可完整完成的正式路线课程。学习者可以观察四声轨迹、播放四条合成音高导览、完成两道轨迹辨认题、查看即时反馈并结束课程；完成结果会写入外层学习 Store，使 Starter 路线从 0% 推进到 25% 并解锁 `first-greeting`。

本子阶段完成课程协议、原创内容、专用组件、共享运行时接入和路线完成闭环。真人普通话示范音频、跟读录音和错误进入复习队列留到 FE4-03。

## 2. 课程协议与复用边界

- 新增独立 `pinyinLesson/v1` Zod 协议，定义四声事实、声调轨迹、总览、音高导览、轨迹选择和总结步骤。
- 拼音课程数据不包含 React、CSS class、图标名或事件处理函数。
- `createPinyinRuntimeDefinition` 将语义步骤投影到共享 `LessonDefinition`，互动 ID 和媒体 ID 从稳定 step ID 派生。
- 协议拒绝重复声调、重复步骤、重复选项和不在选项中的正确答案。
- 新增未发布的 `tone-shape-review-fixture`，无需修改组件即可通过同一协议和运行时投影。
- 课程注册表目前只发布 `four-tones`；其他三个路线课程继续保持 unavailable 状态。

## 3. 原创课程与组件

正式课程包含五步：

1. 比较 `mā / má / mǎ / mà` 的四条音高轨迹。
2. 播放四条浏览器合成的纯音轨迹，建立音高方向感。
3. 从三个轨迹中识别第二声的上升路径。
4. 对比第三声转折与第四声直接下降。
5. 总结四条轨迹并完成课程。

专用组件包括：

- `ToneContour`：将 1-5 级音高数据转换为稳定 SVG 路径。
- `ToneOverview`：无卡片堆叠的四声轨迹总览。
- `TonePitchGuide`：Web Audio 合成音高导览和不可用降级。
- `ToneChoiceInteraction`：复用 ToggleGroup 与共享选择 hook 的轨迹题。
- `PinyinLessonSummary`：简洁的学习结果总结。

合成音只表达音高移动方向，界面明确说明它不是真人普通话发音示范，避免形成错误的内容承诺。

## 4. Store 边界修正

正式路线接入暴露出 FE3 实现与设计文档之间的偏差：`LessonStoreProvider` 原先嵌套 Jotai Provider，会遮蔽外层 learning store。现已改为轻量 Context 只传递 lesson store 实例，课程 hooks 通过 `{ store }` 读取或写入课程 atoms。

修正后：

- 课程临时状态仍按 lesson 隔离。
- `LessonFrame` 的 `completeNode` 写入外层 learning store。
- 完成课程后 localStorage 保存 25% 路线进度。
- 返回 `/learn` 后首节点为 Complete，第二节点为 Current。

## 5. 行为与视觉验收

| 页面/流程 | 视口 | 结果 |
|---|---:|---|
| 四声课程五步主路径 | `390x844` | 通过 |
| 错误、Try again、正确反馈 | `390x844` | 通过 |
| 四条 Web Audio 音高轨迹 | `390x844` | 播放后解锁 Continue |
| 完成总结 | `390x844` | 进度 100%，无横向溢出 |
| 四声课程首步 | `1440x1000` | header `top: 0`，footer 贴合视口底部 |
| 正常学习状态路线桥接 | 移动端 | 0% -> 25%，下一课解锁 |

浏览器验收还捕获并修复了音高组件在 state updater 内触发课程完成的 React 警告；完成通知现由 effect 在提交渲染后发送。

2026-08-20 完成声调轨迹几何校准：第一声固定在画布垂直中线，第三声以画布中心为轴使用等高端点的对称折线。

2026-08-20 将播放状态改为与 Web Audio 时长同步的 SVG 路径绘制动画；系统启用“减少动态效果”时直接显示完整路径。

## 6. 质量验证

| 命令 | 结果 |
|---|---|
| `bun run lint` | 通过 |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 39 pass、0 fail、112 assertions |
| `bun run build --webpack` | 通过；默认 Turbopack 在当前执行环境受 PostCSS 子进程端口权限限制 |
| `git diff --check` | 通过 |

新增测试覆盖协议投影、第二 fixture、非法课程数据、SVG 路径和音高频率映射。

## 7. 版权与素材状态

- 课程讲解、提示、反馈和题目均为本项目原创。
- `mā / má / mǎ / mà` 仅作为基础语言事实和声调符号示例。
- 没有读取或复制 `docs/textbooks` 的正文、OCR、图片或音频。
- 没有引入第三方图片、真人音频或待发布媒体文件。
- Web Audio 在浏览器内实时合成纯音，不属于普通话发音素材，也不作为发音范例。

## 8. 已知限制与下一步

- 当前课程教学目标限于识别声调轨迹，不宣称训练出标准发音。
- 尚未加入原创真人示范音频、录音回放和跟读步骤。
- 错误保留在当前 lesson session 中，尚未写入 mistake / review 队列。
- 课程中途刷新会重新开始；会话恢复不属于当前纯前端 Alpha 的本子阶段。
- 下一步 FE4-03 应制作原创或明确授权的普通话示范音频，增加跟读与媒体异常路径，并把错误知识点写入复习队列。
