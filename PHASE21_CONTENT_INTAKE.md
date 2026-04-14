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

## 8. T2105 表单顺序与中文说明

脚本文件：

- [scripts/apply_phase21_content_intake_form.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/apply_phase21_content_intake_form.mjs)

表单分组：

| 分组 | 字段 |
|---|---|
| 基础信息 | 资料标题、简短摘要、主主题、所属合集、封面图 |
| 原始来源 | 来源类型、来源平台、原始链接、原始来源标题、作者、原始语言、原始发布时间、来源缩略图 |
| 加工内容 | 摘要标题、摘要正文、摘要附件、音频文件、音频外链、PPT 文件、PPT 外链、视频文件、视频外链 |
| 发布设置 | 会员层级、发布方式、发布时间、内容类型、阅读难度、使用目的、信号等级、会员可见原始来源 |
| 生成状态 | 生成状态、已生成资料包、生成时间、失败原因、创建时间、更新时间 |

这一层只处理后台体验：

- 给 `content_intake` 集合增加中文名称
- 给所有字段增加中文显示名
- 调整字段顺序
- 把字段挂进五个固定分组
- 保留底层英文字段名，不改数据库结构

## 9. T2106 运营者后台可见范围设计

目标：

- 内容运营默认只进入“资料上传台”
- 不要求内容运营理解 `packages`、`sources`、`processed_assets` 和关联表
- 管理员仍保留完整后台视图

### 9.1 角色划分

| 角色 | 主要职责 | 后台可见范围 |
|---|---|---|
| Admin | 系统配置、底层数据修正、权限管理 | 保留全部集合 |
| Editor | 审核、发布、排查生成错误 | 保留 `content_intake` 和底层内容集合 |
| Content Operator | 日常录入资料、上传文件、查看生成结果 | 默认只看 `content_intake` 和文件入口 |

### 9.2 内容运营默认可见入口

内容运营进入后台后，默认只看到：

- `content_intake`
- `directus_files`

默认书签：

- 资料上传台
- 待补资料
- 可生成
- 生成失败
- 已生成

### 9.3 内容运营默认隐藏入口

内容运营默认隐藏这些集合：

- `packages`
- `sources`
- `processed_assets`
- `package_sources`
- `package_topics`
- `package_collections`
- `topics`
- `curated_collections`
- `member_tiers`

理由：

- 这些是底层结构，不属于日常录入界面
- 继续暴露只会让内容运营在后台里来回跳
- 真正需要修底层数据时，应由管理员或编辑角色处理

### 9.4 内容运营在 `content_intake` 的权限范围

| 动作 | 是否允许 | 说明 |
|---|---|---|
| 查看 | 是 | 查看自己需要处理的上传记录 |
| 新增 | 是 | 新建资料上传记录 |
| 修改 | 是 | 修改未归档记录 |
| 删除 | 否 | 初期不允许真实删除，避免误删 |
| 归档 | 是 | 不再处理时归档 |
| 读取生成结果 | 是 | 可看到 `generated_package_id`、`generation_status`、`generation_error` |

### 9.5 文件权限

内容运营可在 `directus_files` 中：

- 上传文件
- 选择文件
- 预览自己上传的文件

但不要求内容运营在文件集合里手动整理目录结构。

### 9.6 后台首页默认体验

内容运营登录后，后台默认落点应为：

- `content_intake` 列表页

列表默认优先显示这些信息：

- 资料标题
- 主主题
- 来源平台
- 发布方式
- 生成状态
- 更新时间

默认不显示底层技术字段，例如：

- `id`
- `generated_package_id`
- 各类文件 UUID

### 9.7 设计边界

T2106 只定义后台“谁看到什么”：

- 不删除底层集合
- 不修改前台读取逻辑
- 不实现生成脚本
- 不替代管理员完整后台

## 10. T2107 生成逻辑映射规则

目标：

- 一条 `content_intake` 记录生成一套可供会员前台读取的底层内容
- 运营者只维护一条上传记录，不手动碰底层集合

### 10.1 总体规则

每条 `content_intake` 在生成时遵循这些固定规则：

1. 生成或复用 1 条 `sources`
2. 生成 1 条 `packages`
3. 生成 1 条主来源关联 `package_sources`
4. 生成 1 条主主题关联 `package_topics`
5. 生成 0 到多条合集关联 `package_collections`
6. 生成至少 1 条 `processed_assets`
7. 成功后回写 `generated_package_id`、`generated_at`、`generation_status`

### 10.2 `sources` 映射规则

`content_intake` 会生成 1 条原始来源记录。

| `content_intake` 字段 | 写入 `sources` 字段 |
|---|---|
| `source_title`，为空时回退到 `title` | `title` |
| `source_type` | `source_type` |
| `source_platform` | `platform` |
| `source_url` | `source_url` |
| `source_author` | `author_name` |
| `source_language`，为空时回退 `en` | `language` |
| `source_published_at` | `published_at` |
| `source_thumbnail_file_id` | `thumbnail_file_id` |
| `summary` | `source_summary` |

