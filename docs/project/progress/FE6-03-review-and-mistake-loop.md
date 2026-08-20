# FE6-03 复习页、错题页与状态闭环开发进度

| 项目 | 结果 |
|---|---|
| 所属阶段 | FE6 生词课程、检查点与复习闭环 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-20 |
| 上一归档 | [FE6-02 混合检查点与错误关联升级](FE6-02-mixed-checkpoint-and-error-linkage.md) |
| 下一项 | FE7 整体验收、性能和回归 |

## 1. 本次结论

Frontend Learning Alpha 已具备首个完整错误回流闭环：课程错误按稳定 ID 进入错题和次日复习队列；到期后，学习者在 `/review` 先主动回忆、再揭示纠正内容，并选择“Review again”或“I recalled it”；前者保留队列并延后 10 分钟，后者完成复习并精确解决关联错题。`/mistakes` 同时提供按状态和来源课程筛选的纠错记录。

## 2. 状态与调度

- 新增纯 `review-schedule` 模型，集中定义 10 分钟重试间隔和 review / mistake 精确匹配规则。
- 新增 `submitLearningReviewAtom` 语义 action，页面不直接修改全局 atom 或 Immer draft。
- 选择“Review again”只表示当前记忆仍需巩固，不作为答错反馈；队列项保持 `queued`、`attemptCount + 1`、`dueAt + 10 分钟`。
- 选择“I recalled it”后，队列项变为 `completed`、尝试次数增加、对应错题变为 `resolved`，并写入 `review-completed` 最近活动。
- selector 将到期复习与其原始 prompt / correction 精确关联；遗留记录无法匹配时提供返回来源课程的安全说明。
- 已完成的复习项不能重复提交，多个知识点错误之间不会相互解决。

## 3. 页面与交互

### `/review`

- 使用“回忆 -> 揭示 -> 自评 -> 反馈 -> 继续”的单题流程。
- 显示本轮进度、来源课程、当前尝试次数和剩余到期数量。
- “需要再看”使用中性复习反馈，“已经掌握”使用完成反馈，语义不混同错误状态。
- 空队列使用统一 Empty 组件，并提供返回路线和查看错题两个明确出口。

### `/mistakes`

- 采用纵向纠错记录而非卡片墙，prompt、correction、状态、来源和日期保持可扫描。
- 支持 Open / Resolved / All 状态筛选。
- 多来源时支持按课程筛选；无结果时显示稳定空状态。
- 顶部统计未解决、已解决和总数，并提供进入到期复习的主操作。

### 路线入口

- 桌面和移动主导航新增 Review、Mistakes。
- `/learn` 的 Continue、今日复习和错题统计均链接到正式页面。
- 路线上的 review 节点直接进入 `/review`，不再使用无实际行为的 lesson query 参数。
- `src/app` 只新增纯 page 路由定义；页面组件和页面 hook 分别收敛在 `src/views/review` 与 `src/views/mistakes`。

## 4. 素材与版权

- 本阶段没有引入教材 OCR 内容、图片、音频或外部素材。
- 复习 prompt 与 correction 来自项目现有原创课程及其本地错误记录。
- 课程中既有 TTS 音频仍属于发布前必须替换的占位素材，本阶段未改变其登记状态。

## 5. 验证

| 检查 | 结果 |
|---|---|
| `bun run lint` | 通过，无 warning |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 58 pass、0 fail、216 assertions |
| `bun run build` | Next.js 16.3.0 生产构建通过；`/review`、`/mistakes` 均静态生成 |
| 复习闭环单元测试 | 到期关联、答对解决、再看排期、防重复提交均通过 |
| 桌面浏览器 `/review` | 空状态、导航和出口正常，控制台无 error / warning |
| 桌面浏览器 `/mistakes` | 7 条现有错题正常渲染；状态筛选和来源筛选交互通过 |
| 移动端截图 | 本次浏览器的临时视口覆盖未生效，未计为通过；纳入 FE7 三视口回归 |

## 6. 已知限制与下一步

- 10 分钟固定重试仅是 Alpha 可解释规则，不是正式 SRS；未来后端模型仍需 interval、difficulty 和历史结果。
- 页面保持打开超过到期时间时不会自行轮询刷新队列；重新进入页面或刷新后会按当前时间恢复。
- 复习使用诚实自评，不尝试虚构发音或记忆评分。
- FE7 需要在 `390x844`、`768x1024`、`1440x900` 完成全路径截图、键盘、无障碍、性能和刷新持久化回归，并补齐正式端到端测试。
