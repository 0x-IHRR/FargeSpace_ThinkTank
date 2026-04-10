# FargeSpace Think Tank Phase 13 Member Auth

版本：V1
日期：2026-04-09
状态：In Progress（T1301-T1304 已完成）

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

- 当前状态：已完成

#### 结构选择

| 方案 | 做法 | 优点 | 缺点 |
|---|---|---|---|
| A | 直接使用 `directus_users`，只补最少自定义字段 | 结构最简单，和 Directus 登录天然一致 | 自定义会员字段要加在系统用户表上 |
| B | 另建 `member_profiles`，再和 `directus_users` 关联 | 扩展性更强 | 当前阶段字段太少，成本偏高 |

#### 推荐方案

选择：

- `A：直接使用 directus_users，补最少自定义字段`

原因：

1. 当前正式会员登录的核心只需要账号、角色、层级、状态
2. Directus 登录本来就是基于 `directus_users`
3. 先不拆双表，后面实现登录、会话、权限会更直接
4. 如果以后会员资料变复杂，再拆 `member_profiles` 也来得及

#### 冻结后的最小账号字段

| 字段 | 来源 | 用途 | 备注 |
|---|---|---|---|
| `id` | `directus_users.id` | 前台会话主键 | 必填 |
| `email` | `directus_users.email` | 登录账号 | 必填，唯一 |
| `role` | `directus_users.role` | 判断 `member` / `editor` / `admin` | 必填 |
| `status` | `directus_users.status` | 判断账号是否可登录 | 必填，必须是 `active` |
| `first_name` | `directus_users.first_name` | 显示名组成部分 | 可空 |
| `last_name` | `directus_users.last_name` | 显示名组成部分 | 可空 |
| `member_tier_id` | `directus_users` 自定义字段 | 会员层级关联 | `T1303` 新增 |
| `member_profile_status` | `directus_users` 自定义字段 | 前台会员资格状态 | `T1303` 新增 |

#### 冻结后的字段解释

显示名口径：

1. 优先 `first_name + last_name`
2. 如果姓名为空，回退到邮箱前缀

会员层级口径：

1. 真实来源固定为 `member_tiers`
2. 前台会话里继续保留 `activeMemberTierCode`
3. 该值从 `member_tier_id -> member_tiers.code` 映射得到

账号状态口径：

1. `directus_users.status` 负责判断账号是否可登录
2. `member_profile_status` 负责判断会员资格是否有效

推荐枚举：

- `member_profile_status = active / paused / expired`

放行条件：

1. `directus_users.status = active`
2. 角色属于 `member / editor / admin`
3. `member_profile_status = active`
4. `member_tier_id` 已绑定有效层级

#### 前台真正需要读取的字段

前台会话只保留这些值：

1. `userId`
2. `role`
3. `displayName`
4. `activeMemberTierCode`
5. `sessionExpiry`

前台不直接保留：

1. 邮箱
2. 后台原始 role 记录全文
3. 后台原始用户对象
4. 后台 refresh token 明文

#### 对 T1303 的直接要求

下一步必须补的后台字段是：

1. `directus_users.member_tier_id`
2. `directus_users.member_profile_status`

当前不新增：

1. `member_profiles`
2. 单独的会员资料表
3. 单独的前台账号表

### T1303 配置后台会员账号结构

- 当前状态：已完成

#### 当前已完成的后台账号结构

已写入 `directus_users` 的自定义字段：

1. `member_tier_id`
2. `member_profile_status`

已建立的真实关系：

1. `directus_users.member_tier_id -> member_tiers`

已补好的后台管理入口：

1. `有效会员`
2. `待补层级`
3. `已停用会员`

#### 当前固定的后台管理口径

有效会员：

1. 角色是 `Member`
2. `status = active`
3. `member_profile_status = active`
4. 已绑定 `member_tier_id`

待补层级：

1. 角色是 `Member`
2. `member_tier_id` 为空

已停用会员：

1. 角色是 `Member`
2. 账号状态不是 `active`，或会员资格不是 `active`

#### 当前结果

到这一步为止，后台已经能把“可登录账号”和“有效会员账号”分开管理。

后续真实登录时：

1. 可以直接从账号读取会员层级
2. 可以直接挡住没有层级或资格失效的账号

### T1304 实现真实登录动作

- 当前状态：已完成

#### 当前已完成的登录动作

1. 前台 `/login` 不再接受任意邮箱密码直接通过
2. 前台表单现在会真实调用 Directus 邮箱密码认证
3. 登录成功后写入真实会员会话
4. 登录成功时会同时保存服务端可读的 refresh token

#### 当前已完成的失败提示

前台已能区分这些失败情况：

1. 缺少邮箱或密码
2. 邮箱或密码错误
3. 账号状态不可用
4. 会员资格不可用
5. 当前账号没有前台访问权限
6. 后台资料不完整
7. 后台认证暂时不可用

#### 当前结果

到这一步为止：

1. 只有真实后台账号可以登录
2. 错误密码会被明确拦下
3. 登录页文案已经从“前台验收入口”改成“真实账号认证入口”

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

## 7. 当前已冻结的会员账号结构

- 账号基础表：`directus_users`
- 会员层级来源：`member_tiers`
- 前台显示名：姓名优先，邮箱前缀兜底
- 会员资格状态：`member_profile_status`
- 当前不拆独立 `member_profiles`

## 8. 当前可执行脚本

应用后台会员账号结构：

```bash
node scripts/apply_phase13_account_structure.mjs
```

验证后台会员账号结构：

```bash
node scripts/verify_phase13_account_structure.mjs
```

## 9. 当前已完成的登录基础

- 真实登录入口：[/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/login/page.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/login/page.tsx)
- 真实登录动作：[/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/session-actions.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/session-actions.ts)
- Directus 认证封装：[/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/lib/directus-member-auth.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/lib/directus-member-auth.ts)
- 会话常量：[/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/lib/session.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/lib/session.ts)