固定值：

- `status = active`

### 10.3 `packages` 映射规则

每条上传记录生成 1 条内容包。

| `content_intake` 字段 | 写入 `packages` 字段 |
|---|---|
| 由 `title` 生成 slug | `slug` |
| `title` | `title` |
| `summary` | `summary` |
| `cover_file_id` | `cover_file_id` |
| `primary_topic_id` | `primary_topic_id` |
| `member_tier_id` | `member_tier_id` |
| `package_type` | `package_type` |
| `difficulty` | `difficulty` |
| `use_case` | `use_case` |
| `signal_level` | `signal_level` |
| `publish_start_at` | `publish_start_at` |
| `publish_start_at`，为空时回退生成时间 | `sort_date` |
| `raw_source_visible` | `raw_source_visible` |

固定值：

- `publication_cycle = special`
- `is_featured = false`
- `seo_title = null`
- `seo_description = null`

发布状态映射：

| `content_intake.publish_mode` | 生成后的 `packages.workflow_state` |
|---|---|
| `draft` | `draft` |
| `published` 且 `publish_start_at` 为空 | `published` |
| `published` 且 `publish_start_at` 在未来 | `scheduled` |
| `published` 且 `publish_start_at` 在过去或现在 | `published` |

### 10.4 `package_sources` 映射规则

每条上传记录固定生成 1 条来源关联：

| 字段 | 规则 |
|---|---|
| `package_id` | 新生成的 `packages.id` |
| `source_id` | 当前生成或复用的 `sources.id` |
| `is_primary` | `true` |
| `sort_order` | `1` |

### 10.5 `package_topics` 映射规则

每条上传记录固定生成 1 条主主题关联：

| 字段 | 规则 |
|---|---|
| `package_id` | 新生成的 `packages.id` |
| `topic_id` | `primary_topic_id` |
| `sort_order` | `1` |

T2107 先只处理主主题，不处理附加主题。

### 10.6 `package_collections` 映射规则

`collection_ids` 中每选 1 个合集，就生成 1 条关联：

| 字段 | 规则 |
|---|---|
| `package_id` | 新生成的 `packages.id` |
| `collection_id` | 当前选中的合集 |
| `sort_order` | 按勾选顺序递增，从 `1` 开始 |

如果没有选择合集，则不生成 `package_collections`。

### 10.7 `processed_assets` 映射规则

每条上传记录至少生成 1 条加工资产。

#### 10.7.1 摘要资产

如果满足以下任一条件，就生成 1 条 `brief`：

- `brief_body_markdown` 有值
- `brief_file_id` 有值

映射规则：

| `content_intake` 字段 | 写入 `processed_assets` 字段 |
|---|---|
| `brief_title`，为空时回退 `title + 摘要` | `title` |
| 固定值 | `asset_type = brief` |
| 固定值 | `language = zh` |
| `brief_body_markdown` | `body_markdown` |
| `brief_file_id` | `file_id` |
| 固定值 | `external_url = null` |
| 固定值 | `is_primary = true` |
| 固定值 | `status = active` |
| 固定值 | `sort_order = 1` |

#### 10.7.2 音频资产

如果 `audio_file_id` 或 `audio_external_url` 有值，则生成 1 条 `audio`。

规则：

- `title = title + 音频版`
- `asset_type = audio`
- `language = zh`
- `body_markdown = null`
- `file_id = audio_file_id`
- `external_url = audio_external_url`
- `is_primary = false`
- `status = active`
- `sort_order` 接在摘要后

#### 10.7.3 PPT 资产

如果 `slides_file_id` 或 `slides_external_url` 有值，则生成 1 条 `slides`。

规则：

- `title = title + 幻灯片`
- `asset_type = slides`
- `language = zh`
- `body_markdown = null`
- `file_id = slides_file_id`
- `external_url = slides_external_url`
- `is_primary = false`
- `status = active`
- `sort_order` 接在前一条资产后

#### 10.7.4 视频资产

如果 `video_file_id` 或 `video_external_url` 有值，则生成 1 条 `video`。

规则：

- `title = title + 视频版`
- `asset_type = video`
- `language = zh`
- `body_markdown = null`
- `file_id = video_file_id`
- `external_url = video_external_url`
- `is_primary = false`
- `status = active`
- `sort_order` 接在前一条资产后

### 10.8 最小生成门槛

一条上传记录要进入生成阶段，必须同时满足：

- `title` 有值
- `summary` 有值
- `primary_topic_id` 有值
- `source_type` 有值
- `source_platform` 有值
- `source_url` 有值
- `member_tier_id` 有值
- 至少存在一种加工内容：
  - `brief_body_markdown`
  - `brief_file_id`
  - `audio_file_id`
  - `audio_external_url`
  - `slides_file_id`
  - `slides_external_url`
  - `video_file_id`
  - `video_external_url`

### 10.9 生成成功后的回写规则

生成成功后，回写到 `content_intake`：

