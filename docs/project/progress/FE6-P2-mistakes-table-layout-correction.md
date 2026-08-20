# FE6-P2 错题页表格排版校准记录

| 项目 | 结果 |
|---|---|
| 所属阶段 | FE6 生词课程、检查点与复习闭环 |
| 类型 | 阶段后 UI 校准 |
| 状态 | 已完成 |
| 完成日期 | 2026-08-20 |
| 关联归档 | [FE6-03 复习页、错题页与状态闭环](FE6-03-review-and-mistake-loop.md) |

## 1. 调整原因

原错题记录使用自定义响应式 grid。虽然能够展示 prompt、correction、来源和日期，但列关系不够稳定，不利于连续扫描和比较多条错题。

## 2. 实现结果

- 通过当前 Base UI / Tailwind v4 项目配置安装官方 shadcn `Table`。
- 使用 `TableHeader`、`TableBody`、`TableRow`、`TableHead`、`TableCell` 和无障碍 `TableCaption` 组合错题记录。
- 建立 Status、Prompt、Correction、Source、Date 五列，并使用固定表格布局稳定列宽。
- Prompt 和 Correction 单元格允许自然换行；Correction 保留语音导视风格的焦点竖线。
- 小视口的最小表宽由 Table 自带容器局部横向滚动承接，不扩大页面宽度。
- 状态和来源筛选 hook、空状态与复习逻辑保持不变。

## 3. 验证

| 检查 | 结果 |
|---|---|
| `bunx tsc --noEmit` | 通过 |
| `bun run lint` | 通过，无 warning |
| `git diff --check` | 通过 |
| 浏览器表格语义 | caption、columnheader、row、cell 均可识别 |
| 浏览器现有数据 | 7 条错题正常渲染，长文本换行和五列对齐正常 |
| 来源筛选 | First Words 筛选后为表头加 2 条数据行 |
| 状态筛选 | Resolved 无数据时正确显示 Empty |

## 4. 素材与版权

本次只调整 UI 结构，没有新增或复制教材 OCR、图片、音频及其他版权素材。
