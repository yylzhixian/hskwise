# 阶段路线图

> 2026-08-18 路线调整：通用 Course Studio 暂停产品化，课程阶段改为“先实现真实课程，再提取模板”。详细执行见[代码优先课程开发与模板演进计划](10-code-first-course-development-plan.md)。

## 当前实现进度

当前代码已经完成：

- Google 登录前端入口：`src/components/google-login-button.tsx`。
- Google credential 前端解析：`src/hooks/use-google-credential-callback.ts`。
- API 骨架：`/api/health`、`/api/db`。
- 第一阶段 Drizzle schema 草案：`src/db/schema/` 按表拆分，字段和 enum 说明维护在代码注释中。
- 课程存储设计文档：[课程存储与 Admin 制课方案](06-course-storage-design.md)。
- 代码优先课程计划：[代码优先课程开发与模板演进计划](10-code-first-course-development-plan.md)。

当前尚未完成：

- 服务端 Google ID token 校验。
- `users`、`auth_accounts`、`user_sessions` 的真实登录写入流程。
- 退出当前设备、退出全部设备。
- 内容导入脚本和真实内容入库。
- App shell、onboarding、Dashboard、学习路线页。
- 课程 schema 和 Admin 制课后台。

## Phase 0：资料整理与产品定型

目标：把官方资料、产品策略和技术方案定下来。

交付物：

- 官方大纲拆分文档。
- 产品方案。
- 内容与数据方案。
- 开发方案。
- 课程存储与 Admin 制课方案。
- 代码优先课程开发与模板演进计划。
- MVP 范围定义。

验收标准：

- 能从索引快速查到 HSK 3.0 各等级的官方资料，并明确第一阶段只结构化字词。
- 团队对“统一内容库 + 路线驱动主体验 + 双标准标签”达成一致。
- 团队对“内部参考来源 + 原创 course/unit/section/scene + 字词引用”的课程存储规范达成一致。
- 团队对“代码优先、模板后置、暂不建设通用编辑器”的课程开发顺序达成一致。
- 明确第一版只做 HSK 3.0 Level 1-4 的完整学习闭环。

## Phase 1：内容基础设施

目标：让 complete-hsk-vocabulary 和官方资料变成产品可用的数据。

核心任务：

- 设计数据库 schema。
- 编写 complete-hsk-vocabulary 导入脚本。
- 编写官方汉字大纲解析脚本。
- 从 complete-hsk-vocabulary 导入 HSK 3.0 Level 1-4 词汇。
- 导入 HSK 3.0 Level 1-4 汉字。
- 建立内容校验报告。

验收标准：

- HSK 3.0 Level 1-4 词汇可查询、可筛选。
- 每个词条保留 HSK 3.0 原始等级标注。
- 内容导入可重复执行。
- 缺失字段和异常标注可报告。

## Phase 2：学习者端 MVP

目标：用户可以完成从进入产品到每日学习的主流程。

核心任务：

- 首页路线分流。
- Google 登录。
- 多设备 session 管理。
- Onboarding 路线选择与目标设置。
- Dashboard。
- `/learn` 当前路线页。
- HSK 3.0 Level 1-4 路线样例。
- 词汇库。
- 汉字库。
- 基础学习状态。

验收标准：

- 新用户可以选择学习路线并进入 Dashboard。
- 用户可以使用 Google 登录，并在多台设备保持独立 session。
- 用户可以退出当前设备，后续可扩展退出全部设备。
- Dashboard 有清晰的 `Continue` 主行动，用户不需要先面对完整等级列表。
- 用户可以浏览 HSK 3.0 Level 1-4 字词内容。
- 用户可以标记词汇和汉字掌握状态。
- 页面在桌面和移动端都可用。

## Phase 3：真实课程与模板验证

目标：先不建设通用编辑器，直接完成多个真实课程，用实际重复结构验证共享组件、模板边界和 JSON 协议。

核心任务：

