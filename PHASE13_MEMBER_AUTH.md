# FargeSpace Think Tank Phase 13 Member Auth

版本：V1
日期：2026-04-09
状态：In Progress（T1301 已完成）

## 1. 目标

这一阶段只做一件事：

- 把当前演示登录替换成真实会员登录

## 2. 当前问题

当前 `/login` 只用于前台验收：

- 任意邮箱密码都能进入
- 会话是前台本地生成的演示数据
- 没有真正读取后台会员账号
- 没有真实的密码重置流程

## 3. 这一阶段完成后应达到的结果

1. 只有真实会员账号可以登录
2. 前台会话来自真实后台认证
3. 会员层级会影响访问结果
4. 会话过期后必须重新登录
5. 登出和密码重置入口可用
6. 测试环境可以重复配置

## 4. 原子任务

### T1301 冻结登录方案

- 当前状态：已完成

#### 方案对比

| 方案 | 做法 | 优点 | 缺点 |
|---|---|---|---|
| A | 前台直接调用 Directus 登录 | 接线最短 | token 留在浏览器侧，前台和后台边界不清，后续会话收口差 |
| B | 前台继续走 `/login`，由 Next 服务端代为调用 Directus 登录 | 前后台边界清楚，cookie 可控，后续刷新会话和登出更稳 | 需要补一层服务端会话逻辑 |
| C | 另外接独立认证系统，再和 Directus 对接 | 扩展性强 | 成本最高，当前阶段明显过重 |

#### 推荐方案

选择：

- `B：前台继续走 /login，由 Next 服务端代为调用 Directus 登录`

原因：

1. 会员入口不变，前台改动最小
2. 不把 Directus token 直接暴露给浏览器
3. 后续会话过期、登出、密码重置都更容易统一处理
4. 适合当前已经上线的 Vercel + Directus 测试环境

#### 冻结后的登录边界

会员登录入口：

- 固定为前台 `/login`

后台登录入口：

- 固定为 Directus `/admin/login`

认证来源：

- 固定使用 Directus 邮箱密码认证

前台不做的事：

- 不直接保存后台 Static Token
- 不直接把 Directus access token 暴露给浏览器脚本
- 不把后台管理登录和会员登录混成一套

#### 冻结后的会话方案

登录动作：

1. 前台表单提交到 Next 服务端
2. Next 服务端调用 Directus `/auth/login`
3. 登录成功后，Next 服务端写入本站的 `httpOnly` cookie

会话组成：

1. 保留当前会员会话对象，用于前台路由判断
2. 额外保存一份仅服务端可读的 Directus refresh token

会话刷新口径：

1. access token 视为短期凭证
2. 需要调用后台时，由服务端按需使用 refresh token 换新
3. refresh token 无效时，前台会话一并失效并跳回 `/login`

#### 冻结后的实施顺序

1. `T1302` 确认会员账号字段来源
2. `T1303` 把会员层级与账号状态挂到真实账号
3. `T1304` 把演示登录替换成 Directus 真实登录
4. `T1305-T1307` 再补会话、登出和密码重置闭环

### T1302 冻结会员账号字段

- 确认显示名、层级、状态从哪里读
- 确认哪些字段必须给前台使用

### T1303 配置后台会员账号结构

- 把会员层级和账号状态真正挂到账号体系

### T1304 实现真实登录动作

- 把演示登录替换成真实登录

### T1305 实现真实会话写入与读取

- 前台读取真实登录用户
- 处理会话过期

### T1306 接入会员层级校验

- 层级无效或状态异常时不放行

### T1307 完成登出与密码重置入口

- 登录闭环补齐

### T1308 做端到端验证

- 覆盖成功、失败、过期、登出、无权限

### T1309 更新测试环境配置

- 测试环境变量
- 测试账号说明
- 重置密码链接口径

## 5. 完成标准

满足以下条件，这一阶段才算完成：

1. `/login` 不再接受演示登录
2. 真实账号可以进入会员区
3. 错误账号和无权限账号不能进入
4. 会话过期和登出都能正确收口
5. 测试环境可重复验证

## 6. 参考依据

- Directus 认证接口文档：[`/auth/login`、`/auth/refresh`](https://docs.directus.io/reference/authentication)
- Directus SDK 认证说明：支持登录、刷新、登出  
  [AuthenticationClient](https://docs.directus.io/packages/%40directus/sdk/auth/interfaces/AuthenticationClient.html)
- Directus 用户目录说明：只有 `active` 状态用户可正常访问 App / API  
  [User Directory](https://docs.directus.io/user-guide/user-management/user-directory)
- Directus 用户系统字段说明：用户记录默认包含 `status`、`role`、`token` 等字段  
  [Users API](https://docs.directus.io/reference/system/users)
