#!/usr/bin/env node

import process from "node:process";

const baseUrl = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const adminEmail =
  process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword =
  process.env.DIRECTUS_ADMIN_PASSWORD ?? "phase1-admin-password";

const topicSeeds = [
  { slug: "agents", name: "Agents", description: "与智能体相关的内容", sort_order: 10 },
  { slug: "models", name: "Models", description: "与模型发布和模型能力相关的内容", sort_order: 20 },
  { slug: "reasoning", name: "Reasoning", description: "与推理能力和思考链相关的内容", sort_order: 30 },
  { slug: "tooling", name: "Tooling", description: "与 AI 工具和工具链相关的内容", sort_order: 40 },
  { slug: "workflow", name: "Workflow", description: "与工作流编排和自动化相关的内容", sort_order: 50 },
  { slug: "research", name: "Research", description: "与研究论文和方法论相关的内容", sort_order: 60 },
  { slug: "coding", name: "Coding", description: "与代码生成和开发效率相关的内容", sort_order: 70 },
  { slug: "business", name: "Business", description: "与商业影响和行业策略相关的内容", sort_order: 80 },
  { slug: "voice_ai", name: "Voice AI", description: "与语音交互和音频生成相关的内容", sort_order: 90 },
];

const collectionSeeds = [
  {
    slug: "model-release-observer",
    name: "模型发布观察",
    description: "持续整理重要模型发布与能力变化。",
    collection_type: "special",
    sort_order: 10,
  },
  {
    slug: "agentic-ai-watch",
    name: "Agentic AI Watch",
    description: "围绕 Agent、工具调用与自动化能力的持续观察。",
    collection_type: "special",
    sort_order: 20,
  },
  {
    slug: "ai-product-and-ecosystem",
    name: "AI 产品与生态",
    description: "关注平台合作、生态布局与产品演进。",
    collection_type: "special",
    sort_order: 30,
  },
  {
    slug: "developer-tooling-tracker",
    name: "开发者工具追踪",
    description: "聚焦开发者使用的模型、SDK、工作台与工具链。",
    collection_type: "special",
    sort_order: 40,
  },
  {
    slug: "ai-usage-and-trends",
    name: "AI 使用与趋势",
    description: "围绕 AI 使用情况、 adoption 与趋势变化的长期记录。",
    collection_type: "monthly",
    sort_order: 50,
  },
  {
    slug: "research-paper-selection",
    name: "研究与论文精选",
    description: "按主题沉淀值得持续回看的研究与论文。",
    collection_type: "special",
    sort_order: 60,
  },
  {
    slug: "ai-industry-applications",
    name: "AI 行业应用",
    description: "整理 AI 在行业中的落地案例与应用观察。",
    collection_type: "special",
    sort_order: 70,
  },
  {
    slug: "ai-summit-video-selection",
    name: "AI 峰会视频精选",
    description: "汇总值得看的峰会演讲、访谈和视频内容。",
    collection_type: "special",
    sort_order: 80,
  },
];

const memberTierSeed = {
  code: "standard_member",
  name: "标准会员",
  description: "V1 默认会员层级。",
  status: "active",
};

function dropdownChoices(values) {
  return {
    choices: values.map((value) => ({ text: value, value })),
    allowNone: false,
  };
}

function uuidPrimaryKey() {
  return {
    field: "id",
    type: "uuid",
    meta: {
      special: ["uuid"],
      interface: "input",
      hidden: true,
      readonly: true,
      width: "full",
    },
    schema: {
      is_primary_key: true,
      is_nullable: false,
      is_unique: true,
    },
  };
}

function stringField(field, { maxLength = 255, required = false, unique = false, indexed = false, note = null, width = "full", options = null } = {}) {
  return {
    field,
    type: "string",
    meta: {
      interface: options ? "input-dropdown" : "input",
      options,
      required,
      note,
      width,
    },
    schema: {
      is_nullable: !required,
      max_length: maxLength,
      is_unique: unique,
      is_indexed: indexed,
    },
  };
}

function textField(field, { required = false, note = null } = {}) {
  return {
    field,
    type: "text",
    meta: {
      interface: "input-multiline",
      required,
      note,
      width: "full",
    },
    schema: {
      is_nullable: !required,
    },
  };
}

