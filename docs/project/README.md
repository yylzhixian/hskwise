# HSKWise 项目方案索引

> 当前唯一执行主线：[网站整体规划与正式开发主线](11-website-master-plan.md)。其余文档提供专题设计、历史决策或资料依据；如开发顺序冲突，以该主线为准。

HSKWise 的产品方向是：面向非汉语母语者的专业 HSK 备考与能力提升平台。

核心判断：

- 不把 HSK 2.0 和 HSK 3.0 做成两个割裂产品，而是建立统一内容库。
- 数据模型不把 `hsk` 默认当作 HSK 3.0：目标上下文用 `standardVersion/standardLevel`，内容映射用 `hsk2Level/hsk3Level`。
- HSK 标准版本和等级保留可读字符串；来源、用户状态、角色、目标类型、目标状态、会话状态、设备类型、词字类型等内部枚举使用数字码存储。
- 第一阶段身份体系采用 Google 登录，使用独立 session 表支持多设备登录和设备级退出。
- 前台按学习路线分流：当前考试备考、新标准长期学习、不确定先测级。主体验不做扁平等级入口。
- 等级是路线规划和资料筛选参数，不是用户每天面对的主导航。
- 底层内容优先以 complete-hsk-vocabulary 建立 HSK 字词主数据；官网资料补标准等级和汉字认读/书写等级。语法、话题、任务进入后续课程模块。
- 课程内容采用“内部参考来源 + 原创 course/unit/section/scene + 字词引用”的存储规范；HSK 2.0 和 HSK 3.0 共用同一套课程规则，只在学习内容和等级映射上区分。
- 课程开发当前采用“代码优先、模板后置”：先为拼音、对话、生词等类型直接实现高质量 React 课程，再从多个真实课程中提取稳定模板和 JSON 协议。
- 通用 Course Studio 已停止产品化并从当前源码移除；有价值的实验结论由历史文档和 Git 保留，正式课程使用收敛后的独立运行时。
- M0 先完成“路线 -> 互动课程 -> 检查点 -> 错误回流”的四节点纵向切片；诊断、模考和完整备考报告后续接入。

## 当前代码快照

- 首页已接入 [GoogleLoginButton](/Users/yanglong/Documents/YL/hskwise/src/components/google-login-button.tsx)，使用 Google Identity Services HTML SDK。
- Google 登录当前采用 `popup` 模式，只在前端 callback 中解析并打印 credential payload；服务端 token 校验、用户写入和 session 创建尚未实现。
- 当前 API 只有 `/api/health` 和 `/api/db`，`/api/auth/*` 仍是下一步工作。
- Drizzle schema 按表拆分在 [src/db/schema/](/Users/yanglong/Documents/YL/hskwise/src/db/schema/)，[src/db/schema.ts](/Users/yanglong/Documents/YL/hskwise/src/db/schema.ts) 只作为兼容旧导入的统一出口。
- 当前前端源码结构见 [src/README.md](/Users/yanglong/Documents/YL/hskwise/src/README.md)：`app` 只保留路由定义，页面、公共组件、hooks 和全局状态分别进入 `views`、`components`、`hooks` 和 `store`。
- Course Studio、`runtime-lab` 和开发 fixture 已在 FE4-R1 从当前源码移除，详见[源码结构收敛进度](progress/FE4-R1-source-structure-simplification.md)。
- 课程存储设计见 [课程存储与 Admin 制课方案](06-course-storage-design.md)，Course Studio 历史路线见 [Course Studio 开发计划](07-course-studio-development-plan.md)，课程实现遵循[代码优先课程开发与模板演进计划](10-code-first-course-development-plan.md)，当前整体执行顺序见[网站整体规划与正式开发主线](11-website-master-plan.md)。课程后端表当前尚未写入 schema。
- 当前没有生成 migration；等 schema 稳定后再手动运行 `bun run db:gen` 和 `bun run db:mig`。

## 文档列表

- [网站整体规划与正式开发主线](11-website-master-plan.md)（当前执行总纲）
- [前端学习体验分阶段开发计划](12-frontend-learning-experience-development-plan.md)（当前执行子计划）
- [前端开发阶段进度档案](progress/README.md)（每阶段完成后的实际记录）
- [产品方案](01-product-plan.md)
- [内容与数据方案](02-content-data-plan.md)
- [开发方案](03-development-plan.md)
- [阶段路线图](04-roadmap.md)
- [数据库 Schema](05-db-schema.md)
- [课程存储与 Admin 制课方案](06-course-storage-design.md)
- [Course Studio 开发计划](07-course-studio-development-plan.md)
- [Course Studio 可用性重构实施计划](08-course-studio-usability-refactor-plan.md)
- [Course Studio 可用性基线](09-course-studio-usability-baseline.md)
- [代码优先课程开发与模板演进计划](10-code-first-course-development-plan.md)

文档状态：

- 当前主线：`11-website-master-plan.md`；当前执行子计划：`12-frontend-learning-experience-development-plan.md`；[FE5 对话精读与角色练习](progress/FE5-dialogue-close-reading-and-role-practice.md)已完成并归档，当前进入 FE6 生词、检查点与复习闭环。
- 当前专题方案：`02-content-data-plan.md`、`05-db-schema.md`、`06-course-storage-design.md`、`10-code-first-course-development-plan.md`。
- 设计背景：`01-product-plan.md`、`03-development-plan.md`、`04-roadmap.md`。
- 历史实验：`07-course-studio-development-plan.md`、`08-course-studio-usability-refactor-plan.md`、`09-course-studio-usability-baseline.md`。

## 官方资料入口

- [HSK 3.0 大纲拆分索引](../hsk3-syllabus/README.md)
- [考试能力描述](../hsk3-syllabus/capability-description.md)
- [任务大纲](../hsk3-syllabus/tasks/hsk-1.md)
- [话题大纲](../hsk3-syllabus/topics/hsk-1.md)
- [词汇大纲](../hsk3-syllabus/vocabulary/hsk-1.md)
- [汉字大纲](../hsk3-syllabus/characters/recognition-hsk-1.md)
- [语法大纲](../hsk3-syllabus/grammar/hsk-1.md)
