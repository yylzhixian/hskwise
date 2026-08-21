# OCR 研究、原创内容与素材版权边界

本文是课程生产的工程门禁说明，不替代专业法律意见。

## 1. 允许的 OCR 研究

- 统计栏目、学习动作、步骤顺序和内容密度。
- 把“听音后选择图片”等任务归一化为交互原语。
- 比较不同等级从识别、理解到应用、表达的比例变化。
- 保存来源文件和定位信息，供内部研究复核。

## 2. 禁止进入正式课程的内容

- 教材课文、对话、例句、解释、题目和答案。
- 教材图片、音频、视频、人物设定和专有版式。
- 通过轻微改词、调序或翻译形成的教材衍生表达。
- OCR 图片 URL、出版社资源 URL 或访问凭据。
- 标记为 restricted reference 的任何素材。

## 3. 原创课程要求

- 官方大纲只确定能力、话题、词汇、汉字和语法边界。
- 情境、角色、课文、例句、题目、干扰项、解析和反馈独立创作。
- AI 可以辅助草拟，但不直接接收教材原文，也不能自动发布。
- 每门课程通过语言、教学、答案和版权审核。
- 相似度工具只作风险预警；任何可疑重合都进入人工复核。

## 4. 素材状态

| 状态 | 可以预览 | 可以发布 |
|---|---|---|
| `original` 且审核通过 | 是 | 是 |
| `licensed` 且许可记录完整 | 是 | 是 |
| `generated-placeholder` | 是 | 否 |
| `restricted-reference` | 仅内部 | 否 |
| 来源或许可未知 | 仅内部 | 否 |

发布 catalog 必须拒绝 `placeholder`、`mustReplaceBeforePublish`、`publishable: false` 和未完成 rights review 的资源。

## 5. Hanzi Writer

- `hanzi-writer@3.7.3` 代码使用 MIT License。
- `hanzi-writer-data@2.0.1` 的 package license 指向 `ARPHICPL.TXT`，数据源自 Make Me a Hanzi。
- 构建只抽取正式课程所需字符，但发布产物仍需携带适用的许可证文本和 attribution。
- lesson JSON 只引用 character resource，不复制、修改或内嵌笔画路径。
- 字符数据是生成产物，不能与 HSKWise 原创课程内容混淆标记。

## 6. 目录隔离

```text
docs/textbooks/                    # 受限 OCR 参考，不进入产品构建
docs/course-production/research/  # 只保存归一化研究结论
src/courses/content/              # 原创课程 JSON
generated/hanzi-data/             # 从许可数据包按 catalog 生成
public/...                        # 只包含通过发布门禁的产品素材
```

任何从研究目录到课程目录的人工复制都应在 code review 中视为阻断问题。
