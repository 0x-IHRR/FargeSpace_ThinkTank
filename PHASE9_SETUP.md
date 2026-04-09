# FargeSpace Think Tank Phase 9 Login & Session

版本：V1  
日期：2026-04-09  
状态：Frozen（T901-T904 Completed）

关联文件：
- [TODO.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/TODO.md)
- [app/login/page.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/login/page.tsx)
- [app/layout.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/layout.tsx)
- [lib/login-entry.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/lib/login-entry.ts)
- [FRONTEND_LOGIN.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/FRONTEND_LOGIN.md)
- [SESSION_CONTRACT.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/SESSION_CONTRACT.md)
- [lib/session.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/lib/session.ts)
- [middleware.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/middleware.ts)
- [app/session-actions.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/session-actions.ts)

## 1. Phase 9 目标

Phase 9 要完成两类事情：

- 先冻结登录与入口口径
- 再接入会话、鉴权、路由保护与过期处理

## 2. 本阶段已完成

### 2.1 T901 冻结登录入口方案

已冻结并统一为以下规则：

1. 会员登录入口固定为前台 `/login`
2. 后台登录入口固定为 `Directus Admin /admin/login`
3. 前台共享壳与登录页使用同一入口生成逻辑，避免地址分叉
4. `NEXT_PUBLIC_DIRECTUS_URL` 为空时，后台入口默认回退 `http://localhost:8055/admin/login`

### 2.2 T902 冻结会话对象

会话对象已冻结为固定字段：

1. `userId`
2. `role`
3. `displayName`
4. `activeMemberTierCode`
5. `sessionExpiry`

会话状态已冻结为三态：

1. `anonymous`
2. `authenticated`
3. `expired`

已形成独立标准文档并落地基础解析逻辑，用于后续 T903/T904 复用。

### 2.3 T903 路由保护

已冻结并上线规则：

1. 受保护页面：`/`、`/search`、`/topics/*`、`/collections/*`、`/packages/*`
2. 未登录访问受保护页面时，自动跳转 `/login`
3. 跳转时保留 `next` 参数，登录后可回原页面
4. 若会话已过期，附带 `reason=expired` 提示登录页展示

前台顶部状态区已改为读取会话 cookie，而不是固定显示访客文案。

### 2.4 T904 登出与会话过期处理

已落地并统一规则：

1. 登录成功后写入 `httpOnly` 会话 cookie，默认 8 小时
2. 勾选“记住登录状态”后，会话时长延长到 30 天
3. 登录状态下顶部展示“退出登录”，点击后立即清理 cookie 并返回登录页
4. 会话过期后访问受保护页面，会自动清理 cookie 并跳转登录页，提示“会话已过期”
5. 登录页支持 `next` 回跳地址，登录后返回原访问页面

## 3. 当前边界

Phase 9 已完成，当前不再遗留登录与会话边界问题。

## 4. 下一步

按计划进入：

- Phase 10 测试与上线准备
