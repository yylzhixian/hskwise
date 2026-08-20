# 源码结构

当前源码按“路由、页面、公共能力、领域运行时”组织，不再使用统一的 `features/` 容器。`app/` 只定义 Next.js 路由，不承载页面实现。

```text
src/
  app/                    纯 Next.js 路由、布局、边界和 Route Handler
  views/
    home/                 首页实现及其私有 components、hooks
    learning/             路线页面实现及其私有 components、hooks
    lesson/               沉浸课程页面实现及其私有能力
  components/
    learning-shell/       跨页面学习外壳
    lesson/               跨课程复用的课程框架
    ui/                   无业务语义的基础 UI
  hooks/
    learning/             跨 views/课程使用的学习状态 hooks
    lesson/               跨课程类型使用的单课运行时 hooks
  store/
    learning/             全局 Jotai 学习状态与本地持久化
  courses/
    pinyin/               拼音课程协议、内容和专用组件
    lesson-registry.ts    已发布课程注册表
  learning/
    routes/               路线数据与纯计算
    runtime/              单课会话 atoms、状态机和隔离 store
  db/                     数据库 schema 与连接
  lib/                    通用基础设施
  types/                  跨领域共享的全局类型
```

测试代码统一放在仓库根目录的 `tests/`，不进入 `src/`：

```text
tests/
  fixtures/               仅测试可见的课程样本
  unit/                   路线、状态、运行时和课程协议测试
```

## 放置规则

- `app/` 只保留 `page.tsx`、`layout.tsx`、`loading.tsx`、`error.tsx`、`not-found.tsx` 和 Route Handler 等路由定义；不放组件、hooks 或页面实现。
- 页面实现及只服务该页面的组件、hooks 和辅助逻辑聚合在 `views/{page}/`；数量较多时使用其内部 `components/`、`hooks/` 子目录。
- 只有跨页面或跨课程复用的组件才放在 `components/`，公共 hooks 才放在 `hooks/`。
- 跨页面全局状态放在 `store/`；局部领域状态机可保留在对应领域目录。
- 只服务某个 store 的水合、持久化等实现 Hook 放在 `store/{domain}/hooks/`，不暴露为公共 Hook。
- 课程类型专属的 schema、内容、组件和 hooks 放在 `courses/{type}/`。
- 通用工具函数放在 `lib/`，跨领域全局类型放在 `types/`。
- 页面依赖方向保持为 `app -> views -> hooks/components -> store/runtime`，底层模块不反向依赖页面。
- 测试 fixture 不通过查询参数注入正式页面；测试直接构造 state 或 store。
- 新代码不要重新建立笼统的 `features/` 目录，也不要为单个文件增加一层目录。