function integerField(field, { required = false, indexed = false, defaultValue = null, note = null, width = "half" } = {}) {
  return {
    field,
    type: "integer",
    meta: {
      interface: "numeric",
      required,
      note,
      width,
    },
    schema: {
      is_nullable: !required,
      is_indexed: indexed,
      default_value: defaultValue,
    },
  };
}

function booleanField(field, { defaultValue = false, note = null, width = "half" } = {}) {
  return {
    field,
    type: "boolean",
    meta: {
      special: ["cast-boolean"],
      interface: "boolean",
      display: "boolean",
      note,
      width,
    },
    schema: {
      is_nullable: false,
      default_value: defaultValue,
    },
  };
}

function timestampField(field, { required = false, indexed = false, special = [], readonly = false, note = null, width = "half" } = {}) {
  return {
    field,
    type: "timestamp",
    meta: {
      special,
      interface: "datetime",
      display: "datetime",
      readonly,
      note,
      width,
    },
    schema: {
      is_nullable: !required,
      is_indexed: indexed,
      default_value: special.includes("date-created") ? "CURRENT_TIMESTAMP" : null,
    },
  };
}

function fileField(field, { note = null, image = false } = {}) {
  return {
    field,
    type: "uuid",
    meta: {
      special: ["file"],
      interface: image ? "file-image" : "file",
      display: "file",
      note,
      width: "full",
    },
    schema: {
      is_nullable: true,
    },
  };
}

function relationField(field, { required = false, note = null, width = "full", template = null, indexed = true } = {}) {
  return {
    field,
    type: "uuid",
    meta: {
      special: ["m2o"],
      interface: "select-dropdown-m2o",
      display: template ? "related-values" : null,
      display_options: template ? { template } : null,
      required,
      note,
      width,
    },
    schema: {
      is_nullable: !required,
      is_indexed: indexed,
    },
  };
}

function aliasO2MField(field, template) {
  return {
    field,
    type: "alias",
    meta: {
      special: ["o2m"],
      interface: "list-o2m",
      options: {
        template,
      },
      width: "full",
    },
  };
}

