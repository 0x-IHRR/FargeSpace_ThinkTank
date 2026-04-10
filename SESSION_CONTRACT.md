# FargeSpace Think Tank 会话对象标准（T902）

版本：V1  
日期：2026-04-09  
状态：Frozen

## 1. 目标

统一前台会话对象结构，确保后续登录、路由保护、过期处理使用同一标准。

## 2. 会话对象字段（冻结）

字段最小集合：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `userId` | string | 是 | 用户唯一标识 |
| `role` | enum | 是 | `member` / `editor` / `admin` |
| `displayName` | string | 是 | 前台展示名称 |
| `activeMemberTierCode` | string | 是 | 当前会员层级代码（例如 `standard_member`） |
| `sessionExpiry` | string(ISO datetime) | 是 | 会话到期时间（UTC） |

## 3. 状态模型（冻结）

前台统一使用三态：

1. `anonymous`：未登录
2. `authenticated`：已登录且未过期
3. `expired`：会话存在但已过期

## 4. 示例

```json
{
  "userId": "8a0e6f44-71f5-4a75-b7dd-fcb6878b1ba3",
  "role": "member",
  "displayName": "FargeSpace Member",
  "activeMemberTierCode": "standard_member",
  "sessionExpiry": "2026-04-10T08:00:00.000Z"
}
```

## 5. 当前落地

- 会话对象定义与解析：
  - [lib/session.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/lib/session.ts)
- 前台顶部状态文案已接入会话对象标准：
  - [app/layout.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/layout.tsx)
- 登录写入与登出清理会话：
  - [app/session-actions.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/session-actions.ts)
- 服务端 refresh token 读取与当前用户校验：
  - [lib/member-session-server.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/lib/member-session-server.ts)
- 过期会话自动清理与重定向：
  - [middleware.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/middleware.ts)

## 6. 服务端附加凭证

前台会话对象仍然只有上面 5 个字段。

另外存在一份仅服务端可读的附加凭证：

| 名称 | 用途 |
|---|---|
| `fargespace_member_refresh` | 用来向 Directus 换取当前有效会话，并读取真实当前用户 |

## 7. 下一步

进入 Phase 10：

- 执行页面级与权限级测试