- 复用现有 scene、interaction、音频、事件和进度运行时。
- 完成拼音与声调讲解课。
- 完成对话精读与跟读课。
- 完成生词学习与练习课。
- 分离课程内容数据与 React 模板。
- 从多个真实课程中提取共享教学组件。
- 为稳定课程类型建立独立 Zod schema 和 JSON 数据协议。
- 建立课程学习路径、移动端和视觉回归。

验收标准：

- 学习者可以完整学完三类代表性课程。
- 每门课程的正文、题目和素材来自可校验数据，不散落在组件 JSX 中。
- 课程效果在桌面和移动端稳定，不依赖 Course Studio。
- 至少两个同类课程证明模板可以主要通过修改数据生产新实例。
- 新模板来自真实重复结构，不演化为万能配置对象。

## Phase 4：课程生产后台

目标：真实课程和模板协议稳定后，再补全后端持久化、资源管理、审核发布和学习者端课程读取。

核心任务：

- 课程 schema 扩展：`course_sources`、`courses`、`course_level_mappings`、`course_units`、`course_sections`、`course_scenes`、`course_scene_tags`、`course_scene_refs`。
- Admin source 管理。
- Course outline 后端保存。
- 将稳定的课程模板和内容数据接入真实课程、scene、引用和发布数据。
- 字词搜索和引用绑定落库。
- 缺音频、未匹配词、版权状态、内容来源、OCR 异常检查。
- 草稿预览和发布状态管理。

验收标准：

- Admin 能录入一套 textbook 内部参考来源并创建课程草稿。
- Admin 能参考教材结构，把自制课程拆成 unit、section、scene。
- 生词类 scene 能引用 `lexical_items` / `lexical_forms`。
- 课程 scene 能保留 `audio_url` 字段，音频缺失时可明确标记。
- 发布前能发现未匹配词、非稳定素材 URL、`referenceOnly` / `referenceRewrite` 内容和未确认版权状态。
- 学习者端可以读取已发布课程结构。

## Phase 5：复习与练习闭环

目标：产品从“资料库”变成“学习工具”。

核心任务：

- SRS 复习队列。
- 词汇选择题。
- 汉字认读题。
- 错题本。
- 弱项推荐。

验收标准：

- 用户每天有自动生成的复习任务。
- 答错内容进入错题本。
- 错题能关联到词汇或汉字；语法错题等课程模块设计后再加入。
- 课程接入后，错题可以进一步关联到具体 course scene。
- Dashboard 能显示今日完成度和弱项。

## Phase 6：模考与备考报告

目标：形成专业备考闭环。

核心任务：

- HSK 3.0 Level 1-4 迷你模考。
- 计时考试界面。
- 自动评分。
- 题目解析。
- 能力报告。
- 目标等级通过率预测。

验收标准：

- 用户可以完成一套模考并得到分数。
- 报告能显示词汇、语法、阅读、听力等维度。
- 模考错题自动进入复习。

## Phase 7：商业化增强

目标：建立可付费的高级学习体验。

核心任务：

- AI 口语陪练。
- AI 作文批改。
- 个性化备考计划。
- 无限模考。
- PDF/worksheet 导出。
- 教师端班级管理。

验收标准：

- 免费用户能完成基础学习闭环。
- 付费功能能明显提升备考效率。
- 教师端能创建班级、查看学生进度、布置练习。

## 推荐优先级

短期优先做：

1. 内容导入。
2. Google 登录和多设备 session。
3. 首页路线分流与 onboarding。
4. `/learn` 当前路线页和 Dashboard `Continue`。
5. HSK 3.0 Level 1-4 词汇库。
6. 代码优先真实课程：拼音、对话、生词课程与模板提取。
7. SRS 复习。
8. 基础练习和错题本。

暂不优先做：

- 社区。
- 完整 AI 口语。
- 完整教师端。
- 移动端 app。
- HSK 3.0 Level 7-9 完整题库。
