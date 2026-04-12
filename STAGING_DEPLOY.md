# 测试环境部署说明

版本：V1
日期：2026-04-09
状态：Ready（T1309 已补齐）

关联文件：
- [docker-compose.yml](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/docker-compose.yml)
- [.env.example](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/.env.example)
- [.env.staging.example](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/.env.staging.example)
- [PHASE1_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE1_SETUP.md)

## 1. 目标

测试环境当前重点解决三件事：

- 给团队一个可以直接打开验收的前台链接
- 给内容团队一个独立的后台入口用于上传和发布
- 让会员登录、退出登录、重置密码在测试环境可重复验证

## 2. 当前推荐组合

| 层 | 推荐 | 原因 |
|---|---|---|
| 前台 | Vercel Preview | 最快拿到可分享链接，适合验收 UI 与路由 |
| 后台 | 单独托管 Directus | 不和前台混在一起，后续正式环境也能延续 |
| 数据库 | 托管 PostgreSQL | 省去自管数据库维护 |
| 文件存储 | S3 兼容存储 | 后续正式环境不用重换文件体系 |

当前口径：

- 前台测试环境可以先独立上线
- 后台、数据库、文件存储作为第二步接入
- 这样能先看站点效果，再接真实内容链路

## 3. 测试环境分两段

### 3.1 第一段：前台预览

目的：

- 给你一个可访问链接
- 用真实设备看布局、体验和路径

当前前台仍使用演示数据，因此这一步不依赖 Directus。

当前仓库已内置预览脚本：

```bash
npm run deploy:preview
```

返回结果会包含：

- `previewUrl`
- `claimUrl`

### 3.2 第二段：后台联通

目的：

- 打开 Directus Admin
- 开始上传精选资料
- 准备从演示数据切到真实内容

这一步需要：

- Directus 域名
- PostgreSQL 连接
- S3 兼容存储
- 前后台跨域地址

## 4. 前台测试环境变量

Vercel 官方文档说明，环境变量要分别绑定到 Preview、Production 或 Development，不会自动回填到旧部署。

建议至少配置：

| 变量 | Preview 建议值 |
|---|---|
| `DIRECTUS_URL` | Directus 测试环境域名 |
| `DIRECTUS_TOKEN` | Directus Static Token |
| `NEXT_PUBLIC_APP_URL` | `https://farge-space-think-tank.vercel.app` |
| `NEXT_PUBLIC_DIRECTUS_URL` | Directus 测试环境域名 |
| `NEXT_PUBLIC_ASSET_BASE_URL` | `Directus 域名/assets` |

说明：

- `DIRECTUS_TOKEN` 只给服务器端读取，不会显示在浏览器里
- 如果还没准备好后台域名，可以先不填 `NEXT_PUBLIC_DIRECTUS_URL`
- 当前前台已改成：未配置后台域名时，不显示错误的后台地址

## 5. Directus 测试环境变量

Directus 官方文档说明：

- `PUBLIC_URL` 用于后台对外访问地址
- 测试环境当前先使用 Railway Volume
- 后续如果要迁移到 S3，再切换到 S3 兼容存储变量

本项目当前建议按 Railway Directus 服务实际读取的变量名填写：

| 用途 | 建议值 |
|---|---|
| `KEY` | 一串长随机字符串 |
| `SECRET` | 一串长随机字符串 |
| `PUBLIC_URL` | Directus 测试环境域名 |
| `ADMIN_EMAIL` | 后台管理员邮箱 |
| `ADMIN_PASSWORD` | 后台管理员密码 |
| `DB_CLIENT` | `pg` |
| `DB_HOST` | Railway PostgreSQL host |
| `DB_PORT` | `5432` |
| `DB_DATABASE` | Railway PostgreSQL database |
| `DB_USER` | Railway PostgreSQL user |
| `DB_PASSWORD` | Railway PostgreSQL password |
| `CORS_ORIGIN` | 前台预览站域名 |
| `STORAGE_LOCATIONS` | `local` |
| `STORAGE_LOCAL_DRIVER` | `local` |
| `STORAGE_LOCAL_ROOT` | `/directus/uploads` |
| `RAILWAY_RUN_UID` | `0` |
| `PASSWORD_RESET_URL_ALLOW_LIST` | `https://farge-space-think-tank.vercel.app/reset-password` |

