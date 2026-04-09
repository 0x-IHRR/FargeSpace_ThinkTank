# 测试环境部署说明

版本：V1
日期：2026-04-09
状态：Ready

关联文件：
- [docker-compose.yml](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/docker-compose.yml)
- [.env.example](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/.env.example)
- [.env.staging.example](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/.env.staging.example)
- [PHASE1_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE1_SETUP.md)

## 1. 目标

测试环境只解决两件事：

- 给团队一个可以直接打开验收的前台链接
- 给内容团队一个独立的后台入口用于上传和发布

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
| `NEXT_PUBLIC_APP_URL` | 预览站域名 |
| `NEXT_PUBLIC_DIRECTUS_URL` | Directus 测试环境域名 |
| `NEXT_PUBLIC_ASSET_BASE_URL` | `Directus 域名/assets` |

说明：

- 如果还没准备好后台域名，可以先不填 `NEXT_PUBLIC_DIRECTUS_URL`
- 当前前台已改成：未配置后台域名时，不显示错误的后台地址

## 5. Directus 测试环境变量

Directus 官方文档说明：

- `PUBLIC_URL` 用于后台对外访问地址
- 文件存储支持 S3 兼容方案
- S3 配置需要 `STORAGE_<LOCATION>_KEY`、`SECRET`、`BUCKET`、`REGION`、`ENDPOINT`

本项目建议统一成单一命名：

| 用途 | 建议值 |
|---|---|
| `DIRECTUS_PUBLIC_URL` | Directus 测试环境域名 |
| `POSTGRES_*` | 托管 PostgreSQL 提供的连接信息 |
| `S3_*` | 对象存储提供的连接信息 |
| `CORS_ORIGIN` | 前台预览站域名 |

完整模板见：

- [.env.staging.example](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/.env.staging.example)

## 6. 当前推荐顺序

1. 先创建前台预览链接
2. 再准备 Directus 测试环境域名
3. 接 PostgreSQL
4. 接 S3 兼容存储
5. 最后再把前台改成真实接口读取

## 7. 当前完成标准

满足以下条件，就算测试环境准备完成：

1. 有一个可访问的前台预览链接
2. 预览站不再显示错误的后台地址
3. 测试环境变量模板已整理完
4. 后台、数据库、文件存储的变量口径已固定

## 8. 现在还缺什么

当前还缺的不是代码，而是云端账号信息：

- Vercel 项目归属
- Directus 托管位置
- PostgreSQL 实例
- S3 存储桶

一旦这些账号可用，就可以按这份文档直接补齐第二段。

## 9. 当前说明

- 最新预览链接不写入仓库文档
- 预览链接与认领链接以当次部署结果为准
