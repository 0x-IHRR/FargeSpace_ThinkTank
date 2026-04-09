# FargeSpace Think Tank Phase 12 Editorial Flow

版本：V1
日期：2026-04-09
状态：Frozen

关联文件：
- [scripts/apply_phase12_editorial_flow.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/apply_phase12_editorial_flow.mjs)
- [scripts/verify_phase12_editorial_flow.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase12_editorial_flow.mjs)
- [PHASE11_UPLOAD_FLOW.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE11_UPLOAD_FLOW.md)
- [PHASE3_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE3_SETUP.md)
- [PHASE4_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE4_SETUP.md)

## 1. 目标

这一阶段只固定两件事：

- 把后台编辑、审核、排期、发布、归档的入口固定下来
- 把关键字段的填写口径写进后台，减少编辑反复确认

## 2. 当前固定的后台书签

`packages`

- `草稿池`
- `待补来源`
- `待补摘要`
- `待审核`
- `可排期`
- `已排期`
- `已发布`
- `已归档`

## 3. 当前固定的状态含义

| 状态 | 含义 | 下一步 |
|---|---|---|
| `draft` | 基础信息还在整理 | 补来源、补摘要、补主题 |
| `review` | 内容已基本齐全，等待审核 | 通过后改为 `approved` |
| `approved` | 审核通过，等待排期 | 填发布时间，改为 `scheduled` |
| `scheduled` | 已排期，等待到点上线 | 到点后改为 `published` |
| `published` | 会员可见 | 需要下线时补结束时间或改为 `archived` |
| `archived` | 不再对会员可见 | 保留资料，不继续分发 |

## 4. 当前固定的后台操作顺序

### 4.1 草稿整理

优先查看：

1. `草稿池`
2. `待补来源`
3. `待补摘要`

这一阶段要补齐：

- 标题
- slug
- 摘要
- 主主题
- 会员层级
- 至少 1 个来源
- 至少 1 条有效 brief

### 4.2 审核

基础信息齐全后，把 `workflow_state` 改为：

- `review`

审核时优先查看：

1. `待审核`

审核通过后，改为：

- `approved`

### 4.3 排期

排期时优先查看：

1. `可排期`

这一阶段必须补：

- `publish_start_at`

排好时间后，改为：

- `scheduled`

### 4.4 发布

发布时优先查看：

1. `已排期`

上线后维护：

1. `已发布`

### 4.5 归档

不再分发的内容，改为：

- `archived`

归档后统一在：

1. `已归档`

中处理。

## 5. 当前固定的字段说明

已经补到后台里的关键说明包括：

- `packages.workflow_state`：状态顺序
- `packages.publish_start_at`：排期/发布前必填
- `packages.slug`：前台路径，不建议上线后频繁变更
- `sources.source_url`：原始链接口径
- `processed_assets.asset_type`：brief 与多媒体的最小要求
- `processed_assets.is_primary`：主资产唯一
- `package_topics.topic_id`：主主题必须同步到主题关联

## 6. 执行命令

应用后台编辑与发布流程：

```bash
node scripts/apply_phase12_editorial_flow.mjs
```

验证后台编辑与发布流程：

```bash
node scripts/verify_phase12_editorial_flow.mjs
```

## 7. 完成标准

满足以下条件，这一阶段才算完成：

1. `packages` 的编辑书签已补齐
2. 集合说明已写入后台
3. 关键字段说明已写入后台
4. 状态顺序已写清
5. 校验脚本可重复通过