const collections = [
  {
    collection: "member_tiers",
    meta: {
      icon: "card_membership",
      note: "会员层级",
      display_template: "{{name}}",
      archive_field: "status",
      archive_value: "archived",
      unarchive_value: "active",
      sort_field: "name",
    },
    fields: [
      uuidPrimaryKey(),
      stringField("code", { maxLength: 80, required: true, unique: true, indexed: true, note: "会员层级唯一代码", width: "half" }),
      stringField("name", { maxLength: 120, required: true, note: "会员层级名称", width: "half" }),
      textField("description", { note: "会员层级说明" }),
      stringField("status", { maxLength: 32, required: true, options: dropdownChoices(["active", "archived"]), note: "状态", width: "half" }),
      aliasO2MField("packages", "{{title}}"),
      timestampField("created_at", { required: true, special: ["date-created"], readonly: true }),
      timestampField("updated_at", { required: false, special: ["date-updated"], readonly: true }),
    ],
  },
  {
    collection: "topics",
    meta: {
      icon: "hub",
      note: "启动主题",
      display_template: "{{name}}",
      archive_field: "status",
      archive_value: "archived",
      unarchive_value: "active",
      sort_field: "sort_order",
    },
    fields: [
      uuidPrimaryKey(),
      stringField("slug", { maxLength: 120, required: true, unique: true, indexed: true, width: "half" }),
      stringField("name", { maxLength: 120, required: true, width: "half" }),
      textField("description"),
      integerField("sort_order", { required: true, indexed: true, defaultValue: 0 }),
      stringField("status", { maxLength: 32, required: true, options: dropdownChoices(["active", "archived"]), width: "half" }),
      aliasO2MField("package_links", "{{package_id.title}}"),
      timestampField("created_at", { required: true, special: ["date-created"], readonly: true }),
      timestampField("updated_at", { required: false, special: ["date-updated"], readonly: true }),
    ],
  },
  {
    collection: "curated_collections",
    meta: {
      icon: "collections_bookmark",
      note: "固定策展合集",
      display_template: "{{name}}",
      archive_field: "status",
      archive_value: "archived",
      unarchive_value: "active",
      sort_field: "sort_order",
    },
    fields: [
      uuidPrimaryKey(),
      stringField("slug", { maxLength: 160, required: true, unique: true, indexed: true, width: "half" }),
      stringField("name", { maxLength: 180, required: true, width: "half" }),
      textField("description"),
      stringField("collection_type", { maxLength: 32, required: true, options: dropdownChoices(["weekly", "monthly", "special"]), width: "half" }),
      fileField("cover_file_id", { note: "合集封面", image: true }),
      integerField("sort_order", { required: true, indexed: true, defaultValue: 0 }),
      stringField("status", { maxLength: 32, required: true, options: dropdownChoices(["active", "archived"]), width: "half" }),
      aliasO2MField("package_links", "{{package_id.title}}"),
      timestampField("created_at", { required: true, special: ["date-created"], readonly: true }),
      timestampField("updated_at", { required: false, special: ["date-updated"], readonly: true }),
    ],
  },
  {
    collection: "sources",
    meta: {
      icon: "link",
      note: "原始来源",
      display_template: "{{title}}",
      archive_field: "status",
      archive_value: "archived",
      unarchive_value: "active",
      sort_field: "published_at",
    },
    fields: [
      uuidPrimaryKey(),
      stringField("title", { required: true }),
      stringField("source_type", { maxLength: 32, required: true, options: dropdownChoices(["article", "video", "podcast", "paper", "website"]), width: "half" }),
      stringField("platform", { maxLength: 100, required: true, indexed: true, width: "half" }),
      stringField("source_url", { maxLength: 500, required: true, unique: true, indexed: true, note: "原始来源链接" }),
      stringField("author_name", { maxLength: 150, width: "half" }),
      stringField("language", { maxLength: 16, required: true, options: dropdownChoices(["en", "zh", "other"]), width: "half" }),
      timestampField("published_at", { indexed: true }),
      fileField("thumbnail_file_id", { note: "来源封面", image: true }),
      textField("source_summary", { note: "内部摘要，不直接暴露给会员" }),
      stringField("status", { maxLength: 32, required: true, options: dropdownChoices(["active", "archived"]), width: "half" }),
      aliasO2MField("package_links", "{{package_id.title}}"),
      timestampField("created_at", { required: true, special: ["date-created"], readonly: true }),
      timestampField("updated_at", { required: false, special: ["date-updated"], readonly: true }),
    ],
  },
  {
    collection: "packages",
    meta: {
      icon: "auto_stories",
      note: "会员实际浏览的内容包",
      display_template: "{{title}}",
      archive_field: "workflow_state",
      archive_value: "archived",
      unarchive_value: "draft",
      sort_field: "sort_date",
    },
    fields: [
      uuidPrimaryKey(),
      stringField("slug", { maxLength: 180, required: true, unique: true, indexed: true, width: "half" }),
      stringField("title", { required: true, width: "half" }),
      textField("summary", { required: true, note: "内容包摘要" }),
      fileField("cover_file_id", { note: "内容包封面", image: true }),
      relationField("primary_topic_id", { required: true, template: "{{name}}", width: "half", note: "首页和详情页使用的主主题" }),
      relationField("member_tier_id", { required: true, template: "{{name}}", width: "half", note: "V1 仅有标准会员" }),
      stringField("package_type", { maxLength: 32, required: true, indexed: true, options: dropdownChoices(["recap", "deep_dive", "watchlist", "toolkit", "interview"]), width: "half" }),
      stringField("publication_cycle", { maxLength: 32, options: dropdownChoices(["weekly", "monthly", "special"]), width: "half" }),
      stringField("difficulty", { maxLength: 32, required: true, options: dropdownChoices(["beginner", "intermediate", "advanced"]), width: "half" }),
      stringField("use_case", { maxLength: 32, required: true, options: dropdownChoices(["awareness", "strategy", "tooling", "workflow", "research"]), width: "half" }),
      stringField("signal_level", { maxLength: 32, required: true, options: dropdownChoices(["high_signal", "reference", "archive"]), width: "half" }),
      stringField("workflow_state", { maxLength: 32, required: true, indexed: true, options: dropdownChoices(["draft", "review", "approved", "scheduled", "published", "archived"]), width: "half" }),
      timestampField("publish_start_at", { indexed: true, note: "会员可见起始时间" }),
      timestampField("publish_end_at", { note: "会员可见结束时间" }),
      booleanField("is_featured", { defaultValue: false, note: "首页重点内容" }),
      timestampField("sort_date", { required: true, indexed: true, note: "前台排序时间" }),
      booleanField("raw_source_visible", { defaultValue: true, note: "是否显示原始来源信息" }),
      stringField("seo_title", { maxLength: 255 }),
      textField("seo_description"),
      aliasO2MField("assets", "{{title}}"),
      aliasO2MField("source_links", "{{source_id.title}}"),
      aliasO2MField("topic_links", "{{topic_id.name}}"),
      aliasO2MField("collection_links", "{{collection_id.name}}"),
      timestampField("created_at", { required: true, special: ["date-created"], readonly: true }),
      timestampField("updated_at", { required: false, special: ["date-updated"], readonly: true }),
    ],
  },
  {
    collection: "processed_assets",
    meta: {
      icon: "library_books",
      note: "会员实际消费的加工内容",
      display_template: "{{title}}",
      archive_field: "status",
      archive_value: "archived",
      unarchive_value: "active",
      sort_field: "sort_order",
    },
    fields: [
      uuidPrimaryKey(),
      relationField("package_id", { required: true, template: "{{title}}", width: "full" }),
      stringField("asset_type", { maxLength: 32, required: true, indexed: true, options: dropdownChoices(["brief", "audio", "slides", "video"]), width: "half" }),
      stringField("title", { required: true, width: "half" }),
      stringField("language", { maxLength: 16, required: true, options: dropdownChoices(["zh", "en", "other"]), width: "half" }),
      textField("body_markdown", { note: "文字摘要正文" }),
      fileField("file_id", { note: "上传后的资产文件" }),
      stringField("external_url", { maxLength: 500, note: "外部视频或文档链接" }),
      integerField("duration_seconds", { width: "half" }),
      integerField("sort_order", { required: true, indexed: true, defaultValue: 1, width: "half" }),
      booleanField("is_primary", { defaultValue: false, note: "同一个内容包的主要资产" }),
      stringField("status", { maxLength: 32, required: true, options: dropdownChoices(["active", "archived"]), width: "half" }),
      timestampField("created_at", { required: true, special: ["date-created"], readonly: true }),
      timestampField("updated_at", { required: false, special: ["date-updated"], readonly: true }),
    ],
  },
  {
    collection: "package_sources",
    meta: {
      icon: "device_hub",
      note: "内容包与来源的关联",
      display_template: "{{package_id.title}} -> {{source_id.title}}",
      hidden: true,
      sort_field: "sort_order",
    },
    fields: [
      uuidPrimaryKey(),
      relationField("package_id", { required: true, template: "{{title}}", width: "half" }),
      relationField("source_id", { required: true, template: "{{title}}", width: "half" }),
      booleanField("is_primary", { defaultValue: false, note: "是否主来源" }),
      integerField("sort_order", { required: true, indexed: true, defaultValue: 1 }),
      timestampField("created_at", { required: true, special: ["date-created"], readonly: true }),
    ],
  },
  {
    collection: "package_topics",
    meta: {
      icon: "device_hub",
      note: "内容包与主题的关联",
      display_template: "{{package_id.title}} -> {{topic_id.name}}",
      hidden: true,
      sort_field: "sort_order",
    },
    fields: [
      uuidPrimaryKey(),
      relationField("package_id", { required: true, template: "{{title}}", width: "half" }),
      relationField("topic_id", { required: true, template: "{{name}}", width: "half" }),
      integerField("sort_order", { required: true, indexed: true, defaultValue: 1 }),
      timestampField("created_at", { required: true, special: ["date-created"], readonly: true }),
    ],
  },
  {
    collection: "package_collections",
    meta: {
      icon: "device_hub",
      note: "内容包与合集的关联",
      display_template: "{{package_id.title}} -> {{collection_id.name}}",
      hidden: true,
      sort_field: "sort_order",
    },
    fields: [
      uuidPrimaryKey(),
      relationField("package_id", { required: true, template: "{{title}}", width: "half" }),
      relationField("collection_id", { required: true, template: "{{name}}", width: "half" }),
      integerField("sort_order", { required: true, indexed: true, defaultValue: 1 }),
      timestampField("created_at", { required: true, special: ["date-created"], readonly: true }),
    ],
  },
];

