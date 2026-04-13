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

