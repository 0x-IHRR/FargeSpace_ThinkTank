# AI-FORGE Phase 21 内容运营统一上传台

版本：V1
日期：2026-04-13
状态：Draft

关联文件：

- [TODO.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/TODO.md)
- [DATA_MODEL.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/DATA_MODEL.md)
- [PHASE11_UPLOAD_FLOW.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE11_UPLOAD_FLOW.md)
- [PHASE12_EDITORIAL_FLOW.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE12_EDITORIAL_FLOW.md)

## 1. 目标

Phase 21 只解决一个后台体验问题：

- 内容运营者不再需要分别进入 `packages`、`sources`、`processed_assets` 和多个关联表
- 内容运营者只进入一个“资料上传台”，一次填完资料信息
- 系统后续自动把这条资料拆到底层集合

底层结构继续保留，因为前台筛选、详情页、来源追踪、权限控制仍然需要这些结构。

## 2. T2101 字段清单

### 2.1 基础信息

| 字段 | 后台展示名 | 必填 | 说明 |
|---|---|---|---|
| `title` | 资料标题 | 是 | 用户最终看到的资料包标题 |
| `summary` | 简短摘要 | 是 | 用于前台卡片和详情页头部 |
| `primary_topic_id` | 主主题 | 是 | 用于前台主分类 |
| `collection_ids` | 所属合集 | 否 | 可多选，用于专题归档 |
| `cover_file_id` | 封面图 | 否 | 用于后续预览卡片 |

### 2.2 原始来源

| 字段 | 后台展示名 | 必填 | 说明 |
|---|---|---|---|
| `source_type` | 来源类型 | 是 | article / video / podcast / paper / website |
| `source_platform` | 来源平台 | 是 | 例如 YouTube、OpenAI Docs、arXiv |
| `source_url` | 原始链接 | 是 | 原始文章、视频、播客或文档链接 |
| `source_title` | 原始来源标题 | 否 | 不填时默认用资料标题 |
| `source_author` | 作者 | 否 | 原始来源作者或机构 |
| `source_language` | 原始语言 | 否 | 默认 `en` |
| `source_published_at` | 原始发布时间 | 否 | 不清楚可以先不填 |
| `source_thumbnail_file_id` | 来源缩略图 | 否 | 可用于后续来源卡片展示 |

### 2.3 加工内容

| 字段 | 后台展示名 | 必填 | 说明 |
|---|---|---|---|
| `brief_title` | 摘要标题 | 否 | 不填时默认用“精读摘要” |
| `brief_body_markdown` | 摘要正文 | 否 | 文字摘要；和摘要附件至少填一个 |
| `brief_file_id` | 摘要附件 | 否 | PDF、Markdown 或其它摘要文件 |
| `audio_file_id` | 音频文件 | 否 | 上传自有音频 |
| `audio_external_url` | 音频外链 | 否 | 外部音频地址 |
| `slides_file_id` | PPT 文件 | 否 | 上传 PPT 或 PDF |
| `slides_external_url` | PPT 外链 | 否 | 外部文档地址 |
| `video_file_id` | 视频文件 | 否 | 上传自有视频 |
| `video_external_url` | 视频外链 | 否 | YouTube 等视频地址 |

最小要求：

- `brief_body_markdown`、`brief_file_id`、`audio_file_id`、`audio_external_url`、`slides_file_id`、`slides_external_url`、`video_file_id`、`video_external_url` 至少填一个
- 如果只是收录 YouTube 视频，先填 `source_url` 和 `video_external_url`
- 如果中国境内用户需要稳定访问，建议后续上传自有视频文件或可访问的视频外链

### 2.4 发布设置

| 字段 | 后台展示名 | 必填 | 说明 |
|---|---|---|---|
| `publish_mode` | 发布方式 | 是 | 保存草稿 / 直接发布 |
| `publish_start_at` | 发布时间 | 否 | 直接发布时可自动填当前时间 |
| `member_tier_id` | 会员层级 | 是 | 默认标准会员 |
| `package_type` | 内容类型 | 是 | recap / deep_dive / watchlist / toolkit / interview |
| `difficulty` | 阅读难度 | 否 | 默认 intermediate |
| `use_case` | 使用目的 | 否 | 默认 research |
| `signal_level` | 信号等级 | 否 | 默认 reference |
| `raw_source_visible` | 会员可见原始来源 | 否 | 默认可见 |

### 2.5 生成状态

| 字段 | 后台展示名 | 必填 | 说明 |
|---|---|---|---|
| `generation_status` | 生成状态 | 是 | draft / ready / generated / failed / archived |
| `generated_package_id` | 已生成资料包 | 否 | 成功后回写 |
| `generated_at` | 生成时间 | 否 | 成功后回写 |
| `generation_error` | 失败原因 | 否 | 失败后给运营者看 |

