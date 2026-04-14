#!/usr/bin/env node

import process from "node:process";

import { loginAdmin, request } from "./lib/phase5_directus.mjs";

function dropdownChoices(values, { allowNone = false } = {}) {
  return {
    choices: values.map((value) => ({ text: value, value })),
    allowNone,
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

function stringField(
  field,
  {
    maxLength = 255,
    required = false,
    unique = false,
    indexed = false,
    note = null,
    width = "full",
    options = null,
    defaultValue = null,
  } = {}
) {
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
      default_value: defaultValue,
    },
  };
}

function textField(field, { required = false, note = null, width = "full" } = {}) {
  return {
    field,
    type: "text",
    meta: {
      interface: "input-multiline",
      required,
      note,
      width,
    },
    schema: {
      is_nullable: !required,
    },
  };
}

function integerField(
  field,
  { required = false, indexed = false, defaultValue = null, note = null, width = "half" } = {}
) {
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

function timestampField(
  field,
  { required = false, indexed = false, special = [], readonly = false, note = null, width = "half" } = {}
) {
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

function fileField(field, { note = null, image = false, width = "full" } = {}) {
  return {
    field,
    type: "uuid",
    meta: {
      special: ["file"],
      interface: image ? "file-image" : "file",
      display: "file",
      note,
      width,
    },
    schema: {
      is_nullable: true,
    },
  };
}

function relationField(
  field,
  { required = false, note = null, width = "full", template = null, indexed = true } = {}
) {
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

function aliasO2MField(field, template, { note = null, width = "full" } = {}) {
  return {
    field,
    type: "alias",
    meta: {
      special: ["o2m"],
      interface: "list-o2m",
      options: {
        template,
      },
      note,
      width,
    },
  };
}

const collections = [
  {
    collection: "content_intake",
    meta: {
      icon: "upload_file",
      note: "给内容运营者使用的统一上传入口；后续由生成脚本拆分到底层内容集合。",
      display_template: "{{title}}",
      archive_field: "generation_status",
      archive_value: "archived",
      unarchive_value: "draft",
      sort_field: "updated_at",
    },
    fields: [
      uuidPrimaryKey(),
      stringField("title", {
        required: true,
        note: "资料标题；后续会生成会员前台看到的内容包标题。",
      }),
      textField("summary", {
        required: true,
        note: "简短摘要；用于后续生成内容包导语。",
      }),
      relationField("primary_topic_id", {
        required: true,
        template: "{{name}}",
        width: "half",
        note: "主主题；前台主分类会从这里生成。",
      }),
      relationField("member_tier_id", {
        required: true,
        template: "{{name}}",
        width: "half",
        note: "会员层级；决定最终谁可以看到这份资料。",
      }),
      aliasO2MField("collection_ids", "{{collection_id.name}}", {
        note: "所属合集；这里填写后会生成内容包和合集之间的关联。",
      }),
      fileField("cover_file_id", {
        note: "资料封面图。",
        image: true,
      }),
      stringField("source_type", {
        maxLength: 32,
        required: true,
        width: "half",
        defaultValue: "article",
        options: dropdownChoices(["article", "video", "podcast", "paper", "website"]),
        note: "原始来源类型。",
      }),
      stringField("source_platform", {
        maxLength: 100,
        required: true,
        indexed: true,
        width: "half",
        note: "原始来源平台，例如 YouTube、OpenAI Docs、Anthropic。",
      }),
      stringField("source_url", {
        maxLength: 500,
        required: true,
        indexed: true,
        note: "原始来源链接。",
      }),
      stringField("source_title", {
        maxLength: 255,
        note: "原始来源标题；可为空，默认回退到资料标题。",
      }),
      stringField("source_author", {
        maxLength: 150,
        width: "half",
        note: "原始来源作者。",
      }),
      stringField("source_language", {
        maxLength: 16,
        width: "half",
        defaultValue: "en",
        options: dropdownChoices(["en", "zh", "other"], { allowNone: true }),
        note: "原始来源语言。",
      }),
      timestampField("source_published_at", {
        width: "half",
        note: "原始来源发布时间。",
      }),
      fileField("source_thumbnail_file_id", {
        note: "来源缩略图。",
        image: true,
      }),
      stringField("brief_title", {
        maxLength: 255,
        note: "摘要标题；可为空，默认回退到资料标题。",
      }),
      textField("brief_body_markdown", {
        note: "摘要正文。",
      }),
      fileField("brief_file_id", {
        note: "摘要附件，例如 PDF 或 Markdown 导出文件。",
      }),
      fileField("audio_file_id", {
        note: "音频文件。",
      }),
      stringField("audio_external_url", {
        maxLength: 500,
        note: "音频外链；与音频文件二选一或同时提供。",
      }),
      fileField("slides_file_id", {
        note: "PPT 文件。",
      }),
      stringField("slides_external_url", {
        maxLength: 500,
        note: "PPT 外链；与 PPT 文件二选一或同时提供。",
      }),
      fileField("video_file_id", {
        note: "视频文件。",
      }),
      stringField("video_external_url", {
        maxLength: 500,
        note: "视频外链；与视频文件二选一或同时提供。",
      }),
      stringField("publish_mode", {
        maxLength: 32,
        required: true,
        width: "half",
        defaultValue: "draft",
        options: dropdownChoices(["draft", "published"]),
        note: "保存为草稿，或直接生成到可发布状态。",
      }),
      timestampField("publish_start_at", {
        indexed: true,
        width: "half",
        note: "计划发布时间；可为空。",
      }),
      stringField("package_type", {
        maxLength: 32,
        required: true,
        width: "half",
        defaultValue: "recap",
        options: dropdownChoices(["recap", "deep_dive", "watchlist", "toolkit", "interview"]),
        note: "内容包类型。",
      }),
      stringField("difficulty", {
        maxLength: 32,
        required: true,
        width: "half",
        defaultValue: "intermediate",
        options: dropdownChoices(["beginner", "intermediate", "advanced"]),
        note: "阅读难度。",
      }),
      stringField("use_case", {
        maxLength: 32,
        required: true,
        width: "half",
        defaultValue: "research",
        options: dropdownChoices(["awareness", "strategy", "tooling", "workflow", "research"]),
        note: "使用目的。",
      }),
      stringField("signal_level", {
        maxLength: 32,
        required: true,
        width: "half",
        defaultValue: "reference",
        options: dropdownChoices(["high_signal", "reference", "archive"]),
        note: "信号等级。",
      }),
      booleanField("raw_source_visible", {
        defaultValue: true,
        note: "会员前台是否显示原始来源信息。",
      }),
      stringField("generation_status", {
        maxLength: 32,
        required: true,
        width: "half",
        defaultValue: "draft",
        indexed: true,
        options: dropdownChoices(["draft", "ready", "generated", "failed", "archived"]),
        note: "统一上传台自己的生成状态。",
      }),
      relationField("generated_package_id", {
        template: "{{title}}",
        width: "half",
        note: "生成成功后回写的资料包。",
      }),
      timestampField("generated_at", {
        width: "half",
        note: "最后一次生成完成时间。",
      }),
      textField("generation_error", {
        note: "生成失败原因。",
      }),
      timestampField("created_at", {
        required: true,
        special: ["date-created"],
        readonly: true,
      }),
      timestampField("updated_at", {
        special: ["date-updated"],
        readonly: true,
      }),
    ],
  },
  {
    collection: "content_intake_collections",
    meta: {
      icon: "device_hub",
      note: "统一上传台与合集的关联。",
      display_template: "{{content_intake_id.title}} -> {{collection_id.name}}",
      hidden: true,
      sort_field: "sort_order",
    },
    fields: [
      uuidPrimaryKey(),
      relationField("content_intake_id", {
        required: true,
        template: "{{title}}",
        width: "half",
      }),
      relationField("collection_id", {
        required: true,
        template: "{{name}}",
        width: "half",
      }),
      integerField("sort_order", {
        required: true,
        indexed: true,
        defaultValue: 1,
      }),
      timestampField("created_at", {
        required: true,
        special: ["date-created"],
        readonly: true,
      }),
    ],
  },
];

const relations = [
  {
    collection: "content_intake",
    field: "primary_topic_id",
    related_collection: "topics",
    one_field: null,
    on_delete: "RESTRICT",
  },
  {
    collection: "content_intake",
    field: "member_tier_id",
    related_collection: "member_tiers",
    one_field: null,
    on_delete: "RESTRICT",
  },
  {
    collection: "content_intake",
    field: "generated_package_id",
    related_collection: "packages",
    one_field: null,
    on_delete: "SET NULL",
  },
  {
    collection: "content_intake",
    field: "cover_file_id",
    related_collection: "directus_files",
    one_field: null,
    on_delete: "SET NULL",
  },
  {
    collection: "content_intake",
    field: "source_thumbnail_file_id",
    related_collection: "directus_files",
    one_field: null,
    on_delete: "SET NULL",
  },
  {
    collection: "content_intake",
    field: "brief_file_id",
    related_collection: "directus_files",
    one_field: null,
    on_delete: "SET NULL",
  },
  {
    collection: "content_intake",
    field: "audio_file_id",
    related_collection: "directus_files",
    one_field: null,
    on_delete: "SET NULL",
  },
  {
    collection: "content_intake",
    field: "slides_file_id",
    related_collection: "directus_files",
    one_field: null,
    on_delete: "SET NULL",
  },
  {
    collection: "content_intake",
    field: "video_file_id",
    related_collection: "directus_files",
    one_field: null,
    on_delete: "SET NULL",
  },
  {
    collection: "content_intake_collections",
    field: "content_intake_id",
    related_collection: "content_intake",
    one_field: "collection_ids",
    on_delete: "CASCADE",
  },
  {
    collection: "content_intake_collections",
    field: "collection_id",
    related_collection: "curated_collections",
    one_field: null,
    on_delete: "CASCADE",
  },
];

async function fetchCollection(token, collection) {
  const { response, payload } = await request(`/collections/${collection}`, {
    token,
    allowFailure: true,
  });
  if (!response.ok) return null;
  return payload?.data ?? null;
}

async function upsertCollection(token, definition) {
  const existing = await fetchCollection(token, definition.collection);

  if (existing) {
    await request(`/collections/${definition.collection}`, {
      method: "PATCH",
      token,
      body: {
        meta: definition.meta,
      },
    });
    console.log(`updated collection: ${definition.collection}`);
    return;
  }

  await request("/collections", {
    method: "POST",
    token,
    body: {
      collection: definition.collection,
      meta: definition.meta,
      schema: {
        name: definition.collection,
      },
    },
  });
  console.log(`created collection: ${definition.collection}`);
}

async function fetchField(token, collection, field) {
  const { response, payload } = await request(`/fields/${collection}/${field}`, {
    token,
    allowFailure: true,
  });
  if (!response.ok) return null;
  return payload?.data ?? null;
}

async function upsertField(token, definition) {
  const existing = await fetchField(token, definition.collection, definition.field);
  const body = {
    field: definition.field,
    type: definition.type,
    meta: definition.meta,
    ...(definition.schema ? { schema: definition.schema } : {}),
  };

  if (existing) {
    await request(`/fields/${definition.collection}/${definition.field}`, {
      method: "PATCH",
      token,
      body,
    });
    console.log(`updated field: ${definition.collection}.${definition.field}`);
    return;
  }

  await request(`/fields/${definition.collection}`, {
    method: "POST",
    token,
    body,
  });
  console.log(`created field: ${definition.collection}.${definition.field}`);
}

async function fetchRelations(token, collection) {
  const { payload } = await request(`/relations/${collection}?limit=-1`, { token });
  return payload?.data ?? [];
}

async function ensureRelation(token, definition) {
  const existingRelations = await fetchRelations(token, definition.collection);
  const existing = existingRelations.find(
    (entry) =>
      entry.collection === definition.collection &&
      entry.field === definition.field &&
      (entry.related_collection === definition.related_collection ||
        entry.meta?.one_collection === definition.related_collection ||
        entry.schema?.foreign_key_table === definition.related_collection)
  );

  if (existing) {
    console.log(
      `relation exists: ${definition.collection}.${definition.field} -> ${definition.related_collection}`
    );
    return;
  }

  await request("/relations", {
    method: "POST",
    token,
    body: {
      collection: definition.collection,
      field: definition.field,
      related_collection: definition.related_collection,
      schema: {
        table: definition.collection,
        column: definition.field,
        foreign_key_table: definition.related_collection,
        foreign_key_column: "id",
        on_delete: definition.on_delete,
      },
      meta: {
        many_collection: definition.collection,
        many_field: definition.field,
        one_collection: definition.related_collection,
        one_field: definition.one_field,
        one_deselect_action: "nullify",
      },
    },
  });
  console.log(
    `created relation: ${definition.collection}.${definition.field} -> ${definition.related_collection}`
  );
}

async function main() {
  const token = await loginAdmin();

  for (const definition of collections) {
    await upsertCollection(token, definition);
  }

  for (const definition of collections) {
    for (const field of definition.fields) {
      await upsertField(token, {
        collection: definition.collection,
        ...field,
      });
    }
  }

  for (const relation of relations) {
    await ensureRelation(token, relation);
  }

  console.log("phase21 content intake schema applied");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
