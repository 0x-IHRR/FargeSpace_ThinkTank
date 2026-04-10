# FargeSpace Think Tank Phase 1 Setup

版本：V1
日期：2026-04-09
状态：Draft

关联文件：
- [docker-compose.yml](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/docker-compose.yml)
- [.env.example](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/.env.example)
- [PHASE0_DECISIONS.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE0_DECISIONS.md)

## 1. Phase 1 目标

Phase 1 只做一件事：

- 把本地开发底座准备好

当前不做：

- 前端项目初始化
- Directus 集合建模
- 登录流程实现
- 云端正式部署

## 2. 当前建议技术栈

| 层 | 本地开发 | 测试/正式环境 |
|---|---|---|
| 前端 | Next.js 本地运行 | Vercel |
| 后端 | Directus Docker | 单独后端服务 |
| 数据库 | 本地 PostgreSQL | 托管 PostgreSQL |
| 文件存储 | 本地挂载目录 | S3 兼容存储 |

## 3. 本地运行文件

本阶段仓库中应存在：

- `.env.example`
- `docker-compose.yml`
- `storage/uploads/.gitkeep`
- `extensions/.gitkeep`

## 4. 本地启动方式

### 4.1 准备环境变量

复制环境变量文件：

```bash
cp .env.example .env
```

必须至少替换：

- `DIRECTUS_KEY`
- `DIRECTUS_SECRET`
- `DIRECTUS_ADMIN_PASSWORD`
- `POSTGRES_PASSWORD`

### 4.2 启动服务

```bash
docker compose up -d
```

### 4.3 验证结果

预期结果：

- PostgreSQL 正常启动
- Directus 正常启动
- Directus 后台可访问：`http://localhost:8055`

说明：

- 本地 PostgreSQL 默认不向宿主机暴露端口
- 这样可以避免本机已有数据库占用 `5432` 时启动失败
- 在当前架构里，数据库只需要被 Directus 容器访问

## 5. 环境变量分组说明

### 5.1 本地必填

- `DIRECTUS_KEY`
- `DIRECTUS_SECRET`
- `DIRECTUS_ADMIN_EMAIL`
- `DIRECTUS_ADMIN_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

### 5.2 前端预留

这些变量当前先保留，不要求立即使用：

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_DIRECTUS_URL`
- `NEXT_PUBLIC_ASSET_BASE_URL`

### 5.3 云端预留

这些变量当前先保留，后面测试环境会用到：

- `S3_BUCKET`
- `S3_REGION`
- `S3_ENDPOINT`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

## 6. 本地到测试环境的迁移口径

本地和测试环境要保持同一套概念，不要换架构，只换运行位置。

### 6.1 不变的部分

- Directus 仍然是后台核心
- PostgreSQL 仍然是数据库
- 文件仍然通过 Directus 管理
- 前端仍然通过 API 读取数据

### 6.2 会变化的部分

- `PUBLIC_URL`
- 数据库连接信息
- 存储从本地目录切到 S3 兼容存储
- CORS 域名
- 资产 URL

## 7. 当前推荐的测试环境形态

### 前端

- Vercel

### 后端

三选一：

1. Render
2. Railway
3. 云服务器自托管

当前推荐：

- 如果想快，选 Render 或 Railway
- 如果想控制力强，后面再换自托管

### 数据库

- 托管 PostgreSQL
- 可以使用 Supabase，但只把它当数据库

### 文件存储

- S3 兼容存储

## 8. 本阶段风险提示

### 8.1 不要过早绑定云平台细节

现在应先本地跑通，再上测试环境。

### 8.2 不要同时引入两套权限系统

V1 权限以 Directus 为准，不要现在再引入第二套 Auth 逻辑。

### 8.3 不要先做正式环境再补测试环境

顺序必须是：

1. 本地
2. 测试环境
3. 正式环境

## 9. Phase 1 完成标准

满足以下条件，Phase 1 才算完成：

1. `.env.example` 已定稿
2. `docker-compose.yml` 可启动
3. PostgreSQL 正常运行
4. Directus 正常运行
5. 本地 uploads 挂载路径正常
6. `extensions` 目录已预留
7. 测试环境变量口径已预留

## 10. 下一步

Phase 1 完成后，进入：

- Phase 2：内容集合与字段建模