## 3. 运营者最小填写方式

### 3.1 只收录 YouTube 视频

最少填写：

- 资料标题
- 简短摘要
- 主主题
- 来源类型：video
- 来源平台：YouTube
- 原始链接：YouTube URL
- 视频外链：YouTube URL
- 发布方式：保存草稿或直接发布

### 3.2 上传自有 PPT

最少填写：

- 资料标题
- 简短摘要
- 主主题
- 来源类型
- 来源平台
- 原始链接
- PPT 文件
- 发布方式

### 3.3 只写中文摘要

最少填写：

- 资料标题
- 简短摘要
- 主主题
- 来源类型
- 来源平台
- 原始链接
- 摘要正文
- 发布方式

## 4. 不给运营者展示的底层细节

统一上传台不要求运营者理解：

- `package_sources`
- `package_topics`
- `package_collections`
- `processed_assets.sort_order`
- `processed_assets.language`
- `sources.status`
- `packages.workflow_state`

这些由后续生成逻辑自动处理。

## 5. T2102 状态流

统一上传台有自己的状态，不直接替换 `packages.workflow_state`。

### 5.1 状态定义

| 状态 | 后台展示名 | 含义 | 运营者下一步 |
|---|---|---|---|
| `draft` | 草稿 | 资料还在填写，系统不会生成前台内容包 | 继续补字段 |
| `ready` | 可生成 | 最小字段已齐，可以生成资料包 | 点击生成或等待自动生成 |
| `generated` | 已生成 | 已经生成到底层内容包 | 打开生成的资料包检查 |
| `failed` | 生成失败 | 生成过程失败，错误会写入 `generation_error` | 按错误提示修改后重新生成 |
| `archived` | 已归档 | 这条上传记录不再处理 | 保留记录，不继续生成 |

### 5.2 推荐状态顺序

1. 新建记录默认是 `draft`
2. 必填字段齐全后改为 `ready`
3. 生成成功后系统改为 `generated`
4. 生成失败后系统改为 `failed`
5. 不再处理时人工改为 `archived`

### 5.3 允许的状态变化

| 当前状态 | 允许变为 |
|---|---|
| `draft` | `ready`、`archived` |
| `ready` | `generated`、`failed`、`archived` |
| `failed` | `ready`、`archived` |
| `generated` | `archived` |
| `archived` | 不建议恢复；如需恢复，复制一条新记录 |

### 5.4 与前台发布状态的关系

`content_intake.generation_status` 只代表“统一上传台这条记录是否已经生成成功”。

`packages.workflow_state` 才代表“前台内容包能否被会员看到”。

生成时的映射规则：

| 上传台发布方式 | 生成后的 `packages.workflow_state` |
|---|---|
| 保存草稿 | `draft` |
| 直接发布 | `published` |

### 5.5 失败处理

生成失败时必须回写：

- `generation_status = failed`
- `generation_error = 具体失败原因`

运营者看到错误后，只需要回到统一上传台修改当前记录，不需要去底层集合手动修。

## 6. T2103 `content_intake` 集合设计

`content_intake` 是给内容运营者使用的统一入口集合。

前台不读取这个集合。前台仍读取生成后的 `packages`、`sources`、`processed_assets` 和关联集合。

### 6.1 集合定位

| 项目 | 设计 |
|---|---|
| 集合名 | `content_intake` |
| 后台展示名 | 资料上传台 |
| 用途 | 一次填写资料信息，后续自动生成前台内容包 |
| 是否给会员前台读取 | 否 |
| 是否替代底层集合 | 否 |
| 是否允许运营者删除 | 初期不建议，优先归档 |

### 6.2 字段设计

