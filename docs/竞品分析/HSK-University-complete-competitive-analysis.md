# HSK University 竞品分析报告（完整版）

> 分析对象：https://hskuniversity.com ｜ 重点竞品深挖：SuperTest（原 HSK Online）
> 数据采集：2026-08-13（浏览器实测抓取 hskuniversity.com 各页面；SuperTest 数据来自官网、应用商店页面与第三方测评）
> 引用说明：文中 [^n](url) 均为来源链接，数据以采集时点为准。

---

## 执行摘要

**HSK University** 是一个以 HSK 3.0 考试备考为核心定位的免费中文学习平台，采用"**免费课程获客 + AI 用量分层变现**"的模式 [^1](https://hskuniversity.com/compare)。它的核心差异化是：① 免费覆盖 HSK 1–5 完整课程；② 主打卡 HSK 3.0 新大纲（9 级、11,092 词）[^1](https://hskuniversity.com/compare)；③ AI Voice Tutor 实时语音辅导（竞品均无）[^2](https://hskuniversity.com/en/ai-tutor)。

最大竞品 **SuperTest** 的护城河是 **30 万道自研练习题 + 真题数字化解析 + 1 亿条学习数据飞轮** [^3](https://play.google.com/store/apps/details?id=com.hskonline)[^4](https://www.hskonline.com/)，在 HSK 备考 App 领域处于事实垄断地位 [^5](https://ltl-school.com/hsk-online/)。其结构性弱点是"教得少、练得多"、免费内容极少、无 AI 语音辅导。

**结论**：HSK University 打不赢题库规模战，机会在"**AI 辅导 + 免费课程 + HSK 3.0 全 9 级**"的差异化组合；但窗口期有限（SuperTest 已覆盖 7–9 级），且需尽快补齐移动端、6–9 级内容和信任资产。

---

# 第一部分：产品画像

## 1. 产品概览

- **定位**：以 HSK 3.0 考试备考为核心的中文学习平台，课程宣称基于官方 HSK 3.0 大纲（GF 0025-2021，9 级、11,092 词）[^1](https://hskuniversity.com/compare)
- **形态**：Web 优先（React SPA）+ Windows 桌面应用；官方移动 App 计划 2026 Q3 上线（目前仅有"NOTIFY ME"预热页）[^6](https://hskuniversity.com/en)
- **多语言**：en / de / ru / es / my 5 种语言 [^7](https://hskuniversity.com/sitemap.xml)
- **运营重心**：SEO 内容矩阵（hsk-3-guide、how-to-pass-hsk-3、learn-chinese-free、hsk-practice-test、is-hsk-worth-it、hsk-exam-cost、/compare 对比页）[^7](https://hskuniversity.com/sitemap.xml)

## 2. 核心功能盘点

| 模块 | 内容 | 备注 |
|---|---|---|
| **课程库 Study** | HSK 2.0 / HSK 3.0 双体系切换；HSK 1–5 开放（150/300/600/1200/2500 词），HSK 6 锁定"Coming Soon" | 分级课程 + 词汇路径 [^6](https://hskuniversity.com/en) |
| **练习 Practice** | SRS 间隔重复闪卡、听力对话练习、每日练习钻 | 免费 |
| **模考中心 Exams** | 4 种模式：全真模考（40 题/40 分钟）、快速练习（15 题）、弱项补救 Remediation（20 分钟）、每日限时赛（5 分钟，带排行榜） | 全真模考 Pro 锁定、快速练习 Max 锁定 [^8](https://hskuniversity.com/en/mock-test) |
| **AI Voice Tutor** | 3 个 AI 人格：Doctor A（正式学术）、AY-Z（口语俚语）、Zina（耐心辅导），宣称实时声调/语法语音反馈 | 赛博朋克终端风 UI（HSK_ACADEMY // NETWORK_STABLE）[^2](https://hskuniversity.com/en/ai-tutor) |
| **AI Chat / Podcast** | Cyber Companion 聊天、AI 播客 | Max 档以上解锁 |
| **社区 HSK Talk** | 内置社交 feed + HSK Tweets 聚合 | 冷启动迹象明显 |
| **游戏化** | 每日 3 项挑战、连续打卡 streak、弱项雷达 Weak Spot Radar、"今日智慧"金句 | |
| **增长机制** | ① 社交媒体发帖 @hskuniversity 换免费月/终身版；② 订阅者可抽奖且"3× 中奖概率" | [^6](https://hskuniversity.com/en) |

## 3. 商业模式与定价

Freemium。核心课程免费（对外宣称 HSK 1–5 全免费、AI 功能 $3 起）[^1](https://hskuniversity.com/compare)，三档付费订阅 [^9](https://hskuniversity.com/en/subscription)：

| 档位 | 月付 | 年付折算 | 核心权益 |
|---|---|---|---|
| **HSK Pro** | $4/月 | ~$2/月（-35%） | 更高 AI 用量、AI 工具、模考 + 练习 |
| **HSK Max** | $15/月 | ~$9/月 | Pro + 5× AI 用量、弱项训练、Podcast、AI Voice Tutor、更多模考 |
| **HSK Ultra** | $35/月 | ~$22/月 | Max + 20× AI 用量、无限模考、优先支持 |

付费墙设计得很"AI 优先"：免费用户可学完全部课程，但 AI 对话/语音辅导/模考额度是主要变现点。计费周期支持月度 / 3 个月（-20%）/ 年度（-35%）[^9](https://hskuniversity.com/en/subscription)。

---

# 第二部分：竞争格局

## 4. 竞品地图

```
┌─ 直接竞品（HSK 备考垂直）──────────────────────────────┐
│  SuperTest（原 HSK Online）— 备考 App 领域事实标准      │
│  HSK Academy / HSK Hero / 官方 chinesetest.cn 样题      │
├─ 间接竞品（通用中文学习，分食同一批用户）───────────────┤
│  HelloChinese（新手向）· Duolingo（最大流量入口）        │
│  Du Chinese / The Chairman's Bao / Mandarin Bean（阅读） │
│  Pleco / Skritter / Anki（工具型）                      │
├─ 替代方案（服务型）─────────────────────────────────────┤
│  italki / Preply / TutorMandarin（真人老师 $20–100/时）  │
└─────────────────────────────────────────────────────────┘
```

## 5. 核心竞品对比表

| 维度 | **HSK University** | SuperTest (HSK Online) | HelloChinese | Duolingo |
|---|---|---|---|---|
| 定位 | HSK 3.0 全 9 级备考 | HSK 备考题库（含 7–9 级）[^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide) | 新手通用中文 | 通用语言入门 |
| 免费内容 | HSK 1–5 核心课程免费 | 几乎全付费（1 套真题 + 3 套模拟）[^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide) | 仅到 HSK 1（2025 年缩水）[^11](https://apps.apple.com/nl/app/hellochinese-learn-chinese/id1001507516) | 大量免费 |
| 价格 | Pro $4/月起（年付 ~$2/月）[^9](https://hskuniversity.com/en/subscription) | ¥118/月、¥488/年、¥698/终身（约 $68/年）[^3](https://play.google.com/store/apps/details?id=com.hskonline)[^12](https://apps.apple.com/br/app/hsk-study-and-exam-supertest/id1335503360) | $11.99/月、$69.99/年 [^11](https://apps.apple.com/nl/app/hellochinese-learn-chinese/id1001507516) | Super 约 $13/月、$84–96/年 [^13](https://alphes-corner.com/2025/06/05/i-tried-super-duolingo-and-here-is-what-i-think-is-super-duolingo-worth-it/)[^14](https://www.gamsgo.com/blog/super-duolingo-subscription-worth-it-2025) |
| 题库规模 | 未披露（自称无限模考） | **30 万+ 练习题 + 10 套真题/级 + 15 套模拟** [^3](https://play.google.com/store/apps/details?id=com.hskonline)[^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide) | 有限 | 通用课程 |
| HSK 大纲对齐 | HSK 3.0 全 9 级（自述 11,092 词）[^1](https://hskuniversity.com/compare) | 强（HSK 2.0 + 3.0 的 7–9 级）[^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide) | 部分（HSK 1–3）[^1](https://hskuniversity.com/compare) | 不对齐 |
| 模考 | 无限（按档位限模式）[^8](https://hskuniversity.com/en/mock-test) | 真题模考为主打 + 报告系统 | 有限 | 无 |
| AI 语音辅导 | ✅ 实时声调/语法反馈（3 人格）[^2](https://hskuniversity.com/en/ai-tutor) | ❌（AI 为题库推荐/个性化）[^4](https://www.hskonline.com/) | ❌ | ❌ |
| 平台 | Web + Windows 桌面；App 2026 Q3 [^6](https://hskuniversity.com/en) | iOS/Android App 优先 + Web [^15](https://www.hskonline.com/) | iOS/Android App 优先 | 全平台 + App |
| 社区 | 内置 HSK Talk 社交流 [^6](https://hskuniversity.com/en) | 无 | 无 | 排行榜/俱乐部 |
| 用户规模 | 未披露 | 150 万+ 用户、200+ 国家、Play 100 万+ 下载 [^16](https://www.hskonline.com/en/about/index)[^3](https://play.google.com/store/apps/details?id=com.hskonline) | 千万级下载（行业头部） | 数亿 MAU |
| 权威性背书 | 弱（无公开真题来源说明） | 强（老牌、规模、真题积累） | 中 | 强 |

---

# 第三部分：重点竞品深挖 —— SuperTest 题库策略

> 为什么深挖 SuperTest：它是 HSK University 最直接、最强的竞品，LTL 测评直言其在"HSK 备考 App 领域没有对手、事实垄断" [^5](https://ltl-school.com/hsk-online/)。理解它的题库策略 = 理解这个市场的入场券。

## 6.1 题库全景：30 万题的三层结构

| 层 | 内容 | 规模 | 角色 |
|---|---|---|---|
| **真题层** | 历年官方 HSK 考试原卷（数字化：音频、计时、逐题解析） | ~10 套/级别（2022 年测评数据）[^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide) | 信任锚点 + "贴近真实考试"卖点 |
| **模拟卷层** | 教师按官方题型自研的整套模拟卷 | ~15 套 [^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide) | 补充题量、可无限重刷 |
| **练习题库** | 词汇、听力、阅读、写作单题训练（每道带详细解析） | **30 万+ 道** [^3](https://play.google.com/store/apps/details?id=com.hskonline) | 真正的主体，支撑日常刷题 |

覆盖 HSK 1–6（旧大纲）以及 HSK 3.0 新大纲的 7–9 级内容 [^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)，宣称"All HSK words included"（官方词汇全覆盖）[^3](https://play.google.com/store/apps/details?id=com.hskonline)。

## 6.2 题源策略：不拥有版权，拥有"数字化 + 解析"能力

**SuperTest 的真题并不是独家资源**：

- 官方历年真题在公开渠道免费可得：各国孔子学院官网直接挂出历届真题 PDF 供下载（如曼彻斯特孔院提供 2013 年 HSK1 全套原卷 + 答题卡）[^17](https://www.confuciusinstitute.manchester.ac.uk/study/testing/hsk/hsk-learning-resources/)。
- 因此 SuperTest 对真题的价值加工是：**数字化（音频化）+ 计时模拟环境 + 逐题解析 + 报告系统**，而不是拥有题目本身。
- 真正的护城河在自研部分：**30 万道练习题由"多年教学经验的教师团队设计，并结合 SuperTest 上 1 亿条学习数据"** [^4](https://www.hskonline.com/)，这是 8 年积累形成的规模壁垒。
- 解析体系是另一层壁垒：所有题目都有详细答案解析 [^3](https://play.google.com/store/apps/details?id=com.hskonline)，真题/模拟卷提供"全部解析 / 错题解析"双模式 [^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)。

**题源策略总结：官方公开素材（真题/词表）做信任背书 + 自研题做规模 + 解析做体验。**

## 6.3 组织与标注：让 30 万题可被"精准取用"

五维标注体系：

1. **按级别**：HSK 1–9
2. **按考试模块**：听力 / 阅读 / 写作三科
3. **按题型**：每个题型独立专项训练（"Special training for each question type, master the test one by one"）[^4](https://www.hskonline.com/)
4. **按词频**：词汇训练按高频词优先排序 [^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)
5. **按任务单元**：词汇以 10 词一组"mission"封装，学练分离 [^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)

直接结果：同一批题可以按"全真模考 / 题型专练 / 词汇任务 / 错题重练 / 每日 AI 复习"五种场景被反复调用。

## 6.4 功能闭环：题库 → 模考 → 报告 → 错题本 → 复习

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
- **错题本全自动**：做错的题 AI 自动收集，并有专门的"mistake training"错题训练模块 [^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)。
- **报告系统粒度到题**：总准确率、各科表现、逐题对错，形成"知道自己弱在哪"的正反馈 [^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)。
- **24 小时后才可复习错题**：刻意设计的留存机制 [^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)。
- 写作题有人工反馈：真人母语老师批改（付费）[^5](https://ltl-school.com/hsk-online/)。

## 6.5 变现：题库即付费墙

| 层级 | 内容 |
|---|---|
| 免费 | 1 套真题 + 3 套模拟卷 + 部分题型训练（无限次刷）[^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide) |
| 社交裂变 | 分享到微信/社交平台解锁 2 套真题 + 2 套模拟 [^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide) |
| VIP 订阅 | ¥118/月、¥488/年、**¥698 终身** [^3](https://play.google.com/store/apps/details?id=com.hskonline) |
| 增值服务 | 一对一辅导、直播课（HSK Companion 课程模块）、真人写作批改 [^4](https://www.hskonline.com/) |
| B 端 | 企业中文培训服务：16+ 行业、**5 万+ 企业员工**、98% 满意度 [^18](https://www.hskonline.com/en/corporate/services) |

洞察：
- **终身买断 ¥698 是刻意设计的高锚点**：对比年费 ¥488 只贵 43%，大幅降低决策成本，同时把 LTV 前置。
- **免费额度 + 分享裂变解锁** = 用"题库"当获客钩子。
- **B 端是第二曲线**：题库/内容资产直接包装成企业语言培训卖给跨国公司（宣称服务世界 500 强）[^4](https://www.hskonline.com/)。

## 6.6 数据飞轮：1 亿条数据反哺题库

- 课程设计"结合 1 亿条 SuperTest 学习数据" [^4](https://www.hskonline.com/)。
- 用户答题行为 → 题目难度校准 → 弱项画像 → 个性化出题 → 更精准练习 → 更多数据，形成闭环。
- 品牌定位即"Big Data + AI"："PRECISE（知道你的确切 HSK 水平）/ PERSONALIZED（个性化学习路径）/ OPTIMIZED（聚焦你需要提升的）" [^16](https://www.hskonline.com/en/about/index)。
- 燃料是规模：**150 万+ 用户、200+ 国家、4.8 分、Google Play 100 万+ 下载、29.8K 评论** [^16](https://www.hskonline.com/en/about/index)[^3](https://play.google.com/store/apps/details?id=com.hskonline)。

## 6.7 护城河评估

| 护城河 | 强度 | 说明 |
|---|---|---|
| 真题数字化 + 解析 | 中 | 真题公开可得，但数字化体验（音频/计时/报告）是重活 |
| 30 万自研题 + 解析库 | **高** | 8 年积累，后来者短期无法复制 |
| 错题本/数据飞轮 | 高 | 用户数据不可迁移，换 App = 放弃错题记录和弱项画像 |
| 品牌心智 | 高 | "HSK 备考 App 事实垄断" [^5](https://ltl-school.com/hsk-online/) |
| 版权壁垒 | **低** | 不拥有真题版权，若汉考国际收紧或官方 App 发力，真题层会被釜底抽薪 |

**结构性弱点**（多家测评共识）：
- **教得少、练得多**："Not so many actual teaching/learning resources"——它是练习机器，不是教学产品 [^5](https://ltl-school.com/hsk-online/)。
- 免费内容极少；翻译质量、音频质量偶有问题；复习等 24 小时被用户吐槽 [^10](https://www.cultureyard.net/blog/supertest--hsk-online-review-guide)。

---

# 第四部分：SWOT 与战略建议

## 7. HSK University SWOT 分析

### 优势 Strengths
1. **价格屠夫定位**：免费给到 HSK 5 级完整课程，付费档 $2–9/月，显著低于 SuperTest（~$68/年）和 HelloChinese（$69.99/年）
2. **抢占 HSK 3.0 新大纲心智**：明确打"9 级全覆盖"差异化
3. **AI 语音辅导是真差异化**：Duolingo / HelloChinese / SuperTest 均无实时语音反馈
4. **增长机制有想象力**：社交裂变换终身版 + 抽奖，获客成本可控
5. **SEO 内容矩阵 + 5 语言站点**，长尾流量布局完整

### 劣势 Weaknesses
1. **品牌声量为零**：公开渠道几乎搜不到讨论，无用户口碑沉淀
2. **无移动 App**：备考用户主战场在手机，2026 Q3 前移动端完全缺席
3. **内容完成度存疑**：HSK 6 级锁定、7–9 级实际课程覆盖未验证；"11,092 词"是否为真实可学内容待考
4. **权威性不足**：模考题目来源未披露，对比 SuperTest 的真题积累缺乏信任锚点
5. **AI 成本结构承压**：免费课程 + AI 用量分层，低 ARPU 下 AI 推理成本是长期风险
6. **UI 风格两极分化**：赛博朋克终端风辨识度高，但可能劝退追求简洁的学习者

### 机会 Opportunities
1. **HSK 3.0 换标红利**：新大纲 + 9 级体系落地，老平台迁移慢
2. **AI 学习助手渗透率提升**：语音反馈类产品（类似 ELSA Speak 之于英语）在中文领域还是空白
3. **东南亚/欧洲二语市场**：多语言站点指向的增量市场
4. **B 端机会**：培训机构、大学预科、孔子学院渠道可做白标/批量授权

### 威胁 Threats
1. **SuperTest 的存量壁垒**：真题 + 分数记录 + 错题数据，迁移成本高
2. **Duolingo/HelloChinese 下场做 HSK**：HelloChinese 已在补 HSK 3 内容 [^11](https://apps.apple.com/nl/app/hellochinese-learn-chinese/id1001507516)，大厂一旦对齐大纲，流量碾压
3. **官方免费样题**：chinesetest.cn 等官方渠道免费提供真题样题，是"无限模考"卖点的天花板
4. **AI 免费卷**：通用大模型自带中文对话能力，削弱"AI 辅导"稀缺性
5. **合规与信任风险**：抽奖/裂变机制的运营合规、用户语音数据处理

## 8. 关键洞察

1. **HSK University 本质是"AI 变现的 HSK 备考站"，不是内容站**：课程免费是获客钩子，收入全靠 AI 用量分层。模式成立的前提是 AI 体验真能替代真人老师——这是它唯一需要证明的事。
2. **题库规模战打不赢 SuperTest**："无限模考"对"30 万题 + 真题"，后者在备考心智上碾压。HSK University 必须换赛道竞争：**AI 辅导（生成式）vs SuperTest 的统计式 AI** 是唯一的代差优势。
3. **最大的窗口期在 2026–2027**：HSK 3.0 迁移潮 + 竞品 AI 化未完成。若移动 App 和 6–9 级内容如期补齐，有机会占住"HSK 3.0 + AI"心智；否则会被 SuperTest / HelloChinese 的 AI 版本反超。
4. **信任建设是短板中的短板**：备考产品卖的是"考试通过率"，没有真题来源、用户证言、公开数据，Ultra $35/月很难卖动。
5. **社区是隐藏变量**：HSK Talk 若围绕 CSC 奖学金、大学申请做起来，是 SuperTest 没有的社交护城河；目前是冷启动空壳。

## 9. 策略建议（按优先级）

| 优先级 | 动作 | 理由 |
|---|---|---|
| P0 | 移动 App 提前/MVP 先行（先做闪卡 + 模考，再上 AI 语音） | 备考用户 80% 时间在手机 |
| P0 | 补全 HSK 6 级并明确 7–9 级路线图 | "全 9 级"是核心 claim，缺 6 级会被竞品攻击 |
| P0 | **真题数字化 + 逐题解析**（公开资源，低成本） | 直接抄 SuperTest 的信任打法；真题不是版权壁垒 |
| P0 | 信任资产：标注模考题目来源、公开通过率/用户数据、挂证言 | 支撑高客单价 |
| P1 | 公布与官方大纲的词表对照页（可下载） | 免费内容本身就是最好的 SEO 资产 |
| P1 | 社区冷启动：官方发起 CSC 奖学金/大学申请话题 + 每周固定活动 | 社区是差异化护城河 |
| P1 | 定价验证：Ultra $35/月是否有人买？考虑"考试通过保证"或按次付费的 AI 语音 | 低 ARPU × 高 AI 成本，需要 LTV 模型 |
| P1 | AI 语音辅导做效果证明（如"30 天声调进步"公开案例） | 对打 SuperTest 的唯一代差武器 |
| P2 | B 端：语言学校/预科批量授权（B2B2C） | 学习 SuperTest 的终局：企业培训是现金牛 [^18](https://www.hskonline.com/en/corporate/services) |
| P2 | 监控 SuperTest 的 AI 化进度和 HelloChinese 的 HSK 3 内容 | 窗口期有限 |

## 10. 从 SuperTest 题库策略学到的五件事

1. **备考产品的信任锚点 = 真题**，而真题是公开资源——先做的人赢在"数字化 + 解析"的体验，不做的人永远缺信任。
2. **题库规模是时间壁垒不是技术壁垒**：SuperTest 用 8 年攒了 30 万题，HSK University 无法速成，所以别在题量上正面硬刚。
3. **免费额度是获客钩子，社交分享是裂变引擎**：SuperTest 用"1 套真题免费 + 分享解锁 2 套"的机制获客，HSK University 的"发帖换终身版"思路一致但需要更结构化的产品内裂变。
4. **数据飞轮决定长期竞争力**：错题本让用户的数据变成迁移成本，这是留存的关键设计。
5. **B 端变现是备考产品被低估的终局**：SuperTest 靠企业培训覆盖了 5 万+ 员工，个人订阅之外的第二增长曲线。

---

## 附录：数据来源

| # | 来源 | 用途 |
|---|---|---|
| 1 | https://hskuniversity.com/compare | HSK University 自述定位/对比表 |
| 2 | https://hskuniversity.com/en/ai-tutor | AI Voice Tutor 功能 |
| 3 | https://play.google.com/store/apps/details?id=com.hskonline | SuperTest 题量/定价/用户数 |
| 4 | https://www.hskonline.com/ | SuperTest 官网（1 亿数据/教师团队） |
| 5 | https://ltl-school.com/hsk-online/ | LTL 测评（垄断评价/弱点） |
| 6 | https://hskuniversity.com/en | HSK University Dashboard/功能 |
| 7 | https://hskuniversity.com/sitemap.xml | 站点结构/多语言/SEO |
| 8 | https://hskuniversity.com/en/mock-test | 模考中心 |
| 9 | https://hskuniversity.com/en/subscription | 定价 |
| 10 | https://www.cultureyard.net/blog/supertest--hsk-online-review-guide | SuperTest 深度测评（真题/模拟套数、错题本等） |
| 11 | https://apps.apple.com/nl/app/hellochinese-learn-chinese/id1001507516 | HelloChinese 定价 |
| 12 | https://apps.apple.com/br/app/hsk-study-and-exam-supertest/id1335503360 | SuperTest 定价 |
| 13 | https://alphes-corner.com/2025/06/05/i-tried-super-duolingo-and-here-is-what-i-think-is-super-duolingo-worth-it/ | Duolingo 定价 |
| 14 | https://www.gamsgo.com/blog/super-duolingo-subscription-worth-it-2025 | Duolingo 定价 |
| 15 | https://www.hskonline.com/ | SuperTest 官网 |
| 16 | https://www.hskonline.com/en/about/index | SuperTest 用户规模/公司 |
| 17 | https://www.confuciusinstitute.manchester.ac.uk/study/testing/hsk/hsk-learning-resources/ | 真题公开可得的证据 |
| 18 | https://www.hskonline.com/en/corporate/services | SuperTest 企业服务 |

*注：SuperTest 真题/模拟套数、免费与解锁额度来自 2022 年第三方测评，可能与当前版本有出入；题量 30 万+、定价、用户数为 Google Play / 官网现行数据。HSK University 页面数据为 2026-08-13 浏览器实测抓取。*