const relations = [
  {
    collection: "packages",
    field: "primary_topic_id",
    related_collection: "topics",
    one_field: null,
    on_delete: "RESTRICT",
  },
  {
    collection: "packages",
    field: "member_tier_id",
    related_collection: "member_tiers",
    one_field: "packages",
    on_delete: "RESTRICT",
  },
  {
    collection: "processed_assets",
    field: "package_id",
    related_collection: "packages",
    one_field: "assets",
    on_delete: "CASCADE",
  },
  {
    collection: "package_sources",
    field: "package_id",
    related_collection: "packages",
    one_field: "source_links",
    on_delete: "CASCADE",
  },
  {
    collection: "package_sources",
    field: "source_id",
    related_collection: "sources",
    one_field: "package_links",
    on_delete: "CASCADE",
  },
  {
    collection: "package_topics",
    field: "package_id",
    related_collection: "packages",
    one_field: "topic_links",
    on_delete: "CASCADE",
  },
  {
    collection: "package_topics",
    field: "topic_id",
    related_collection: "topics",
    one_field: "package_links",
    on_delete: "CASCADE",
  },
  {
    collection: "package_collections",
    field: "package_id",
    related_collection: "packages",
    one_field: "collection_links",
    on_delete: "CASCADE",
  },
  {
    collection: "package_collections",
    field: "collection_id",
    related_collection: "curated_collections",
    one_field: "package_links",
    on_delete: "CASCADE",
  },
  {
    collection: "sources",
    field: "thumbnail_file_id",
    related_collection: "directus_files",
    one_field: null,
    on_delete: "SET NULL",
  },
  {
    collection: "packages",
    field: "cover_file_id",
    related_collection: "directus_files",
    one_field: null,
    on_delete: "SET NULL",
  },
  {
    collection: "curated_collections",
    field: "cover_file_id",
    related_collection: "directus_files",
    one_field: null,
    on_delete: "SET NULL",
  },
  {
    collection: "processed_assets",
    field: "file_id",
    related_collection: "directus_files",
    one_field: null,
    on_delete: "SET NULL",
  },
];

