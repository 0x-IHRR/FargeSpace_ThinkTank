# FargeSpace Think Tank 数据结构表

版本：V1
日期：2026-04-09
状态：Draft

关联文档：
- [PRD.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PRD.md)
- [设计方案](/Users/ihrr/.gstack/projects/FargeSpace_ThinkTank/ihrr-unknown-design-20260409-113820.md)

## 1. 文档目的

这份文档用于在正式写代码前锁定 V1 的内容结构。

它回答四件事：

1. V1 需要哪些核心数据对象
2. 每个对象有哪些字段
3. 字段之间如何关联
4. 哪些字段是 V1 必须存在的

这不是最终数据库迁移文件，但它是正式建表、配置 Directus、写接口前的结构依据。

## 2. 建模原则

1. 会员看到的核心对象是 `Package`
2. `Source` 不能直接单独发布给会员
3. 每个 `Package` 必须至少绑定 1 个 `Source`
4. 每个 `Package` 必须至少绑定 1 个 `ProcessedAsset`
5. V1 的 `ProcessedAsset` 以 `Package` 为单位管理，不做跨包复用
6. 权限主要通过 Directus 角色控制，不通过复杂自定义权限表实现

## 3. V1 核心数据对象

V1 建议使用以下集合：

1. `sources`
2. `packages`
3. `processed_assets`
4. `topics`
5. `curated_collections`
6. `member_tiers`
7. `package_sources`
8. `package_topics`
9. `package_collections`

说明：

- `curated_collections` 用这个名字，是为了避免和数据库保留语义冲突
- 用户与角色由 Directus 自带用户体系管理
- 文件资产优先使用 Directus 文件系统，不单独再建媒体主表

## 4. 关系总览

### 4.1 关系图摘要

- 一个 `Package` 对多个 `Source`
- 一个 `Package` 对多个 `ProcessedAsset`
- 一个 `Package` 对多个 `Topic`
- 一个 `Package` 对多个 `CuratedCollection`
- 一个 `Package` 属于一个 `MemberTier`

### 4.2 关键关系规则

- `package_sources` 是 `packages` 和 `sources` 的关联表
- `processed_assets` 直接归属于 `packages`
- `package_topics` 是 `packages` 和 `topics` 的关联表
- `package_collections` 是 `packages` 和 `curated_collections` 的关联表
- `packages.primary_topic_id` 用于首页和详情页快速取主主题

## 5. 字段定义

### 5.1 `sources`

用途：

- 存放原始来源信息

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| `id` | UUID | 是 | 主键 | `uuid` |
| `title` | String(255) | 是 | 原始来源标题 | `OpenAI 发布会总结` |
| `source_type` | Enum | 是 | 来源类型 | `article` |
| `platform` | String(100) | 是 | 来源平台 | `YouTube` |
| `source_url` | String(500) | 是 | 原始链接 | `https://...` |
| `author_name` | String(150) | 否 | 作者名 | `Sam Altman` |
| `language` | Enum | 是 | 原始语言 | `en` |
| `published_at` | Datetime | 否 | 原始发布时间 | `2026-04-01 10:00:00` |
| `thumbnail_file_id` | UUID / File | 否 | 封面图文件 | `file_id` |
| `source_summary` | Text | 否 | 对来源的内部摘要 | `这是一篇关于...` |
| `status` | Enum | 是 | 来源记录状态 | `active` |
| `created_at` | Datetime | 是 | 创建时间 | 自动生成 |
| `updated_at` | Datetime | 是 | 更新时间 | 自动生成 |

受控值：

- `source_type`: `article` / `video` / `podcast` / `paper` / `website`
- `language`: `en` / `zh` / `other`
- `status`: `active` / `archived`

### 5.2 `packages`

用途：