| 字段名 | 类型 | 必填 | 默认值 | 后台展示名 |
|---|---|---|---|---|
| `id` | UUID | 是 | 自动生成 | ID |
| `title` | String(255) | 是 | 无 | 资料标题 |
| `summary` | Text | 是 | 无 | 简短摘要 |
| `primary_topic_id` | Many-to-One `topics` | 是 | 无 | 主主题 |
| `collection_ids` | Many-to-Many `curated_collections` | 否 | 无 | 所属合集 |
| `cover_file_id` | File | 否 | 无 | 封面图 |
| `source_type` | Enum | 是 | `article` | 来源类型 |
| `source_platform` | String(100) | 是 | 无 | 来源平台 |
| `source_url` | String(500) | 是 | 无 | 原始链接 |
| `source_title` | String(255) | 否 | 无 | 原始来源标题 |
| `source_author` | String(150) | 否 | 无 | 作者 |
| `source_language` | Enum | 否 | `en` | 原始语言 |
| `source_published_at` | Datetime | 否 | 无 | 原始发布时间 |
| `source_thumbnail_file_id` | File | 否 | 无 | 来源缩略图 |
| `brief_title` | String(255) | 否 | 无 | 摘要标题 |
| `brief_body_markdown` | Long Text | 否 | 无 | 摘要正文 |
| `brief_file_id` | File | 否 | 无 | 摘要附件 |
| `audio_file_id` | File | 否 | 无 | 音频文件 |
| `audio_external_url` | String(500) | 否 | 无 | 音频外链 |
| `slides_file_id` | File | 否 | 无 | PPT 文件 |
| `slides_external_url` | String(500) | 否 | 无 | PPT 外链 |
| `video_file_id` | File | 否 | 无 | 视频文件 |
| `video_external_url` | String(500) | 否 | 无 | 视频外链 |
| `publish_mode` | Enum | 是 | `draft` | 发布方式 |
| `publish_start_at` | Datetime | 否 | 无 | 发布时间 |
| `member_tier_id` | Many-to-One `member_tiers` | 是 | 默认会员层级 | 会员层级 |
| `package_type` | Enum | 是 | `recap` | 内容类型 |
| `difficulty` | Enum | 是 | `intermediate` | 阅读难度 |
| `use_case` | Enum | 是 | `research` | 使用目的 |
| `signal_level` | Enum | 是 | `reference` | 信号等级 |
| `raw_source_visible` | Boolean | 是 | `true` | 会员可见原始来源 |
| `generation_status` | Enum | 是 | `draft` | 生成状态 |
| `generated_package_id` | Many-to-One `packages` | 否 | 无 | 已生成资料包 |
| `generated_at` | Datetime | 否 | 无 | 生成时间 |
| `generation_error` | Text | 否 | 无 | 失败原因 |
| `created_at` | Datetime | 是 | 自动生成 | 创建时间 |
| `updated_at` | Datetime | 是 | 自动生成 | 更新时间 |

### 6.3 枚举值

| 字段 | 可选值 |
|---|---|
| `source_type` | `article` / `video` / `podcast` / `paper` / `website` |
| `source_language` | `en` / `zh` / `other` |
| `publish_mode` | `draft` / `published` |
| `package_type` | `recap` / `deep_dive` / `watchlist` / `toolkit` / `interview` |
| `difficulty` | `beginner` / `intermediate` / `advanced` |
| `use_case` | `awareness` / `strategy` / `tooling` / `workflow` / `research` |
| `signal_level` | `high_signal` / `reference` / `archive` |
| `generation_status` | `draft` / `ready` / `generated` / `failed` / `archived` |

### 6.4 字段映射摘要

| `content_intake` 字段 | 生成到哪里 |
|---|---|
| `title`、`summary`、`cover_file_id`、`primary_topic_id`、`member_tier_id`、`package_type`、`difficulty`、`use_case`、`signal_level`、`raw_source_visible` | `packages` |
| `source_type`、`source_platform`、`source_url`、`source_title`、`source_author`、`source_language`、`source_published_at`、`source_thumbnail_file_id` | `sources` |
| `brief_*`、`audio_*`、`slides_*`、`video_*` | `processed_assets` |
| `source_url` 对应的来源和生成后的内容包 | `package_sources` |
| `primary_topic_id` | `package_topics` |
| `collection_ids` | `package_collections` |
| `generated_package_id`、`generated_at`、`generation_status`、`generation_error` | 回写到 `content_intake` |

### 6.5 设计边界

`content_intake` 不处理这些事情：

- 不让前台直接读取
- 不取代 `packages`
- 不让运营者手动管理多对多关联表
- 不在 T2103 阶段处理重复来源复用
- 不在 T2103 阶段处理自动生成逻辑

## 7. T2104 Directus 建表脚本

脚本文件：

- [scripts/apply_phase21_content_intake.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/apply_phase21_content_intake.mjs)

脚本负责创建或补齐这些对象：

- `content_intake`
- `content_intake_collections`
- `content_intake.primary_topic_id -> topics`
- `content_intake.member_tier_id -> member_tiers`
- `content_intake.generated_package_id -> packages`
- `content_intake` 上的所有文件字段到 `directus_files`
- `content_intake_collections.content_intake_id -> content_intake`
- `content_intake_collections.collection_id -> curated_collections`

脚本边界：

- 只建集合、字段、关系和必要说明
- 不执行内容生成
- 不创建 `packages`、`sources`、`processed_assets` 的写入逻辑
- 支持重复执行：已存在则更新集合/字段，关系已存在则跳过
