# FargeSpace Think Tank Phase 5 Seed Import

版本：V1  
日期：2026-04-09  
状态：Frozen

关联文件：
- [CONTENT_SEED_20.csv](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/CONTENT_SEED_20.csv)
- [scripts/lib/phase5_seed.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/lib/phase5_seed.mjs)
- [scripts/lib/phase5_directus.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/lib/phase5_directus.mjs)
- [scripts/phase5_validate_seed.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/phase5_validate_seed.mjs)
- [scripts/phase5_dry_run_import.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/phase5_dry_run_import.mjs)
- [scripts/phase5_import_seed.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/phase5_import_seed.mjs)

## 1. Phase 5 目标

Phase 5 只做一件事：

- 用真实种子内容验证结构，并完成首批内容入库

## 2. 完成结果

### 2.1 T501 校验 CSV 结构

- 校验入口脚本已可执行
- 20 条数据校验通过
- 修复了 1 条不合规 slug（`_` 改为 `-`）

### 2.2 T502/T503 归一化与导入映射

- 已固定种子字段校验规则与枚举规则
- 已固定主题/合集映射与派生字段映射
- 已固定 `sources`、`packages`、`processed_assets` 及关联表导入顺序

### 2.3 T504 Dry-run 导入

- 20 条数据 dry-run 全量通过
- 试跑后自动清理，数据库未残留 dry-run 记录

### 2.4 T505 模型问题处理

- 本轮 dry-run 未发现需要改表结构的问题
- 发现 7 条 `additional_topics` 不在 V1 主题集合内，按预期作为非阻塞警告处理，不中断导入

### 2.5 T506 正式导入

- 20 条内容正式导入成功
- 导入后状态校验通过（全部为可见状态）

## 3. 导入后数据核对

当前库内统计：

- `packages`：20
- `sources`：20
- `processed_assets`：56
- `package_sources`：20
- `package_topics`：52
- `package_collections`：20

状态分布：

- `packages.workflow_state`：`published` = 20

资产分布：

- `brief` = 20
- `audio` = 15
- `slides` = 16
- `video` = 5

## 4. 本地执行顺序

### 4.1 结构校验

```bash
node scripts/phase5_validate_seed.mjs
```

### 4.2 Dry-run 导入

```bash
node scripts/phase5_dry_run_import.mjs
```

### 4.3 正式导入

```bash
node scripts/phase5_import_seed.mjs
```

## 5. 完成标准

满足以下条件，Phase 5 才算完成：

1. 20 条种子通过结构校验
2. dry-run 全流程通过且无残留
3. 正式导入成功且状态校验通过
4. 数据总量与资产分布符合种子定义

## 6. 下一步

Phase 5 完成后，进入：

- Phase 6：接口合同冻结
