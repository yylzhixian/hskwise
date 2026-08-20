# FE4-03 发音练习与错误回流开发进度

| 项目 | 结果 |
|---|---|
| 所属阶段 | FE4 拼音与声调课程 |
| 子阶段 | FE4-03 发音素材协议、跟读与错误回流 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-20 |
| 上一归档 | [FE4-R1 前端源码结构收敛](FE4-R1-source-structure-simplification.md) |
| 下一项 | FE4-04 听辨扩展、原创真人音频替换与拼音课程验收 |

## 1. 本次结论

`/lessons/four-tones` 已增加“示范音频 -> 录音 -> 回放 -> 完成”的跟读步骤，并把听辨错误写入跨页面 learning store。学习者答错后仍在当前课程即时重试；错误知识点同时进入错题列表和 24 小时后的复习队列，返回 `/learn` 后可看到 `To revisit` 数量变化。

本阶段完成的是可替换素材协议和完整前端交互链路。当前示范音频为明确标记的本地 TTS 占位，并非原创真人普通话发音；发布替换仍是硬性条件。

## 2. 课程协议与素材

- `pinyinLesson/v1` 新增 `pronunciation-practice` 语义步骤。
- 步骤只携带目标文本、参考音频和知识点，不携带 React、CSS 或事件函数。
- 音频元数据包含 `contentOrigin`、`placeholder` 和 `mustReplaceBeforePublish`。
- Schema 会拒绝未同时标记占位和发布前替换的 `generated-placeholder` 音频。
- 新增 `ma-four-tones.mp3`，约 1.95 秒、24 KB，只用于开发期链路验证。
- 素材来源和替换要求见 [占位素材清单](/Users/yanglong/Documents/YL/hskwise/public/audio/placeholders/pinyin/README.md)。

## 3. 跟读交互

- 可播放四声 `mā / má / mǎ / mà` 本地参考音频。
- 支持麦克风请求、开始录制、停止、浏览器内回放和重新录制。
- 录音 Blob 只存在当前组件生命周期，不写入 localStorage。
- 覆盖 `requesting`、`recording`、`recorded`、`denied`、`unsupported` 和 `error` 状态。
- 权限拒绝、不支持、错误或权限请求长期 pending 时均可“Continue without recording”，不会阻塞课程。
- 成功录制或显式降级后才解锁课程 Continue。

## 4. 错误与复习回流

- 听辨错误按 `lessonId + nodeId + knowledgeId` 写入 mistake record。
- 同一知识点重复答错会更新时间和纠正说明，不重复生成未解决错题。
- 每个错误知识点只创建一个 queued review item，首次排期为错误发生 24 小时后。
- 错误即时反馈和 Try again 仍由隔离 lesson store 管理；持久化错题由外层 learning store 管理。
- 路线节点完成动作改为幂等，重复完成课程不会再次写入 Recent progress。

## 5. 验证

| 检查 | 结果 |
|---|---|
| `bun run lint` | 通过 |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 22 pass、0 fail、61 assertions |
| 音频静态资源 | HTTP 200，`audio/mpeg`，时长约 1.95 秒 |
| 浏览器参考音频 | 播放成功，metadata 和 currentTime 正常 |
| 浏览器错误重试 | 错误反馈、Try again、正确后继续通过 |
| 浏览器麦克风降级 | pending 权限可跳过，课程可完成 |
| 浏览器错误回流 | 返回 `/learn` 后 `To revisit` 从 0 变为 1 |

## 6. 版权与发布限制

- 没有读取或复制 `docs/textbooks` 的正文、OCR、图片或音频。
- 当前 TTS 文件是开发占位，不宣称为标准普通话真人示范。
- 课程数据、音频 metadata 和素材清单均标记必须在发布前替换。
- 替换时保持相同音频协议和 URL 注册方式，不需要重写课程组件。

## 7. 已知限制与下一步

- 当前自动化环境完成了权限 pending 降级路径；真实设备上的录制成功、回放音量和 Safari 编码兼容仍需人工验收。
- 当前只有一组四声连续示范，尚未形成三组听辨和五题课末检查。
- `/review` 和 `/mistakes` 独立页面尚未实现，目前只在 `/learn` 显示数量与到期摘要。
- FE4-04 应替换原创真人音频、补听辨与课末检查，并完成手机、Safari 和真实麦克风验收。
