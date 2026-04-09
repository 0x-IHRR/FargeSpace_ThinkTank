# FargeSpace Think Tank Phase 0 冻结决策

版本：V1
日期：2026-04-09
状态：Frozen

关联文档：
- [PRD.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PRD.md)
- [DATA_MODEL.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/DATA_MODEL.md)
- [TODO.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/TODO.md)
- [CONTENT_SEED_20.csv](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/CONTENT_SEED_20.csv)

## 1. 目的

这份文档是 Phase 0 的正式输出。

从现在开始，后续开发默认以这里的定义为准，不再对这些基础规则反复摇摆：

- 受控枚举值
- 启动主题集合
- 启动合集集合
- 内容边界
- 权限口径

如果后面要改，必须先改这份文档，再动实现。

## 2. 术语冻结

### 2.1 核心对象

- `Source`：原始来源
- `Package`：会员实际浏览的内容包
- `ProcessedAsset`：整理后的可消费内容
- `Topic`：主题
- `CuratedCollection`：合集
- `MemberTier`：会员层级

### 2.2 不再模糊的边界

- 会员主对象永远是 `Package`
- `Source` 不能单独面向会员发布
- `ProcessedAsset` 必须挂在 `Package` 下
- `CuratedCollection` 是组织方式，不是主内容对象

## 3. 受控枚举冻结

说明：

- 下列值为实现层 canonical code
- 前台显示文案可以后续单独定
- 不允许在开发过程中临时增加拼写变体

### 3.1 Source

#### `source_type`

- `article`
- `video`
- `podcast`
- `paper`
- `website`

#### `language`

- `en`
- `zh`
- `other`

#### `status`

- `active`
- `archived`

### 3.2 Package

#### `package_type`

- `recap`
- `deep_dive`
- `watchlist`
- `toolkit`
- `interview`

#### `publication_cycle`

- `weekly`
- `monthly`
- `special`

#### `workflow_state`

- `draft`
- `review`
- `approved`
- `scheduled`
- `published`
- `archived`

#### `difficulty`

- `beginner`
- `intermediate`
- `advanced`

#### `use_case`

- `awareness`
- `strategy`
- `tooling`
- `workflow`
- `research`

#### `signal_level`

- `high_signal`
- `reference`
- `archive`

### 3.3 ProcessedAsset

#### `asset_type`

- `brief`
- `audio`
- `slides`
- `video`

#### `status`

- `active`
- `archived`

### 3.4 CuratedCollection

#### `collection_type`

- `weekly`
- `monthly`
- `special`

## 4. 启动主题冻结

V1 先冻结为以下 9 个主题：

| code | name |
|---|---|
| `agents` | Agents |
| `models` | Models |
| `reasoning` | Reasoning |
| `tooling` | Tooling |
| `workflow` | Workflow |
| `research` | Research |
| `coding` | Coding |
| `business` | Business |
| `voice_ai` | Voice AI |

说明：

- 当前不再增加单独的 tag 系统
- `additional_topics` 在试填阶段只允许映射到这 9 个主题
- 不属于这 9 个主题的词，不当作 `Topic`

## 5. 启动合集冻结

V1 先冻结为以下 8 个合集：

| slug | name | collection_type |
|---|---|---|
| `model-release-observer` | 模型发布观察 | `special` |
| `agentic-ai-watch` | Agentic AI Watch | `special` |
| `ai-product-and-ecosystem` | AI 产品与生态 | `special` |
| `developer-tooling-tracker` | 开发者工具追踪 | `special` |
| `ai-usage-and-trends` | AI 使用与趋势 | `monthly` |
| `research-paper-selection` | 研究与论文精选 | `special` |
| `ai-industry-applications` | AI 行业应用 | `special` |
| `ai-summit-video-selection` | AI 峰会视频精选 | `special` |

## 6. 试填归一化规则冻结

`CONTENT_SEED_20.csv` 在进入导入前，按下面规则归一化：

### 6.1 `primary_topic`

- 必须直接落在 9 个启动主题中

### 6.2 `additional_topics`

按下面规则处理：

- 如果值属于启动主题，则写入 `package_topics`
- 如果值不属于启动主题，则不扩充 `Topic`
- 非主题值按下面规则映射：

| 原值 | 去向 |
|---|---|
| `strategy` | `use_case=strategy` |
| `tooling` | `use_case=tooling`，同时若需要可保留为 topic `tooling` |
| `workflow` | `use_case=workflow`，同时若需要可保留为 topic `workflow` |
| `research` | `use_case=research`，同时若需要可保留为 topic `research` |
| `reasoning` | 可作为 topic `reasoning` |
| `media` | 暂不入结构，保留在 `notes` |
| `economy` | 暂不入结构，保留在 `notes` |
| `healthcare` | 暂不入结构，保留在 `notes` |
| `integration` | 暂不入结构，保留在 `notes` |
| `infrastructure` | 暂不入结构，保留在 `notes` |
| `platform` | 暂不入结构，保留在 `notes` |
| `product` | 暂不入结构，保留在 `notes` |

### 6.3 `collection_name`

- 必须映射到 8 个启动合集之一
- 不允许导入时新增合集

## 7. 内容边界冻结

### 7.1 Package 最小要求

每个 `Package` 必须：

- 至少有 1 个 `Source`
- 至少有 1 个 `ProcessedAsset`
- 至少有 1 个 `brief`

### 7.2 Source 可见性

- 会员只能在 `Package` 详情页里看到 `Source`
- `Source` 不可作为独立详情页暴露

### 7.3 ProcessedAsset 复用规则

- V1 不做跨 `Package` 复用
- 即使来自同一来源，只要是不同 `Package`，加工资产视为独立记录

## 8. 权限冻结

### 8.1 `admin`

- 可访问后台
- 可管理用户
- 可管理角色与系统设置
- 可管理所有内容

### 8.2 `editor`

- 可访问后台
- 可创建、编辑、发布内容
- 不可管理用户
- 不可修改系统级设置

### 8.3 `member`

- 不可访问后台
- 只能通过前台查看已发布内容
- 只能看到发布时间窗口内的内容

### 8.4 未登录用户

- V1 默认不可访问会员内容

## 9. Phase 0 完成标准

以下事项现在视为完成：

- 枚举值冻结
- 启动主题冻结
- 启动合集冻结
- 内容边界冻结
- 权限口径冻结

这意味着后续可以进入：

- Directus 环境搭建
- 数据结构建模
- 种子导入 dry-run
- 接口合同冻结

## 10. 后续变更规则

如果后面要改：

- 先改这份文档
- 再改 `PRD.md`
- 再改 `DATA_MODEL.md`
- 最后改实现

不允许跳过 Phase 0 冻结文档直接改代码。
