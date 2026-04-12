# FargeSpace Think Tank Phase 15 Staging Acceptance

版本：V1
日期：2026-04-11
状态：Completed with blocker（T1501-T1505 已完成，Directus 文件上传待修复）

## 1. 目标

这一阶段只做一件事：

- 把测试环境从“可以部署”推进到“可以按真实流程验收”

## 2. 完成标准

满足以下条件，Phase 15 才算完成：

1. 测试环境变量口径统一，Vercel 与 Railway 不再混用本地变量名
2. 前台线上地址可以正常打开主要页面
3. 会员账号可以登录并访问受保护页面
4. Directus 后台可以上传、编辑、发布内容
5. 发布后的内容可以在前台被看到
6. 验收问题能记录到清单，能区分必须修和可后置

## 3. 当前环境口径

当前测试环境先采用：

1. 前台：Vercel
2. 后台：Railway Directus
3. 数据库：Railway PostgreSQL
4. 文件：Railway Volume，本阶段先不强制接 S3
5. 密码重置：先人工处理，不强制 SMTP

## 4. 原子任务

### T1501 统一测试环境变量清单

输出：

1. `.env.staging.example` 使用 Vercel 与 Railway 实际需要的变量名
2. 本地 `docker-compose.yml` 与 `.env.example` 的 `PUBLIC_URL` 命名一致
3. 提供测试环境变量清单检查脚本

当前状态：已完成

当前结果：

1. `.env.staging.example` 已拆成 Vercel frontend、Railway Directus、Railway PostgreSQL、Railway Volume 四组
2. Railway Directus 改用 `KEY`、`SECRET`、`ADMIN_EMAIL`、`DB_HOST` 等 Directus 实际读取的变量名
3. Railway Volume 当前固定为 `STORAGE_LOCAL_ROOT=/directus/uploads`
4. SMTP 改成可选项，保留人工重置密码口径
5. 新增 `scripts/verify_phase15_env.mjs` 校验测试环境变量模板

### T1502 做线上前台页面验收

输出：

1. 首页可打开
2. 登录页可打开
3. 搜索页、主题页、合集页、详情页可打开
4. 桌面端与移动端没有明显横向溢出

依赖：T1501

当前状态：已完成

当前结果：

1. 验收地址：`https://farge-space-think-tank.vercel.app`
2. 桌面端视口：`1280x900`
3. 移动端视口：`390x844`
4. `/login` 可直接打开，显示会员登录页
5. `/`、`/search`、`/topics/agents`、`/collections/agentic-ai-watch`、`/packages/openai-agent-builder-guide-digest` 在未登录状态下会跳到 `/login`，并保留正确的 `next` 返回路径
6. 桌面端未发现横向溢出
7. 移动端未发现横向溢出
8. 未发现 `Application error`、`404`、`500` 错误页

说明：

- 当前首页、搜索页、主题页、合集页、详情页都是会员区页面，未登录时跳转登录页属于预期行为
- 真正登录后的会员访问验收放到 `T1503`

### T1503 做真实会员登录验收

输出：

1. 有效会员可以登录
2. 无效会员不能进入会员区
3. 退出登录后不能继续访问受保护页面

依赖：T1501、T1502

当前状态：已完成

当前结果：

1. 使用 Vercel 生产环境变量连接当前线上 Directus
2. 临时创建 1 个有效会员账号和 1 个缺少会员层级的无效会员账号
3. 有效会员可以从 `/login?next=/search` 登录，并进入 `/search`
4. 登录成功后页面显示会员身份状态和“退出登录”
5. 缺少会员层级的无效会员会被拦截，并显示“当前账号还没有有效会员层级”
6. 退出登录后会回到 `/login?status=signed_out`
7. 退出登录后再次访问 `/search` 会跳回 `/login?next=/search`
8. 验收过程中未发现横向溢出或应用错误页
9. 验收结束后，两个临时测试账号已从 Directus 删除

说明：

- 本次没有把测试账号邮箱、密码或 Directus token 写入仓库
- 本次只验证会员登录与前台路由保护，不验证后台内容发布链路；后台发布链路放到 `T1504`

