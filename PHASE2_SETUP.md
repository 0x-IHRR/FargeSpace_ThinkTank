# FargeSpace Think Tank Phase 2 Schema

版本：V1  
日期：2026-04-09  
状态：Frozen

关联文件：
- [scripts/apply_phase2_schema.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/apply_phase2_schema.mjs)
- [scripts/apply_phase2_indexes.sh](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/apply_phase2_indexes.sh)
- [scripts/export_directus_schema.sh](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/export_directus_schema.sh)
- [directus/schema/schema.yaml](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/directus/schema/schema.yaml)
- [directus/schema/phase2-indexes.sql](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/directus/schema/phase2-indexes.sql)

## 1. Phase 2 目标

Phase 2 只做一件事：

- 把 [DATA_MODEL.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/DATA_MODEL.md) 映射成可运行的 Directus 后台结构

本阶段完成后，后台需要具备：

- 9 个核心集合
- UUID 主键
- 基础关系
- 固定枚举下拉
- 首批主题、合集、会员层级种子
- 可导出的 schema 记录文件

当前不做：

- 跨表业务校验
- 发布规则限制
- 会员前台可见性过滤
- 导入流程

这些留到 Phase 3。

## 2. 目录说明

- `scripts/apply_phase2_schema.mjs`
  - 在空数据库上创建集合、字段、关系和固定种子
- `directus/schema/phase2-indexes.sql`
  - 保存复合唯一约束和复合索引
- `scripts/apply_phase2_indexes.sh`
  - 把 `phase2-indexes.sql` 应用到本地 PostgreSQL
- `scripts/export_directus_schema.sh`
  - 从当前 Directus 导出可回放的 `schema.yaml`

## 3. 本地使用顺序

### 3.1 确保数据库为空

如果当前库里已经有自定义集合，先重置本地环境。

### 3.2 创建 Phase 2 结构

```bash
node scripts/apply_phase2_schema.mjs
```

### 3.3 应用复合索引

```bash
bash scripts/apply_phase2_indexes.sh
```

### 3.4 导出 schema 记录

```bash
bash scripts/export_directus_schema.sh
```

## 4. 当前创建的集合

主集合：

- `sources`
- `packages`
- `processed_assets`
- `topics`
- `curated_collections`
- `member_tiers`

关联集合：

- `package_sources`
- `package_topics`
- `package_collections`

## 5. 当前创建的固定种子

### 5.1 Topics

- `agents`
- `models`
- `reasoning`
- `tooling`
- `workflow`
- `research`
- `coding`
- `business`
- `voice_ai`

### 5.2 Curated Collections

- `model-release-observer`
- `agentic-ai-watch`
- `ai-product-and-ecosystem`
- `developer-tooling-tracker`
- `ai-usage-and-trends`
- `research-paper-selection`
- `ai-industry-applications`
- `ai-summit-video-selection`

### 5.3 Member Tiers

- `standard_member`

## 6. 为什么保留两层记录

Phase 2 同时保留两层东西：

1. `schema.yaml`
2. `phase2-indexes.sql`

原因：

- `schema.yaml` 适合保存 Directus 本身能回放的集合、字段、关系
- 复合索引和复合唯一约束更适合单独放在 SQL 文件里

## 7. Phase 2 完成标准

满足以下条件，Phase 2 才算完成：

1. 9 个集合已创建
2. 固定枚举已配置为后台下拉
3. 关系已创建
4. 首批主题、合集、会员层级已写入
5. `schema.yaml` 已导出到仓库
6. 复合索引已应用
7. 本地可通过 API 读到集合和种子数据

## 8. 下一步

Phase 2 完成后，进入：

- Phase 3：编辑流程与校验规则
