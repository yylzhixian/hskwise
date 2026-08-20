# FE6-01 首门生词课程开发进度

| 项目 | 结果 |
|---|---|
| 所属阶段 | FE6 生词课程、检查点与复习闭环 |
| 状态 | 已完成；真人词条音频保留为发布门禁 |
| 完成日期 | 2026-08-20 |
| 上一归档 | [FE5 对话精读与角色练习](FE5-dialogue-close-reading-and-role-practice.md) |
| 下一项 | FE6-02 混合检查点与错误关联升级 |

## 1. 本次结论

`/lessons/first-words` 已形成“语境发现 -> 逐词建立音形义 -> 词义识别 -> 听音辨词 -> 主动回忆 -> 句中应用 -> 总结”的完整生词课程。课程不是连续翻卡片：学习者先回到上一课的原创对话，再把词从句中取出，最后主动提取并放回新句子。

课程完成后会点亮路线第三节点并解锁 Starter checkpoint。词义题答错必须重试；主动回忆选择 `Need another look` 会写入错题与次日复习队列，但不会强迫学习者虚报“已记住”才能继续。

## 2. 课程协议与内容引用

- 新增 `vocabularyLesson/v1`，描述词条、拼音、释义、用法、音频、知识点及原对话来源。
- 协议包含 `context-discovery`、`word-focus`、`meaning-choice`、`listening-choice`、`active-recall`、`sentence-application` 和 `vocabulary-summary` 七类步骤。
- Schema 校验词条、知识点、步骤和选项 ID，确保选择题只有一个正确答案；单个语境发现步骤只能引用同一条原对话。
- 《Your first words》的汉字、拼音、释义、上下文和上下文音频直接从 `firstGreetingLesson` 的 line/token 派生，源码不维护第二份词条事实。
- 新增未发布的 `daily-items-sample`，用不同词数、较长释义和对象类语境验证模板不依赖首课特例。

## 3. 交互与视觉边界

- 使用“word rail”作为本课语音导视签名：序号、汉字和拼音既是导航，也是学习顺序，不使用同权重卡片墙。
- 词条详情保持无嵌套卡片的分隔布局，突出汉字、声音、句法职责和原始语境。
- 听音题在播放完成前锁定选项；音频失败时可显式切换到拼音 fallback，不阻断课程。
- 主动回忆先隐藏答案，揭示后由学习者诚实自评；共享 LessonFrame 现在会区分“必须答对”与“错误也允许继续”的互动规则。
- 课程组件与 hook 聚合在 `src/courses/vocabulary`，选择和音频状态继续复用 `src/hooks` 的公共能力。

## 4. 素材与版权

- 五段词条音频由本地 macOS `Tingting` TTS 生成，只用于 Frontend Alpha 播放链路验证。
- 音频数据和[占位素材清单](/Users/yanglong/Documents/YL/hskwise/public/audio/placeholders/vocabulary/first-words/README.md)均标记 `generated-placeholder`、`placeholder` 和 `mustReplaceBeforePublish`。
- 课程正文、例句和练习均基于项目原创对话；未复制 `docs/textbooks` 的文字、图片、音频或练习素材。
- 公开发布前必须替换为项目原创录制或具有明确授权记录的真人普通话音频。

## 5. 验证

| 检查 | 结果 |
|---|---|
| `bun run lint` | 通过 |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 47 pass、0 fail、177 assertions |
| `bun run build` | Next.js 16.3.0 生产构建通过 |
| 第二内容 fixture | 不同词数、长释义、七类步骤和运行时投影通过 |
| 浏览器音频 | 原对话音频、逐词音频和听音解锁通过 |
| 浏览器错误路径 | 词义错误必须重试；主动回忆失败写入复习但可继续 |
| 浏览器课程闭环 | 完成后 `/learn` 显示 3 of 4，Checkpoint 成为当前节点 |
| `390x844` 窄屏 | word rail、词条详情、滚动区和固定底栏无横向溢出或遮挡 |

## 6. 未做事项与下一步

- FE6 尚未完成：`CheckpointSchema`、混合检查点、`/review` 和 `/mistakes` 仍待开发。
- 当前错题状态只关联 lesson、node 和 knowledge，尚未保存 step 与 interaction ID；FE6-02 需要以版本化迁移升级本地状态协议。
- 当前复习项目按固定次日到期生成，尚未实现答对移出和重新排期逻辑。
- 下一阶段先完成错误关联升级和 Starter checkpoint，再以检查点错误作为 `/review`、`/mistakes` 闭环的真实输入。
