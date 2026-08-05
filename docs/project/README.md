# HSKWise 项目方案索引

HSKWise 的产品方向是：面向非汉语母语者的专业 HSK 备考与能力提升平台。

核心判断：

- 不把 HSK 2.0 和 HSK 3.0 做成两个割裂产品，而是建立统一内容库。
- 数据模型不把 `hsk` 默认当作 HSK 3.0：目标上下文用 `standardVersion/standardLevel`，内容映射用 `hsk2Level/hsk3Level`。
- HSK 标准版本和等级保留可读字符串；来源、角色、目标类型、状态、词字类型等内部枚举使用数字码存储。
- 前台按学习路线分流：当前考试备考、新标准长期学习、不确定先测级。主体验不做扁平等级入口。
- 等级是路线规划和资料筛选参数，不是用户每天面对的主导航。
- 底层内容优先以 complete-hsk-vocabulary 建立 HSK 字词主数据；官网资料补标准等级和汉字认读/书写等级。语法、话题、任务进入后续课程模块。
- MVP 先完成“诊断 -> 学习 -> 复习 -> 练习 -> 模考 -> 错题再训练”的闭环。

## 文档列表

- [产品方案](01-product-plan.md)
- [内容与数据方案](02-content-data-plan.md)
- [开发方案](03-development-plan.md)
- [阶段路线图](04-roadmap.md)
- [数据库 Schema](05-db-schema.md)

## 官方资料入口

- [HSK 3.0 大纲拆分索引](../hsk3-syllabus/README.md)
- [考试能力描述](../hsk3-syllabus/capability-description.md)
- [任务大纲](../hsk3-syllabus/tasks/hsk-1.md)
- [话题大纲](../hsk3-syllabus/topics/hsk-1.md)
- [词汇大纲](../hsk3-syllabus/vocabulary/hsk-1.md)
- [汉字大纲](../hsk3-syllabus/characters/recognition-hsk-1.md)
- [语法大纲](../hsk3-syllabus/grammar/hsk-1.md)
