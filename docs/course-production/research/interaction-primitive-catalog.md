# 交互原语目录

CP0 将现有 26 个课程专用 step 和 OCR 高频学习动作归并为 14 个稳定原语。原语使用教学动作命名，不暴露组件名、CSS 或运行时 action。

## 1. 最终目录

| ID | 学习动作 | stimulus / resource | 判定 | 默认完成 | 当前能力 |
|---|---|---|---|---|---|
| `content-explore/v1` | 观察、解释、总结 | text、lexeme、grammar、scene | 无 | 主动继续或完成必要展开 | 已有多个专用版本，待统一 |
| `audio-explore/v1` | 逐条听、对比听、精听 | audio、dialogue lines、phonemes | 无 | 必需音频全部播放 | 已有对话探索和 pitch guide |
| `single-choice/v1` | 从有限选项选择 | text、image、audio、passage | 确定答案 | 按 policy 正确或提交 | 已有三套实现，待统一 |
| `matching/v1` | 配对词义、图片、搭配 | pairs + optional stimulus | 确定答案 | 全部匹配 | 未实现 |
| `ordering/v1` | 排列词块、句子、对话 | ordered items | 确定答案 | 顺序正确 | 已有两套实现，待统一 |
| `cloze/v1` | 选择、拖放或输入补全 | text with slots | 确定/多答案 | 所有空完成 | 只有选择式句中应用 |
| `short-input/v1` | 输入拼音、汉字或短答 | text、audio、image | 确定/人工 | 判定或自评 | 未实现 |
| `active-recall/v1` | 先回忆再揭示 | cue + answer resource | 自评 | 揭示并选择掌握状态 | 已实现 |
| `speech-repeat/v1` | 跟读、录音、回听 | reference audio + text | 自评 | 完成录音与回听 | 已实现基础版本 |
| `role-play/v1` | 选择角色并完成多轮对话 | dialogue + roles | 自评 | 用户回合全部完成 | 已实现 |
| `free-response/v1` | 复述、口语或写作 | prompt + rubric | 人工/自评 | 提交并完成 rubric | 未实现 |
| `pronunciation-explore/v1` | 观察发音部位或声调路径 | phoneme、tone contour、audio | 无 | 完成观察和示范 | 已有声调路径，发音部位未实现 |
| `syllable-builder/v1` | 组合声母、韵母和声调 | phoneme refs + combination rules | 确定答案 | 合法组合完成 | 未实现 |
| `character-writing/v1` | 观察笔顺并逐笔练习 | character + local stroke data | 有限轨迹判定 | 完成指定 Hanzi Writer 模式 | 依赖已安装，组件未实现 |

## 2. 不单独建原语的变体

| 教材任务 | 归并方式 |
|---|---|
| 判断对错 | `single-choice/v1` + `presentation: binary` |
| 听音选择 | audio stimulus + `single-choice/v1` |
| 看图选择 | image stimulus + `single-choice/v1` |
| 声音近音对比 | `audio-explore/v1` + `mode: contrast` |
| 拼音听写和标调 | `short-input/v1` + pinyin normalizer |
| 看图说话 | image stimulus + `free-response/v1` |
| lesson check | 多个标准 activity 组成 section，不在一个 step 内嵌题库 |
| intro / focus / summary | `content-explore/v1` + 受控 purpose |

## 3. v1 的 26 个 kind 映射

| v1 协议 | 当前 kind | v2 原语或编排方式 |
|---|---|---|
| `pinyinLesson/v1` | `tone-overview` | `pronunciation-explore/v1` |
| `pinyinLesson/v1` | `pitch-guide` | `pronunciation-explore/v1` + audio resource |
| `pinyinLesson/v1` | `pronunciation-practice` | `speech-repeat/v1` |
| `pinyinLesson/v1` | `tone-choice` | `single-choice/v1` |
| `pinyinLesson/v1` | `tone-listening-choice` | `single-choice/v1` + audio stimulus |
| `pinyinLesson/v1` | `lesson-check` | 多个标准 activity 组成的 section |
| `pinyinLesson/v1` | `lesson-summary` | `content-explore/v1` + `purpose: summary` |
| `dialogueLesson/v1` | `scene-intro` | `content-explore/v1` + scene resource |
| `dialogueLesson/v1` | `dialogue-explore` | `audio-explore/v1` + dialogue resource |
| `dialogueLesson/v1` | `comprehension-choice` | `single-choice/v1` |
| `dialogueLesson/v1` | `line-order` | `ordering/v1` |
| `dialogueLesson/v1` | `role-practice` | `role-play/v1` |
| `dialogueLesson/v1` | `dialogue-summary` | `content-explore/v1` + `purpose: summary` |
| `vocabularyLesson/v1` | `context-discovery` | `content-explore/v1` + dialogue resource |
| `vocabularyLesson/v1` | `word-focus` | `content-explore/v1` + lexeme/audio resource |
| `vocabularyLesson/v1` | `meaning-choice` | `single-choice/v1` |
| `vocabularyLesson/v1` | `listening-choice` | `single-choice/v1` + audio stimulus |
| `vocabularyLesson/v1` | `active-recall` | `active-recall/v1` |
| `vocabularyLesson/v1` | `sentence-application` | `cloze/v1` |
| `vocabularyLesson/v1` | `vocabulary-summary` | `content-explore/v1` + `purpose: summary` |
| `checkpoint/v1` | `checkpoint-intro` | `content-explore/v1` + `purpose: intro` |
| `checkpoint/v1` | `meaning-choice` | `single-choice/v1` |
| `checkpoint/v1` | `dialogue-choice` | `single-choice/v1` + dialogue stimulus |
| `checkpoint/v1` | `listening-choice` | `single-choice/v1` + audio stimulus |
| `checkpoint/v1` | `line-order` | `ordering/v1` |
| `checkpoint/v1` | `checkpoint-summary` | `content-explore/v1` + `purpose: summary` |

映射只定义迁移目标，不要求 CP1 立即实现全部 renderer。`lesson-check` 是唯一被拆成多个 activity 的复合 kind，其余 kind 都有单一主要原语。

## 4. 公共 activity contract

每个 activity 至少包含：

- `id`：课程内稳定 step ID。
- `type`：带版本的原语 ID。
- `knowledgeIds`：本活动练习或检查的知识点。
- `prompt`：只有学习动作需要时才出现。
- `stimulus` 或资源引用：不复制资源正文。
- `feedback`：只保存有教学价值的正文；UI 标题由 renderer 默认提供。
- `policy` override：仅覆盖允许重试、反馈时机等受控行为。

renderer contract 统一返回语义结果：

- `submit({ answer, isCorrect })`
- `completeMedia({ mediaIds })`
- `completeSelfAssessment({ result })`
- `recordOutput({ artifact })`

JSON 不保存这些函数，也不保存 interaction ID。compiler 从 lesson ID 和 activity ID 派生运行时标识。

## 5. 完成与错误语义

- 确定答案 activity 可以要求正确后继续，也可以由 assessment policy 允许一次提交。
- 自评 activity 使用 `isCorrect: null` 表示信息性结果，不伪装成答错。
- 自由表达不因录音时长、字符数或输入存在就声明能力达标。
- 错题记录必须关联 lesson、activity 和 knowledge ID。
- 同一原语在课程、练习和检查点中的差异由 policy 表达，不复制 renderer。
