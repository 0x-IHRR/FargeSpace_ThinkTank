# FargeSpace Think Tank Phase 15 Staging Acceptance

版本：V1
日期：2026-04-11
状态：In Progress（T1501 已完成）

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

当前状态：未开始

### T1503 做真实会员登录验收

输出：

1. 有效会员可以登录
2. 无效会员不能进入会员区
3. 退出登录后不能继续访问受保护页面

依赖：T1501、T1502

当前状态：未开始

### T1504 做后台发布到前台展示链路验收

输出：

1. Directus 后台可以创建或编辑一个测试内容包
2. 测试内容包可以发布
3. 前台列表页与详情页可以看到该内容包

依赖：T1501、T1502、T1503

当前状态：未开始

### T1505 记录测试环境问题清单

输出：

1. 必须修复问题
2. 可后置优化问题
3. 已验证通过项目

依赖：T1502-T1504

当前状态：未开始