- 会员实际浏览和消费的核心对象

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| `id` | UUID | 是 | 主键 | `uuid` |
| `slug` | String(180) | 是 | 前台路径标识，唯一 | `openai-launch-recap` |
| `title` | String(255) | 是 | 内容包标题 | `OpenAI 发布回顾` |
| `summary` | Text | 是 | 内容包摘要 | `一篇适合会员快速理解的整理版摘要` |
| `cover_file_id` | UUID / File | 否 | 内容包封面 | `file_id` |
| `primary_topic_id` | UUID | 是 | 主主题 | `topic_id` |
| `member_tier_id` | UUID | 是 | 会员层级 | `tier_id` |
| `package_type` | Enum | 是 | 内容包类型 | `recap` |
| `publication_cycle` | Enum | 否 | 发布周期 | `weekly` |
| `workflow_state` | Enum | 是 | 工作流状态 | `draft` |
| `publish_start_at` | Datetime | 否 | 对会员生效时间 | `2026-04-10 09:00:00` |
| `publish_end_at` | Datetime | 否 | 下线时间 | `2026-05-01 00:00:00` |
| `is_featured` | Boolean | 是 | 是否作为首页重点内容 | `true` |
| `sort_date` | Datetime | 是 | 用于前台排序 | `2026-04-10 09:00:00` |
| `raw_source_visible` | Boolean | 是 | 是否显示原始来源信息 | `true` |
| `seo_title` | String(255) | 否 | SEO 标题 | `OpenAI 发布回顾 - FargeSpace` |
| `seo_description` | String(300) | 否 | SEO 描述 | `快速了解本次发布要点` |
| `created_at` | Datetime | 是 | 创建时间 | 自动生成 |
| `updated_at` | Datetime | 是 | 更新时间 | 自动生成 |

受控值：

- `package_type`: `recap` / `deep_dive` / `watchlist` / `toolkit` / `interview`
- `publication_cycle`: `weekly` / `monthly` / `special`
- `workflow_state`: `draft` / `review` / `approved` / `scheduled` / `published` / `archived`

业务规则：

- `slug` 必须唯一
- `summary` 为必填
- `raw_source_visible` 默认 `true`
- `member_tier_id` 在 V1 虽然只有一个值，但字段必须保留
- `publish_start_at` 为空时不可进入 `published`

### 5.3 `processed_assets`

用途：

- 存放会员实际消费的加工内容

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| `id` | UUID | 是 | 主键 | `uuid` |
| `package_id` | UUID | 是 | 归属内容包 | `package_id` |
| `asset_type` | Enum | 是 | 加工内容类型 | `brief` |
| `title` | String(255) | 是 | 加工内容标题 | `5 分钟摘要版` |
| `language` | Enum | 是 | 内容语言 | `zh` |
| `body_markdown` | Long Text | 否 | 文字摘要正文 | `markdown 内容` |
| `file_id` | UUID / File | 否 | 上传文件 | `file_id` |
| `external_url` | String(500) | 否 | 外部资源链接 | `https://...` |
| `duration_seconds` | Integer | 否 | 音频/视频时长 | `320` |
| `sort_order` | Integer | 是 | 同包内排序 | `1` |
| `is_primary` | Boolean | 是 | 是否为主加工内容 | `true` |
| `status` | Enum | 是 | 资产状态 | `active` |
| `created_at` | Datetime | 是 | 创建时间 | 自动生成 |
| `updated_at` | Datetime | 是 | 更新时间 | 自动生成 |

受控值：

- `asset_type`: `brief` / `audio` / `slides` / `video`
- `language`: `zh` / `en` / `other`
- `status`: `active` / `archived`

业务规则：

- 每个 `Package` 至少有一个 `asset_type=brief` 的记录
- `brief` 类型至少需要 `body_markdown` 或 `file_id`
- `audio`、`slides`、`video` 至少需要 `file_id` 或 `external_url`
- 同一个 `Package` 只能有一个 `is_primary=true` 的资产

### 5.4 `topics`

用途：

- 管理主题分类

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| `id` | UUID | 是 | 主键 | `uuid` |
| `slug` | String(120) | 是 | 唯一路径标识 | `agents` |
| `name` | String(120) | 是 | 主题名 | `Agents` |
| `description` | Text | 否 | 主题说明 | `与智能体相关的内容` |
| `sort_order` | Integer | 是 | 排序 | `10` |
| `status` | Enum | 是 | 状态 | `active` |
| `created_at` | Datetime | 是 | 创建时间 | 自动生成 |
| `updated_at` | Datetime | 是 | 更新时间 | 自动生成 |

受控值：

- `status`: `active` / `archived`

### 5.5 `curated_collections`

用途：

- 管理“本周精选”“特别专题”这类合集

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| `id` | UUID | 是 | 主键 | `uuid` |
| `slug` | String(160) | 是 | 唯一路径标识 | `weekly-2026-04-01` |
| `name` | String(180) | 是 | 合集名 | `本周精选 2026-04-01` |
| `description` | Text | 否 | 合集说明 | `本周重点 AI 内容整理` |
| `collection_type` | Enum | 是 | 合集类型 | `weekly` |
| `cover_file_id` | UUID / File | 否 | 合集封面 | `file_id` |
| `sort_order` | Integer | 是 | 排序 | `1` |
| `status` | Enum | 是 | 状态 | `active` |
| `created_at` | Datetime | 是 | 创建时间 | 自动生成 |
| `updated_at` | Datetime | 是 | 更新时间 | 自动生成 |

