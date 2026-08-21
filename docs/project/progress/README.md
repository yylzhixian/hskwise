# 前端开发阶段进度档案

本目录按阶段保存 HSKWise 前端学习体验和课程生产基础的实际开发记录。规划与实现分离：

- [前端学习体验分阶段开发计划](../12-frontend-learning-experience-development-plan.md)定义目标、顺序和验收标准。
- [规模化课程生产基础开发计划](../13-course-production-foundation-plan.md)定义第二阶段目标、协议与实施顺序。
- 本目录记录每个阶段实际完成了什么、改了什么、如何验证、留下什么问题。

## 归档规则

每个阶段完成后新增一个独立 Markdown 文件，不覆盖以前阶段。文件至少包含：

1. 阶段状态、起止日期和对应计划。
2. 本阶段范围与明确未做事项。
3. 代码、配置、文档和素材变更。
4. 关键架构与产品决策。
5. 测试、构建、浏览器和视觉验证结果。
6. 已知限制、风险和后续替换项。
7. 下一阶段的进入条件与第一批任务。

截图和其他阶段附件放在对应的小写阶段目录，例如 `fe0/assets/`。版权受限的参考素材不得进入发布资产目录；必须使用时应带占位和替换标记。

## 阶段索引

| 阶段 | 状态 | 完成日期 | 归档 |
|---|---|---|---|
| FE0 基线冻结与工程准备 | 已完成 | 2026-08-19 | [FE0 开发进度](FE0-baseline-and-engineering-preparation.md) |
| FE1 设计系统与应用骨架 | 已完成 | 2026-08-19 | [FE1 开发进度](FE1-design-system-and-application-shell.md) |
| FE2 路线模型、路线 UI 与情景模拟器 | 已完成 | 2026-08-19 | [FE2 开发进度](FE2-route-model-ui-and-scenario-simulator.md) |
| FE3 共享课程运行时与学习原语 | 已完成 | 2026-08-19 | [FE3 开发进度](FE3-shared-lesson-runtime-and-learning-primitives.md) |
| FE4 拼音与声调课程 | 已完成 | 2026-08-20 | [FE4-04 拼音课程验收](FE4-04-listening-and-pinyin-course-acceptance.md) |
| FE5 对话精读与跟读课程 | 已完成 | 2026-08-20 | [FE5 开发进度](FE5-dialogue-close-reading-and-role-practice.md) |
| FE6 生词、检查点与复习闭环 | 已完成 | 2026-08-20 | [FE6-03 复习与错题闭环](FE6-03-review-and-mistake-loop.md) |
| FE7 整体验收、性能和回归 | 阶段性收束 | 2026-08-21 | [FE7-01 自动化回归基础](FE7-01-automated-regression-foundation.md)；后续工作由课程生产第二阶段取代 |
| CP0 课程能力与教学方法盘点 | 已完成 | 2026-08-21 | [CP0 开发进度](CP0-course-capability-and-method-inventory.md) |
| CP1 Lesson Schema v2 与编译器 | 已完成 | 2026-08-21 | [CP1 开发进度](CP1-lesson-schema-v2-and-compiler.md) |

## 阶段内校准记录

| 子阶段 | 状态 | 完成日期 | 归档 |
|---|---|---|---|
| FE4-01 语音导视视觉基础 | 已完成 | 2026-08-19 | [FE4-01 开发进度](FE4-01-phonetic-wayfinding-visual-foundation.md) |
| FE4-02 首门可运行拼音课程 | 已完成 | 2026-08-20 | [FE4-02 开发进度](FE4-02-first-pinyin-lesson.md) |
| FE4-R1 前端源码结构收敛 | 已完成 | 2026-08-20 | [FE4-R1 开发进度](FE4-R1-source-structure-simplification.md) |
| FE4-03 发音练习与错误回流 | 已完成 | 2026-08-20 | [FE4-03 开发进度](FE4-03-pronunciation-practice-and-error-flow.md) |
| FE4-04 听辨与拼音课程验收 | 已完成 | 2026-08-20 | [FE4-04 开发进度](FE4-04-listening-and-pinyin-course-acceptance.md) |
| FE4-P1 声调选项视觉校准 | 已完成 | 2026-08-20 | [FE4-P1 校准记录](FE4-P1-tone-option-visual-correction.md) |
| FE5-P1 课程底栏反馈布局校准 | 已完成 | 2026-08-20 | [FE5-P1 校准记录](FE5-P1-lesson-footer-feedback-layout-correction.md) |
| FE5-P2 对话音频完成条件校准 | 已完成 | 2026-08-20 | [FE5-P2 校准记录](FE5-P2-dialogue-audio-completion-rule-correction.md) |
| FE5-P3 课程反馈类型视觉校准 | 已完成 | 2026-08-20 | [FE5-P3 校准记录](FE5-P3-lesson-feedback-type-visual-correction.md) |
| FE5-P4 对话排序拖放交互校准 | 已完成 | 2026-08-20 | [FE5-P4 校准记录](FE5-P4-dialogue-line-order-drag-and-drop-correction.md) |
| FE5-P5 模拟对话自动轮换交互校准 | 已完成 | 2026-08-20 | [FE5-P5 校准记录](FE5-P5-dialogue-role-practice-turn-taking-correction.md) |
| FE5-P6 模拟对话回合节奏校准 | 已完成 | 2026-08-20 | [FE5-P6 校准记录](FE5-P6-dialogue-role-practice-pacing-correction.md) |
| FE5-P7 对话练习反馈与逐句回听 | 已完成 | 2026-08-20 | [FE5-P7 校准记录](FE5-P7-dialogue-practice-feedback-and-playback.md) |
| FE6-01 首门生词课程 | 已完成 | 2026-08-20 | [FE6-01 开发进度](FE6-01-first-vocabulary-course.md) |
| FE6-P1 主动回忆反馈语义校准 | 已完成 | 2026-08-20 | [FE6-P1 校准记录](FE6-P1-recall-feedback-semantic-correction.md) |
| FE6-02 混合检查点与错误关联升级 | 已完成 | 2026-08-20 | [FE6-02 开发进度](FE6-02-mixed-checkpoint-and-error-linkage.md) |
| FE6-03 复习页、错题页与状态闭环 | 已完成 | 2026-08-20 | [FE6-03 开发进度](FE6-03-review-and-mistake-loop.md) |
| FE6-P2 错题页表格排版校准 | 已完成 | 2026-08-20 | [FE6-P2 校准记录](FE6-P2-mistakes-table-layout-correction.md) |
| FE7-01 自动化回归基础 | 已完成 | 2026-08-21 | [FE7-01 开发进度](FE7-01-automated-regression-foundation.md) |
| FE7-P1 首页声调路径端点视觉校准 | 已完成 | 2026-08-21 | [FE7-P1 校准记录](FE7-P1-tone-path-endpoint-correction.md) |
