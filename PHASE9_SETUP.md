# FargeSpace Think Tank Phase 9 Login & Session

版本：V1  
日期：2026-04-09  
状态：In Progress（T901 Completed）

关联文件：
- [TODO.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/TODO.md)
- [app/login/page.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/login/page.tsx)
- [app/layout.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/layout.tsx)
- [lib/login-entry.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/lib/login-entry.ts)
- [FRONTEND_LOGIN.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/FRONTEND_LOGIN.md)

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

## 3. 当前边界

T901 只冻结入口规则，不包含以下内容：

- 用户会话对象写入/读取
- 受保护路由重定向
- 登出逻辑
- 过期处理

以上内容将进入：

- T902、T903、T904

## 4. 下一步

按计划进入：

- T902 冻结会话对象