受控值：

- `collection_type`: `weekly` / `monthly` / `special`
- `status`: `active` / `archived`

### 5.6 `member_tiers`

用途：

- 管理会员层级

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| `id` | UUID | 是 | 主键 | `uuid` |
| `code` | String(80) | 是 | 唯一代码 | `standard_member` |
| `name` | String(120) | 是 | 层级名称 | `标准会员` |
| `description` | Text | 否 | 层级说明 | `默认会员层级` |
| `status` | Enum | 是 | 状态 | `active` |
| `created_at` | Datetime | 是 | 创建时间 | 自动生成 |
| `updated_at` | Datetime | 是 | 更新时间 | 自动生成 |

受控值：

- `status`: `active` / `archived`

说明：

- V1 只有一个默认层级，但保留表结构，避免后面返工

### 5.7 `package_sources`

用途：

- 建立 `Package` 与 `Source` 的多对多关系

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| `id` | UUID | 是 | 主键 | `uuid` |
| `package_id` | UUID | 是 | 内容包 ID | `package_id` |
| `source_id` | UUID | 是 | 来源 ID | `source_id` |
| `is_primary` | Boolean | 是 | 是否主来源 | `true` |
| `sort_order` | Integer | 是 | 排序 | `1` |
| `created_at` | Datetime | 是 | 创建时间 | 自动生成 |

业务规则：

- 每个 `Package` 至少有一个 `is_primary=true` 的来源
- 同一个来源可出现在多个内容包里，但应有明确策展差异

### 5.8 `package_topics`

用途：

- 建立 `Package` 与 `Topic` 的多对多关系

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| `id` | UUID | 是 | 主键 | `uuid` |
| `package_id` | UUID | 是 | 内容包 ID | `package_id` |
| `topic_id` | UUID | 是 | 主题 ID | `topic_id` |
| `sort_order` | Integer | 是 | 排序 | `1` |
| `created_at` | Datetime | 是 | 创建时间 | 自动生成 |

业务规则：

- `packages.primary_topic_id` 必须同时存在于 `package_topics`

### 5.9 `package_collections`

用途：

- 建立 `Package` 与 `CuratedCollection` 的多对多关系

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| `id` | UUID | 是 | 主键 | `uuid` |
| `package_id` | UUID | 是 | 内容包 ID | `package_id` |
| `collection_id` | UUID | 是 | 合集 ID | `collection_id` |
| `sort_order` | Integer | 是 | 排序 | `1` |
| `created_at` | Datetime | 是 | 创建时间 | 自动生成 |

## 6. Directus 字段实现建议

### 6.1 推荐直接使用 Enum / Select 的字段

- `source_type`
- `language`
- `package_type`
- `publication_cycle`
- `workflow_state`
- `asset_type`
- `status`
- `collection_type`

### 6.2 推荐直接使用 Directus 文件字段

- `sources.thumbnail_file_id`
- `packages.cover_file_id`
- `curated_collections.cover_file_id`
- `processed_assets.file_id`

### 6.3 推荐直接使用 Directus 富文本 / Markdown 字段

- `packages.summary`
- `processed_assets.body_markdown`
- `topics.description`
- `curated_collections.description`

## 7. 索引建议

V1 推荐建立以下索引：

- `packages.slug`
- `packages.workflow_state`
- `packages.sort_date`
- `packages.publish_start_at`
- `sources.source_type`
- `processed_assets.asset_type`
- `topics.slug`
- `curated_collections.slug`

## 8. 最小测试样本要求

正式写代码前，用至少 20 条真实内容跑一遍这个模型。

每条测试内容至少要能明确落下这些信息：

- 属于哪个 `Source`
- 属于哪个 `Package`
- 至少有什么 `ProcessedAsset`
- 主主题是什么
- 是否属于某个合集
- 何时发布

如果这 20 条内容中，出现下面任何情况，就说明模型还不能开工：

- 必须增加临时字段才能放进去
- 同一类内容总是需要例外处理
- 原始来源和内容包边界不清楚
- 同一资产无法判断该放在哪个对象下

## 9. 当前还没展开的部分

这份数据结构表已经足够支撑 V1 建后台，但还没进入以下层级：

- Directus 每个字段的 UI 组件配置
- 表单校验规则细节
- API 返回格式
- 前台页面接口聚合方式

这些内容应在下一阶段与开发 TODO 一起补齐。

## 10. 下一步建议

推荐顺序：

1. 用这份结构表跑 20 条真实内容试填
2. 如果结构稳定，再拆原子化开发 TODO
3. 最后再开始正式建项目