### T1504 做后台发布到前台展示链路验收

输出：

1. Directus 后台可以创建或编辑一个测试内容包
2. 测试内容包可以发布
3. 前台列表页与详情页可以看到该内容包

依赖：T1501、T1502、T1503

当前状态：已完成

当前结果：

1. 使用 Vercel 生产环境变量连接当前线上 Directus
2. 临时创建 1 个有效会员账号、1 个来源、1 个内容包、1 个摘要资产，以及主题/合集/来源关联
3. 内容包先以 `draft` 创建，再更新为 `published`
4. 前台 `/search?q=T1504` 可以看到该测试内容包
5. 前台 `/packages/<测试内容包 slug>` 可以打开详情页
6. 详情页可以看到标题、摘要内容和来源平台信息
7. 验收过程中未发现横向溢出或应用错误页
8. 验收结束后，测试会员账号、测试内容包和测试来源均已清理

同时发现并已修复：

1. 问题：登录后打开搜索页正常，但继续打开详情页会被误判为会话过期
2. 原因：页面渲染时每次都会消耗 Directus refresh token，第二个会员页面拿到的是已失效 token
3. 处理：前台改为信任仍有效的会员会话 cookie，不再每次页面渲染都消耗 refresh token
4. 提交：`37e5653 fix: preserve member session across pages`

仍需后续处理：

1. Directus 文件上传接口当前返回 `500 INTERNAL_SERVER_ERROR`
2. 内容包发布与前台展示链路不依赖文件上传，所以本次内容链路已通过
3. 文件上传问题需要进入 `T1505` 的必须修复问题清单

### T1505 记录测试环境问题清单

输出：

1. 必须修复问题
2. 可后置优化问题
3. 已验证通过项目

依赖：T1502-T1504

当前状态：已完成

已验证通过：

1. 测试环境变量清单已统一，Vercel frontend、Railway Directus、Railway PostgreSQL、Railway Volume 的变量边界已拆开
2. 前台线上地址 `https://farge-space-think-tank.vercel.app` 可访问
3. 未登录访问会员区页面会跳转到 `/login`，并保留正确的 `next` 返回路径
4. 桌面端 `1280x900` 与移动端 `390x844` 未发现横向溢出或应用错误页
5. 有效会员可以登录并进入会员区
6. 缺少会员层级的无效会员会被拦截
7. 退出登录后不能继续访问受保护页面
8. 后台创建并发布的测试内容包可以在前台搜索页和详情页看到
9. T1503 与 T1504 创建的临时会员账号、测试内容包和测试来源均已清理
10. 会员页连续访问时会话被误判过期的问题已修复并部署，提交为 `37e5653 fix: preserve member session across pages`

必须修复问题：

1. Directus `/files` 上传接口当前返回 `500 INTERNAL_SERVER_ERROR`
2. 影响范围：后台不能稳定上传封面、音频、视频、PPT、PDF 等文件；只使用文字摘要和外部链接的内容包发布链路仍可用
3. 已定位原因：Directus `/server/health` 返回 `storage:local:responseTime` 错误，具体为 `EACCES`，路径是 `/directus/uploads/directus-health-file`
4. 建议处理：Railway Directus 服务补 `RAILWAY_RUN_UID=0`，确认 `STORAGE_LOCATIONS=local`、`STORAGE_LOCAL_DRIVER=local`、`STORAGE_LOCAL_ROOT=/directus/uploads`，以及 Railway Volume 挂载到 `/directus/uploads`
5. 修复后需要重新跑一次 `/files` 上传探测，再验证后台上传文件后前台资产入口是否可见

可后置优化问题：

1. 密码重置邮件继续后置，当前按“请联系管理员重置密码”处理
2. S3 或对象存储迁移继续后置，当前优先修通 Railway Volume
3. 更细的 UI 精修和动效调整可在文件上传问题修复后继续
4. 更完整的 QA 用例可以在测试环境文件上传链路修复后再扩展
