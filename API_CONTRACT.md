# FargeSpace Think Tank API Contract

版本：V1  
日期：2026-04-09  
状态：Frozen

关联文档：
- [PRD.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PRD.md)
- [DATA_MODEL.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/DATA_MODEL.md)
- [PHASE4_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE4_SETUP.md)
- [PHASE5_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE5_SETUP.md)
- [scripts/verify_phase6_contract.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase6_contract.mjs)

## 1. 目的

这份文档只做一件事：

- 在前端开工前冻结可直接使用的接口合同

V1 前台统一对接服务层接口，不直接拼装 Directus 查询。

## 2. 全局规则

### 2.1 可见性规则（所有会员接口强制生效）

只返回满足以下条件的内容包：

1. `workflow_state = published`
2. `publish_start_at` 不为空且 `<= now`
3. `publish_end_at` 为空或 `>= now`

### 2.2 返回时间规则（T605）

统一输出：

- `display_date = publish_start_at ?? sort_date`

前端展示发布时间时，只用 `display_date`。

### 2.3 SEO 回退规则（T606）

详情接口统一输出 `seo` 对象：

- `seo.title = seo_title || title`
- `seo.description = seo_description || summary`

当 `summary` 超过 160 字符时，回退描述截断为 160 字符。

## 3. 接口清单

## 3.1 Package 列表接口（T601）

`GET /api/v1/packages`

用途：

- 首页
- 主题页
- 合集页
- 搜索页

查询参数：

- `page`：页码，默认 `1`
- `limit`：每页条数，默认 `20`，最大 `50`
- `topic`：主题 slug
- `collection`：合集 slug
- `package_type`：`recap|deep_dive|watchlist|toolkit|interview`
- `asset_type`：`brief|audio|slides|video`
- `source_type`：`article|video|podcast|paper|website`
- `published_from`：开始时间（ISO）
- `published_to`：结束时间（ISO）
- `featured`：`true|false`
- `q`：关键词（匹配标题/摘要）

返回结构：

- `items`（数组）
  - `slug`
  - `title`
  - `summary`
  - `cover`
    - `id`
    - `url`
  - `primary_topic`
    - `slug`
    - `name`
  - `package_type`
  - `sort_date`
  - `display_date`
  - `is_featured`
  - `available_asset_types`（去重后的数组）
- `meta`
  - `page`
  - `limit`
  - `total`
  - `has_next`

## 3.2 Package 详情接口（T602）

`GET /api/v1/packages/{slug}`

返回结构：

- `slug`
- `title`
- `summary`
- `cover`
  - `id`
  - `url`
- `package_type`
- `publication_cycle`
- `difficulty`
- `use_case`
- `signal_level`
- `sort_date`
- `publish_start_at`
- `publish_end_at`
- `display_date`
- `is_featured`
- `raw_source_visible`
- `primary_topic`
  - `slug`
  - `name`
- `assets`（按 `sort_order` 升序）
  - `asset_type`
  - `title`
  - `language`
  - `body_markdown`
  - `external_url`
  - `duration_seconds`
  - `sort_order`
  - `is_primary`
- `sources`（按 `sort_order` 升序）
  - `is_primary`
  - `sort_order`
  - `source`
    - `title`
    - `source_type`
    - `platform`
    - `source_url`
    - `language`
    - `published_at`
- `topics`（按 `sort_order` 升序）
  - `slug`
  - `name`
  - `sort_order`
- `collections`（按 `sort_order` 升序）
  - `slug`
  - `name`
  - `collection_type`
  - `sort_order`
- `seo`
  - `title`
  - `description`

## 3.3 搜索接口（T603）

`GET /api/v1/search`

查询参数：

- `q`
- `topic`
- `asset_type`
- `source_type`
- `package_type`
- `published_from`
- `published_to`
- `page`
- `limit`

返回结构：

- 与 `GET /api/v1/packages` 完全一致

约束：

- 搜索接口是列表接口的语义别名，不产生第二套返回结构

## 3.4 Topic 摘要接口（T604）

`GET /api/v1/topics/summary`

返回结构：

- `items`（按 `sort_order` 升序）
  - `slug`
  - `name`
  - `description`
  - `sort_order`

## 3.5 Collection 摘要接口（T604）

`GET /api/v1/collections/summary`

返回结构：

- `items`（按 `sort_order` 升序）
  - `slug`
  - `name`
  - `description`
  - `collection_type`
  - `sort_order`

## 4. 错误返回

统一错误结构：

- `error.code`
- `error.message`

约定状态码：

- `400`：参数不合法
- `401`：未登录
- `403`：无权限
- `404`：资源不存在
- `500`：服务异常

## 5. 兼容性约束

V1 前端只依赖这份合同里声明的字段。

后续新增字段时：

1. 只能新增，不能删减和重命名已冻结字段
2. 需要先更新合同文档再上线
