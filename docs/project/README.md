# HSKWise 项目方案索引

HSKWise 的产品方向是：面向非汉语母语者的专业 HSK 备考与能力提升平台。

核心判断：

- 不把 HSK 2.0 和 HSK 3.0 做成两个割裂产品，而是建立统一内容库。
- 数据模型不把 `hsk` 默认当作 HSK 3.0：目标上下文用 `standardVersion/standardLevel`，内容映射用 `hsk2Level/hsk3Level`。
- HSK 标准版本和等级保留可读字符串；来源、用户状态、角色、目标类型、目标状态、会话状态、设备类型、词字类型等内部枚举使用数字码存储。
- 第一阶段身份体系采用 Google 登录，使用独立 session 表支持多设备登录和设备级退出。
- 前台按学习路线分流：当前考试备考、新标准长期学习、不确定先测级。主体验不做扁平等级入口。
- 等级是路线规划和资料筛选参数，不是用户每天面对的主导航。
- 底层内容优先以 complete-hsk-vocabulary 建立 HSK 字词主数据；官网资料补标准等级和汉字认读/书写等级。语法、话题、任务进入后续课程模块。
- 课程内容采用“内部参考来源 + 原创 course/unit/section/block + 字词引用”的存储规范；HSK 2.0 和 HSK 3.0 共用同一套课程规则，只在学习内容和等级映射上区分。
- MVP 先完成“诊断 -> 学习 -> 复习 -> 练习 -> 模考 -> 错题再训练”的闭环。

## 当前代码快照

- 首页已接入 [GoogleLoginButton](/Users/yanglong/Documents/YL/hskwise/src/components/google-login-button.tsx)，使用 Google Identity Services HTML SDK。
- Google 登录当前采用 `popup` 模式，只在前端 callback 中解析并打印 credential payload；服务端 token 校验、用户写入和 session 创建尚未实现。
- 当前 API 只有 `/api/health` 和 `/api/db`，`/api/auth/*` 仍是下一步工作。
- Drizzle schema 位于 [src/db/schema.ts](/Users/yanglong/Documents/YL/hskwise/src/db/schema.ts)，字段和 enum 说明以代码内注释为准。
- 课程存储设计见 [课程存储与 Admin 制课方案](06-course-storage-design.md)，当前尚未写入 schema。
- 当前没有生成 migration；等 schema 稳定后再手动运行 `bun run db:gen` 和 `bun run db:mig`。

## 文档列表

- [产品方案](01-product-plan.md)
- [内容与数据方案](02-content-data-plan.md)
- [开发方案](03-development-plan.md)
- [阶段路线图](04-roadmap.md)
- [数据库 Schema](05-db-schema.md)
- [课程存储与 Admin 制课方案](06-course-storage-design.md)

## 官方资料入口

- [HSK 3.0 大纲拆分索引](../hsk3-syllabus/README.md)
- [考试能力描述](../hsk3-syllabus/capability-description.md)
- [任务大纲](../hsk3-syllabus/tasks/hsk-1.md)
- [话题大纲](../hsk3-syllabus/topics/hsk-1.md)
- [词汇大纲](../hsk3-syllabus/vocabulary/hsk-1.md)
- [汉字大纲](../hsk3-syllabus/characters/recognition-hsk-1.md)
- [语法大纲](../hsk3-syllabus/grammar/hsk-1.md)
