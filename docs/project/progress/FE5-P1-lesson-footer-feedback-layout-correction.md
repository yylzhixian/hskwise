# FE5-P1 课程底栏反馈布局校准进度

| 项目 | 结果 |
|---|---|
| 所属阶段 | FE5 对话课程完成后校准 |
| 校准项 | LessonChrome 反馈区与固定底栏 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-20 |
| 关联归档 | [FE5 对话精读与角色练习](FE5-dialogue-close-reading-and-role-practice.md) |

## 1. 问题与结论

- `aria-live="polite"` 反馈区原本独立固定在 footer 上方，会和较长的课程内容形成两层遮挡。
- 反馈现在并入 LessonChrome footer，与 Continue、Try again 或 Return to route 操作共享同一底部区域。
- 课程壳改为 header、可滚动 main、footer 三段式视口布局；header 和 footer 始终可见，main 独立滚动且不会进入 footer 下方。
- 手机端反馈和按钮上下排列，按钮占满可用宽度；`sm` 以上恢复反馈在左、操作在右的紧凑布局。

## 2. 验证

| 检查 | 结果 |
|---|---|
| `bun run lint` | 通过 |
| `bunx tsc --noEmit` | 通过 |
| `bun test` | 33 pass、0 fail、113 assertions |
| 桌面浏览器 | main 与 footer 边界相接，无内容覆盖 |
| 390×844 窄屏 | 反馈完整换行、按钮全宽、最后一个课程控件完整可见 |
