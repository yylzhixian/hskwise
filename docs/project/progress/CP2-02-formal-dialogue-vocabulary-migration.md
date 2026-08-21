# CP2-02 正式对话课与词汇课 v2 迁移

| 项目 | 结果 |
|---|---|
| 阶段 | CP2-02 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-21 |
| 对应计划 | [规模化课程生产基础开发计划](../13-course-production-foundation-plan.md) |
| 所属阶段 | CP2：Renderer Registry 与运行时收敛 |
| 下一子阶段 | CP2-03：检查点标准活动迁移与 CP2 收束 |

## 1. 本阶段范围

CP2-02 将已经通过双试点验证的对话课和词汇课正式接入 Starter 路线：

- `first-greeting.v2.json` 从试点 ID 切换为正式课程 ID `first-greeting`。
- `first-words.v2.json` 从试点 ID 切换为正式课程 ID `first-words`。
- 词条 `sourceRef.lessonId` 同步改为正式对话课 ID，跨课程 line/token 引用保持稳定。
- `/lessons/first-greeting` 和 `/lessons/first-words` 原 URL 直接由 v2 registry 渲染。
- 路线 manifest 在页面组合层提供 `routeId` 与 `nodeId`，课程 JSON 继续不保存路线信息。
- 删除两门课程已经被统一领域 Hook 和 renderer 取代的 v1 Experience 文件。

四声课和综合检查点本阶段不迁移。它们的 v1 内容与 schema 仍保留：检查点迁移属于 CP2-03，四声课所需语音原语属于 CP3。

## 2. 正式 Registry

试点 registry 更名为 `lesson-v2-registry.ts`，对外提供 `getLessonV2Definition`。每条定义包含：

- schema 校验后的 lesson。
- compiler 生成的 route-independent runtime definition。
- renderer 可直接消费的 resolved resources。

正式 registry 不保存 route placement。`LessonView` 先查询 v2 registry，再回退到仍在使用的四声课和检查点 v1 registry，因此同一课程 ID 不存在两套页面 switch。

## 3. 路线 Placement 与完成桥

`getLessonPlacement(route, lessonId)` 由路线模型根据 manifest 派生：

```text
Starter route lessonId
  -> { routeId, nodeId }
  -> V2LessonExperience runtime
  -> lesson.completed
  -> completeRouteNodeAtom
```

placement 只在运行时组合时注入。课程 JSON 不包含 `routeId`、`nodeId` 或组件实现字段，保持一门课程可被不同路线复用。

同一 placement 也传给 `useLessonMistakeLink`。正式 v2 课程答错后，错题可以稳定关联 lesson、route node、step、interaction 和 knowledge ID。

## 4. 重复代码收敛

删除：

- `src/courses/dialogue/components/dialogue-lesson-experience.tsx`
- `src/courses/vocabulary/components/vocabulary-lesson-experience.tsx`

两份文件原有的 step switch、提交、反馈、媒体完成和错题写入逻辑，现统一由以下层承担：

- `V2LessonExperience`：provider 与 runtime placement 组合。
- `useLessonActivity`：activity、completion rule、反馈和语义动作。
- `useLessonMistakeLink`：错题稳定关联。
- `LessonActivityRenderer`：activity type 到 renderer 的唯一映射。

对话和词汇的展示、拖放、角色练习、主动回忆等底层组件继续复用，没有复制另一套 UI。

## 5. 兼容边界

- Starter 路线 lesson ID、node ID 和原访问 URL 不变，已有路线进度无需迁移。
- v1 对话/词汇 schema 和 TypeScript 内容暂时保留，供 legacy fixture、schema 回归和当前检查点内容依赖使用；它们不再是正式页面入口。
- 正式 v2 interaction ID 由 `lessonId + activityId` 派生。新错题使用该稳定 ID；已有本地错题仍按原记录继续复习。
- 9 个课程音频仍是 `generated-placeholder`，发布前必须替换为原创或明确授权素材。

## 6. 回归覆盖

新增或调整的验证覆盖：

- v2 compiler 使用正式 lesson ID 生成 interaction ID。
- 正式 registry 返回 `first-greeting` 与 `first-words`，v1 registry 不再发布这两门课。
- 路线模型从正式 lesson ID 派生正确的 route/node placement。
- 原正式 URL 展示 v2 首步，不落入 preview 或旧 Experience。
- 完整词汇课先答错、写入错题、重试答对、完成后返回路线并达到 75% 进度。
- 错题页可看到 v2 activity 的原问题，证明 placement 与错误关联生效。

## 7. 验证结果

| 检查 | 结果 |
|---|---|
| `bun run content:schema:check` | 通过，JSON Schema 未过期 |
| `bun run content:validate` | 通过，2 门正式 v2 课程有效；保留 27 条预期草稿发布阻断 |
| `bunx tsc --noEmit` | 通过 |
| `bun run lint` | 通过 |
| `bun run test` | 通过，75 项测试无失败 |
| `bun run test:e2e` | 通过，3 个视口共 36 项测试无失败 |
| `bun run build` | 由端到端命令执行并通过 |
| `git diff --check` | 通过 |

端到端测试覆盖 `390x844`、`768x1024` 和 `1440x900`。正式课程、学习路线、复习和错题页面均无横向溢出或控制台错误。

## 8. 已知限制与下一步

- 自动化没有请求真实麦克风权限；角色练习继续由共享组件单测、静态 renderer 回归和已有浏览器验证覆盖。
- 检查点仍有独立 Experience 和重复提交 switch。CP2-03 应将其表达为标准 `single-choice/v1` 与 `ordering/v1` activities，并保留 assessment 语义。
- 四声课需要 `pronunciation-explore/v1`、语音 stimulus 和跟读原语，不在 CP2-03 临时塞入通用内容组件；按计划进入 CP3 迁移。
- CP2-03 完成后重新评估 v1 对话/词汇内容和 schema 是否仍被测试或检查点依赖，再执行下一轮安全删除。