| 字段 | 回写内容 |
|---|---|
| `generated_package_id` | 新生成的 `packages.id` |
| `generated_at` | 当前时间 |
| `generation_status` | `generated` |
| `generation_error` | 清空 |

### 10.10 生成失败后的回写规则

只要任一步失败，就回写：

| 字段 | 回写内容 |
|---|---|
| `generation_status` | `failed` |
| `generation_error` | 失败原因 |

T2107 只定义行为，不处理事务回滚。

### 10.11 当前边界

T2107 先不处理这些情况：

- 重复来源复用策略，后置到 T2112
- 同一条上传记录重复生成的幂等保护，后置到 T2109
- 多来源合并到同一内容包
- 多语言资产自动判断
- 自动生成 SEO 字段

## 11. T2108 dry-run 规则

脚本文件：

- [scripts/phase21_content_intake_dry_run.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/phase21_content_intake_dry_run.mjs)

输入：

- `CONTENT_INTAKE_ID`

输出：

- 一份 JSON 报告，默认写到 `artifacts/phase21/content-intake-dry-run.json`
- 终端摘要：当前检查的是哪条上传记录、报告路径、dry-run 状态

行为：

- 读取 1 条 `content_intake`
- 按 T2107 规则生成“计划写入内容”
- 不创建 `sources`
- 不创建 `packages`
- 不创建 `processed_assets`
- 不创建任何关联表记录
- 只输出计划清单和校验结果

dry-run 报告包含：

- 当前 intake 基本信息
- 是否满足最小生成门槛
- 将会创建的 `sources` payload
- 将会创建的 `packages` payload
- 将会创建的 `package_sources` payload
- 将会创建的 `package_topics` payload
- 将会创建的 `package_collections` payload
- 将会创建的 `processed_assets` payload
- 成功/失败时将如何回写 `content_intake`

当前边界：

- 不处理重复来源复用
- 不检查 slug 是否已被占用
- 不做数据库写入
- 不做事务或回滚

## 12. T2109 正式生成脚本

脚本文件：

- [scripts/phase21_content_intake_import.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/phase21_content_intake_import.mjs)

输入：

- `CONTENT_INTAKE_ID`

输出：

- 一份正式生成报告，默认写到 `artifacts/phase21/content-intake-import.json`
- 成功时把底层内容真正写入数据库
- 失败时把错误回写到统一上传台

正式生成规则：

- 如果当前上传记录已经有 `generated_package_id` 且状态是 `generated`，则直接跳过，不重复生成
- 如果生成前校验不通过，则不写底层数据，直接把错误写回 `content_intake`
- 如果来源链接已经存在，则复用已有 `sources`
- 如果即将生成的 `packages.slug` 已存在，则终止生成并回写失败原因
- 生成成功后回写：
  - `generated_package_id`
  - `generated_at`
  - `generation_status = generated`
  - `generation_error = null`

失败处理：

- 生成过程中如果已经创建了部分底层记录，会做尽量清理
- 清理范围只包含这次脚本新建的记录
- 如果复用了已有 `sources`，不会删除已有来源
- 失败时会清空旧的 `generated_package_id` 和 `generated_at`
- 最终仍会把失败原因写回 `content_intake`

当前边界：

- 仍然没有完整事务
- 重复来源复用已经做了最小支持，但更完整的重复来源检测与提示仍后置到 T2112

## 13. T2110 生成结果回写

回写逻辑已收口到统一方法里：

- [scripts/lib/phase21_content_intake.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/lib/phase21_content_intake.mjs)

成功回写：

- `generated_package_id = 新生成的 packages.id`
- `generated_at = 当前时间`
- `generation_status = generated`
- `generation_error = null`

失败回写：

- `generated_package_id = null`
- `generated_at = null`
- `generation_status = failed`
- `generation_error = 失败原因`

当前生成脚本会统一调用这两套回写逻辑：

- [scripts/phase21_content_intake_import.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/phase21_content_intake_import.mjs)

这样后面继续加验证脚本或权限脚本时，只需要检查统一上传台上的这四个字段，不需要重复判断各类分支。

## 14. T2111 最小校验规则

最小校验规则已收口到统一方法里：

- [scripts/lib/phase21_content_intake.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/lib/phase21_content_intake.mjs)

当前会检查这些项目：

| 字段 | 提示 |
|---|---|
| `title` | 请填写资料标题 |
| `summary` | 请填写简短摘要 |
| `primary_topic_id` | 请选择主主题 |
| `member_tier_id` | 请选择会员层级 |
| `source_type` | 请选择来源类型 |
| `source_platform` | 请填写来源平台 |
| `source_url` | 请填写原始链接 |
| 加工内容至少一种 | 请至少提供一种加工内容（摘要、音频、PPT 或视频） |

输出方式：

- dry-run 报告里输出 `validationIssues`
- 正式生成时，如果校验不通过，会把中文错误信息直接写回 `generation_error`

当前边界：

- 这一步只处理“能不能生成”的最低门槛
- 还不做复杂审核流
- 还不做字段格式深度校验，例如链接格式、文件类型、内容质量