说明：

- 当前先采用人工重置密码，所以 SMTP 可以暂时不填
- `PASSWORD_RESET_URL_ALLOW_LIST` 先保留，后续如果启用邮件重置可以直接使用
- Railway PostgreSQL 的 `PGHOST`、`PGPORT`、`PGDATABASE`、`PGUSER`、`PGPASSWORD` 需要对应填到 Directus 的 `DB_HOST`、`DB_PORT`、`DB_DATABASE`、`DB_USER`、`DB_PASSWORD`
- 当前已确认的 Railway Volume 路径是 `/directus/uploads`
- 当前线上上传失败的直接原因是 Directus 对 `/directus/uploads` 没有写入权限，Railway Volume 需要给 Directus 服务补 `RAILWAY_RUN_UID=0` 后重新部署

完整模板见：

- [.env.staging.example](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/.env.staging.example)

## 6. 当前推荐顺序

1. 先创建前台预览链接
2. 再准备 Directus 测试环境域名
3. 接 PostgreSQL
4. 在 Directus 里补 `PASSWORD_RESET_URL_ALLOW_LIST`
5. 确认 Railway Volume 路径是 `/directus/uploads`
6. 在 Railway Directus 服务里补 `RAILWAY_RUN_UID=0` 后重新部署
7. 最后再把前台改成真实接口读取

## 7. 当前完成标准

满足以下条件，就算测试环境准备完成：

1. 有一个可访问的前台预览链接
2. 预览站不再显示错误的后台地址
3. 测试环境变量模板已整理完
4. 后台、数据库、文件存储的变量口径已固定
5. Directus 已放行前台重置密码页地址
6. Directus 已具备人工重置密码的后台流程

## 8. 现在还缺什么

当前还缺的不是代码，而是测试环境里的云端配置与验收：

- Vercel 前台变量是否已填：`DIRECTUS_URL`、`DIRECTUS_TOKEN`、`NEXT_PUBLIC_DIRECTUS_URL`
- Railway Directus 变量是否已按 Directus 实际变量名填写
- Railway Volume 是否已挂载到 `/directus/uploads`
- Directus 后台是否可以上传文件
- 会员账号是否可以登录并访问受保护页面

如果要在 Railway 的 Directus 服务里补齐，直接去：

1. `directus` 服务
2. `Variables`
3. 填入 `.env.staging.example` 里的 Railway Directus 变量
4. 保存后等待重启

一旦这些账号可用，就可以按这份文档直接补齐第二段。

## 9. 当前说明

- 最新预览链接不写入仓库文档
- 预览链接与认领链接以当次部署结果为准
- 当前正式测试前台地址固定为：[farge-space-think-tank.vercel.app](https://farge-space-think-tank.vercel.app)

## 10. 测试账号建议

建议长期保留 3 类测试账号：

| 用途 | 建议条件 | 预期结果 |
|---|---|---|
| 有效会员 | `status=active`、`member_profile_status=active`、已绑定有效 `member_tier_id` | 可以登录并进入会员页 |
| 缺少层级账号 | `status=active`、`member_profile_status=active`、`member_tier_id` 为空 | 登录时被拦下 |
| 无前台权限账号 | 使用非 `Member / Editor / Administrator` 角色 | 登录时被拦下 |

说明：

- 这 3 类账号足够覆盖 `T1308` 的主要验收场景
- 密码重置验收建议单独使用“有效会员”账号
- 不建议长期保留临时失效层级账号，需要时可按测试脚本临时生成

## 11. 参考依据

- Directus 配置项：[`PASSWORD_RESET_URL_ALLOW_LIST`、`EMAIL_TRANSPORT`、`EMAIL_SMTP_*`](https://docs.directus.io/self-hosted/config-options)
- Directus Cloud / 环境变量说明：[`PASSWORD_RESET_URL_ALLOW_LIST`](https://docs.directus.io/user-guide/cloud/variables)
- Directus 旧版 SDK 文档中对重置链接放行有明确说明：[`PASSWORD_RESET_URL_ALLOW_LIST`](https://docs.directus.io/reference/old-sdk)
