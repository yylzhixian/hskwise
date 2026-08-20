# FE5 对话精读与角色练习开发进度

| 项目 | 结果 |
|---|---|
| 所属阶段 | FE5 对话精读与跟读课程 |
| 状态 | 已完成；真人音频保留为发布门禁 |
| 完成日期 | 2026-08-20 |
| 上一归档 | [FE4-04 听辨与拼音课程验收](FE4-04-listening-and-pinyin-course-acceptance.md) |
| 下一项 | FE6 生词、检查点与复习闭环 |

## 1. 本次结论

`/lessons/first-greeting` 已形成“场景导入 -> 对话精读 -> 内容理解 -> 句序重组 -> 角色练习 -> 总结”的完整对话课程。用户可以逐句选择并按需揭示拼音、翻译和词语解释，随后完成理解与排序练习，选择一方角色试听台词并录制整段对话。

课程完成后会点亮路线第二节点、解锁 `first-words`，理解和排序错误会继续使用共享 mistake / review 状态记录。首课正文、翻译、题目和知识点均为项目原创，未复制 `docs/textbooks` 的文字或素材。

## 2. 课程协议与内容

- 新增 `dialogueLesson/v1`，描述两名角色、三至八句对话、分词、拼音、翻译、音频和知识点引用。
- 协议包含 `scene-intro`、`dialogue-explore`、`comprehension-choice`、`line-order`、`role-practice` 和 `dialogue-summary` 六类语义步骤。
- Schema 校验角色、台词、答案、排序和知识点之间的引用，确保理解题只有一个正确答案，排序项与目标顺序完全一致。
- 对话专用协议投影到共享 Lesson Runtime；运行时只负责步骤推进、反馈和完成规则，不理解对话内部状态。
- 新增未发布的 `asking-name-sample`，以不同角色、句长和题目结构验证组件不依赖首课特例。

## 3. 交互与复用边界

- 精读使用对话行语义组件和双角色轨道，不把台词退化为通用卡片数组。
- 选中台词后再揭示拼音和翻译，词语解释由用户主动点开，避免汉字、拼音、译文同时铺满页面。
- 内容理解与句序重组均复用共享课程提交、反馈和错误回流能力；句序交互使用独立排序 hook。
- 角色练习明确区分当前角色、练习句和播放句，逐句试听与整段录音各自拥有独立状态。
- 拼音课原有音频与录音状态机已提取到 `src/hooks/media`，对话课直接复用，没有复制媒体状态逻辑。
- 课程特有 schema、内容、组件和 hooks 聚合在 `src/courses/dialogue`；共享媒体协议位于 `src/lib/media`。

## 4. 素材与版权

- 四段对话音频由本地中文 TTS 生成，仅用于 Frontend Alpha 占位。
- 音频数据、MP3 metadata 和[占位素材清单](/Users/yanglong/Documents/YL/hskwise/public/audio/placeholders/dialogue/first-greeting/README.md)均标记 `placeholder` 和 `mustReplaceBeforePublish`。
- 当前音频不得作为正式发布素材；公开发布前必须替换为项目原创录制或具有明确授权记录的真人普通话音频。
- `docs/textbooks` 只作为教学方法参考，本阶段没有从中复制文字、图片、音频或练习素材。

## 5. 验证

| 检查 | 结果 |
|---|---|
| `bun run lint` | 通过 |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 33 pass、0 fail、113 assertions |
| 第二内容 fixture | schema、运行时投影和六类组件静态渲染通过 |
| 浏览器精读 | 逐句选择、渐进揭示、点词解释和音频播放通过 |
| 浏览器练习 | 理解题错误重试、句序错误重试和正确推进通过 |
| 浏览器角色练习 | 角色切换、逐句试听、真实录制、停止和本地回放通过 |
| 浏览器课程闭环 | 完成后返回 `/learn`，第二节点完成并解锁第三节点 |

## 6. 已知限制与下一步

- 当前语音仍是 TTS 占位；真人录音、录音授权和语言质量审核继续作为公开发布前硬门禁。
- 本轮浏览器闭环在桌面 Chromium 完成；Safari、真实手机和移动设备麦克风兼容性放入 FE7。
- 当前角色练习只验证录制和自听，不包含 ASR、声学评分或服务端保存，这些均不在 Frontend Alpha 范围。
- 下一步进入 FE6：从本课原创对话引用生词，完成生词课程、混合检查点以及 `/review`、`/mistakes` 闭环。
