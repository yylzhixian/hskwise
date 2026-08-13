# SuperTest（原 HSK Online）题库策略深挖

> 数据来源：Google Play / App Store 应用页、hskonline.com 官网（首页/About/企业服务页）、CultureYard 深度测评（2022）、LTL School 测评、曼彻斯特孔子学院公开真题资源页。采集于 2026-08-13。

---

## 1. 题库全景：30 万题的三层结构

SuperTest 的题库不是单一题库，而是 **三层混合结构**，规模与角色各不相同：

| 层 | 内容 | 规模 | 角色 |
|---|---|---|---|
| **真题层** | 历年官方 HSK 考试原卷（数字化：音频、计时、逐题解析） | ~10 套/级别（2022 年测评数据）[^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide) | 信任锚点 + "贴近真实考试"卖点 |
| **模拟卷层** | 教师按官方题型自研的整套模拟卷 | ~15 套 [^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide) | 补充题量、可无限重刷 |
| **练习题库** | 词汇、听力、阅读、写作单题训练（每道带详细解析） | **30 万+ 道** [^1](https://play.google.com/store/apps/details?id=com.hskonline) | 真正的主体，支撑日常刷题 |

覆盖 HSK 1–6（旧大纲）以及 HSK 3.0 新大纲的 7–9 级内容 [^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)，宣称"All HSK words included"（官方词汇全覆盖）[^1](https://play.google.com/store/apps/details?id=com.hskonline)。

## 2. 题源策略：不拥有版权，拥有"数字化 + 解析"能力

这是最值得注意的一点 —— **SuperTest 的真题并不是独家资源**：

- 官方历年真题本身在公开渠道免费可得：各国孔子学院官网直接挂出历届真题 PDF 供下载（如曼彻斯特孔院提供 2013 年 HSK1 全套原卷 + 答题卡）[^7](https://www.confuciusinstitute.manchester.ac.uk/study/testing/hsk/hsk-learning-resources/)。
- 所以 SuperTest 对真题的价值加工是：**数字化（音频化）+ 计时模拟环境 + 逐题解析 + 报告系统**，而不是拥有题目本身。
- 真正的护城河在自研部分：**30 万道练习题由"多年教学经验的教师团队设计，并结合 SuperTest 上 1 亿条学习数据"** [^3](https://www.hskonline.com/)。这是 8 年积累形成的规模壁垒。
- 解析体系是另一层壁垒：所有题目都有详细答案解析 [^1](https://play.google.com/store/apps/details?id=com.hskonline)，真题/模拟卷提供"全部解析 / 错题解析"双模式 [^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)。

**题源策略总结：官方素材（公开真题/词表）做信任背书 + 自研题做规模 + 解析做体验。**

## 3. 组织与标注：让 30 万题可被"精准取用"

题库的价值取决于组织方式，SuperTest 做了五维标注：

1. **按级别**：HSK 1–9
2. **按考试模块**：听力 / 阅读 / 写作三科
3. **按题型**：每个题型独立专项训练（"Special training for each question type, master the test one by one"）[^3](https://www.hskonline.com/)
4. **按词频**：词汇训练按高频词优先排序展示 [^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)
5. **按任务单元**：词汇以 10 词一组"mission"封装，学练分离 [^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)

这种标注体系的直接结果：同一批题可以按"全真模考 / 题型专练 / 词汇任务 / 错题重练 / 每日 AI 复习"五种场景被反复调用。

## 4. 功能闭环：题库 → 模考 → 报告 → 错题本 → 复习

SuperTest 题库的真正价值在它驱动的学习闭环：

```
免费水平测试（定位级别）
      ↓
个性化学习路径
      ↓
真题/模拟卷（计时全真模拟）──→ 考试报告
      │                        ├ 总准确率
      │                        ├ 分科/分节表现
      │                        └ 逐题解析（全部/仅错题）
      ↓
自动错题本（AI 自动收集错题）
      ↓
错题重练 + 个性化每日 AI 复习 + 每日错题复习
      ↓
（再次模考验证 → 循环）
```

关键设计细节：
- **错题本是全自动的**：做错的题 AI 自动收集，并有专门的"mistake training"错题训练模块 [^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)。
- **报告系统粒度到题**：总准确率、各科表现、逐题对错，形成"知道自己弱在哪"的正反馈 [^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)。
- **24 小时后才可复习错题**：刻意设计的留存机制，把用户拉回 App [^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)。
- 写作题有人工反馈：真人母语老师批改（付费）[^5](https://ltl-school.com/hsk-online/)。

## 5. 变现：题库即付费墙

SuperTest 的商业模式本质是 **"题库分级解锁"**：

| 层级 | 内容 |
|---|---|
| 免费 | 1 套真题 + 3 套模拟卷 + 部分题型训练（无限次刷）[^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide) |
| 社交裂变 | 分享到微信/社交平台解锁 2 套真题 + 2 套模拟 [^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide) |
| VIP 订阅 | ¥118/月、¥488/年、**¥698 终身** [^1](https://play.google.com/store/apps/details?id=com.hskonline) |
| 增值服务 | 一对一辅导、直播课（HSK Companion 课程模块）、真人写作批改 [^3](https://www.hskonline.com/) |
| B 端 | 企业中文培训服务：16+ 行业、**5 万+ 企业员工**、98% 满意度 [^6](https://www.hskonline.com/en/corporate/services) |

几个洞察：
- **终身买断 ¥698** 是刻意设计的高锚点：对比年费 ¥488，终身只贵 43%，大幅降低用户决策成本，同时把 LTV 前置。
- 免费额度 + 分享裂变解锁 = 用"题库"当获客钩子，裂变系数可观（分享给微信好友即解锁）。
- B 端是第二曲线：题库/内容资产直接包装成企业语言培训卖给跨国公司（宣称服务世界 500 强）[^3](https://www.hskonline.com/)。

## 6. 数据飞轮：1 亿条数据反哺题库

- 官方宣称课程设计"结合 1 亿条 SuperTest 学习数据" [^3](https://www.hskonline.com/)。
- 用户答题行为 → 题目难度校准 → 弱项画像 → 个性化出题 → 更精准的练习 → 更多数据，形成闭环。
- 对外品牌定位即"Big Data + AI"："PRECISE（知道你的确切 HSK 水平）/ PERSONALIZED（个性化学习路径）/ OPTIMIZED（聚焦你需要提升的）" [^4](https://www.hskonline.com/en/about/index)。
- 用户规模是飞轮的燃料：**150 万+ 用户、200+ 国家、4.8 分、Google Play 100 万+ 下载、29.8K 评论** [^4](https://www.hskonline.com/en/about/index)[^1](https://play.google.com/store/apps/details?id=com.hskonline)。

## 7. 护城河评估

| 护城河 | 强度 | 说明 |
|---|---|---|
| 真题数字化 + 解析 | 中 | 真题公开可得，但数字化体验（音频/计时/报告）是重活 |
| 30 万自研题 + 解析库 | **高** | 8 年积累，后来者短期无法复制（HSK University 模考自称"unlimited"但无题量数据） |
| 错题本/数据飞轮 | 高 | 用户数据不可迁移，换 App = 放弃错题记录和弱项画像 |
| 品牌心智 | 高 | LTL 测评直言"HSK 备考 App 领域没有对手、事实垄断" [^5](https://ltl-school.com/hsk-online/) |
| 版权壁垒 | **低** | 不拥有真题版权，若汉考国际收紧或官方 App 发力，真题层会被釜底抽薪 |

**结构性弱点**（被多家测评共识指出）：
- **教得少、练得多**："Not so many actual teaching/learning resources"——它是练习机器，不是教学产品 [^5](https://ltl-school.com/hsk-online/)。
- 免费内容极少（基本全付费）；翻译质量、音频质量偶有问题；复习要等 24 小时（留存设计也被用户吐槽）[^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)。

## 8. 对 HSK University 的启示

1. **"无限模考"打不赢 30 万题**：HSK University 的卖点是无限次数，SuperTest 的卖点是题量和真题真实度。前者必须补题量或换赛道（AI 辅导）。
2. **真题不是壁垒，人人都能做**：HSK University 可以立刻做"历年真题数字化 + 逐题解析"（公开资源），这是低成本补齐信任缺口的最快路径。
3. **SuperTest 的 AI 是"统计智能"，HSK University 的 AI 是"生成智能"**：SuperTest 的"AI"本质是题库数据驱动的个性化推荐；而语音对话辅导（Doctor A）SuperTest 没有。这是 HSK University 唯一真正的差异化空间，但需证明效果。
4. **警惕 SuperTest 的 7–9 级动作**：它已覆盖 HSK 3.0 新大纲内容 [^2](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)，"HSK 3.0 全 9 级"这个心智窗口正在关闭。
5. **B 端是 SuperTest 的现金牛，也是 HSK University 该学的终局**：企业培训（5 万员工）说明备考产品的付费方不只有个人考生。

---

*注：真题套数、免费/解锁额度等数据来自 2022 年第三方测评，可能与当前版本有出入；题量 30 万+、定价、用户数为 Google Play/官网现行数据。*
