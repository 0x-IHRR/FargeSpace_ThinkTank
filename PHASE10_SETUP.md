# FargeSpace Think Tank Phase 10 QA

版本：V1  
日期：2026-04-09  
状态：In Progress（T1001-T1005 Completed）

关联文件：
- [TODO.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/TODO.md)
- [scripts/verify_phase10_pages.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase10_pages.mjs)
- [scripts/verify_phase10_roles.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase10_roles.mjs)
- [scripts/verify_phase10_publish_visibility.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase10_publish_visibility.mjs)
- [scripts/verify_phase10_media_mix.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase10_media_mix.mjs)
- [scripts/verify_phase10_mobile.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase10_mobile.mjs)

## 1. Phase 10 目标

Phase 10 聚焦可交付验证，不再扩展新功能。

## 2. 本阶段已完成

### 2.1 T1001 页面级检查

已落地页面检查脚本，覆盖以下页面：

1. 首页 `/`
2. 主题页 `/topics/agents`
3. 合集页 `/collections/agentic-ai-watch`
4. 搜索页 `/search`
5. 内容包详情页 `/packages/openai-agent-builder-guide-digest`
6. 登录页 `/login`

检查点包含：

- 未登录访问受保护页面会跳登录页
- 过期会话会跳登录页并附带过期原因
- 登录页关键模块显示正常
- 已登录状态可访问并渲染上述 6 个页面

### 2.2 T1002 角色权限检查

已落地角色权限检查脚本，覆盖以下角色：

1. `admin`
2. `editor`
3. `member`
4. 未登录用户

检查点包含：

- `admin` 可读取 `users`
- `editor` 可创建内容包但不能创建用户
- `member` 可读取可见内容包但不能直接读取原始来源
- 未登录用户不能读取会员内容包

### 2.3 T1003 发布状态检查

已落地发布状态检查脚本，覆盖以下状态：

1. `published`
2. `draft`
3. `scheduled`

检查点包含：

- 会员能看到 `published`
- 会员看不到 `draft`
- 会员看不到 `scheduled`

### 2.4 T1004 媒体组合检查

已落地媒体组合检查脚本，覆盖以下维度：

1. 来源类型：`article`、`video`、`podcast`、`paper`、`website`
2. 加工资产：`brief`、`audio`、`slides`、`video`

检查点包含：

- 上述 5 类来源在内容包中全部出现
- 上述 4 类加工资产在内容包中全部出现
- 输出来源 × 资产的组合矩阵，便于后续回归对比

### 2.5 T1005 移动端检查

已落地移动端检查脚本，覆盖以下范围：

1. 卡片布局
2. 筛选区
3. 详情页阅读流

检查点包含：

- 移动断点下 `.package-grid` 为单列
- 移动断点下 `.search-filter-form` 为单列
- 详情页相关布局在移动断点下保持单列可读
- 详情页来源链接保留断词规则，避免小屏溢出

## 3. 执行方式

执行前先完成构建：

```bash
npm run build
```

执行页面检查：

```bash
node scripts/verify_phase10_pages.mjs
```

执行角色检查：

```bash
node scripts/verify_phase10_roles.mjs
```

执行发布状态检查：

```bash
node scripts/verify_phase10_publish_visibility.mjs
```

执行媒体组合检查：

```bash
node scripts/verify_phase10_media_mix.mjs
```

执行移动端检查：

```bash
node scripts/verify_phase10_mobile.mjs
```

## 4. 下一步

按计划进入：

- T1006 预发环境 smoke test