async function api(path, { method = "GET", token, body, allow404 = false } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (allow404 && response.status === 404) return null;

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${method} ${path} failed: ${response.status} ${text}`);
  }

  return payload;
}

async function login() {
  const payload = await api("/auth/login", {
    method: "POST",
    body: { email: adminEmail, password: adminPassword },
  });
  return payload.data.access_token;
}

async function assertCleanDatabase(token) {
  const payload = await api("/collections", { token });
  const customCollections = payload.data
    .map((entry) => entry.collection)
    .filter((name) => !name.startsWith("directus_"));

  if (customCollections.length > 0) {
    throw new Error(
      `当前数据库不是空的，存在自定义集合：${customCollections.join(", ")}。请先重置本地数据库，再执行 Phase 2。`
    );
  }
}

async function createCollections(token) {
  for (const definition of collections) {
    await api("/collections", {
      method: "POST",
      token,
      body: {
        collection: definition.collection,
        meta: definition.meta,
        schema: {
          name: definition.collection,
        },
        fields: definition.fields,
      },
    });
    console.log(`created collection: ${definition.collection}`);
  }
}

async function createRelations(token) {
  for (const relation of relations) {
    await api("/relations", {
      method: "POST",
      token,
      body: {
        collection: relation.collection,
        field: relation.field,
        related_collection: relation.related_collection,
        schema: {
          table: relation.collection,
          column: relation.field,
          foreign_key_table: relation.related_collection,
          foreign_key_column: "id",
          on_delete: relation.on_delete,
        },
        meta: {
          many_collection: relation.collection,
          many_field: relation.field,
          one_collection: relation.related_collection,
          one_field: relation.one_field,
          one_deselect_action: "nullify",
        },
      },
    });
    console.log(
      `created relation: ${relation.collection}.${relation.field} -> ${relation.related_collection}`
    );
  }
}

async function seedCollection(token, collection, records, uniqueField) {
  for (const record of records) {
    const existing = await api(
      `/items/${collection}?filter[${uniqueField}][_eq]=${encodeURIComponent(
        record[uniqueField]
      )}&limit=1`,
      { token }
    );
    if (existing.data.length > 0) continue;
    await api(`/items/${collection}`, {
      method: "POST",
      token,
      body: record,
    });
    console.log(`seeded ${collection}: ${record[uniqueField]}`);
  }
}

async function main() {
  const token = await login();
  await assertCleanDatabase(token);
  await createCollections(token);
  await createRelations(token);

  await seedCollection(token, "topics", topicSeeds.map((item) => ({ ...item, status: "active" })), "slug");
  await seedCollection(
    token,
    "curated_collections",
    collectionSeeds.map((item) => ({ ...item, status: "active" })),
    "slug"
  );
  await seedCollection(token, "member_tiers", [memberTierSeed], "code");

  console.log("phase 2 schema applied");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
