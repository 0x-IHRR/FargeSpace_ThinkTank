#!/usr/bin/env node

import { loginAdmin, request } from "./lib/phase5_directus.mjs";

const collectionMeta = {
  note: "资料上传台：内容运营者只在这里填写资料，后续由系统自动拆到底层内容集合。",
  translations: [{ language: "zh-CN", translation: "资料上传台" }],
};

const groupDefinitions = [
  {
    field: "group_basic_info",
    sort: 10,
    label: "基础信息",
    note: "先填写资料标题、摘要、主题、合集和封面。",
  },
  {
    field: "group_source",
    sort: 20,
    label: "原始来源",
    note: "填写来源类型、平台、链接、作者和发布时间。",
  },
  {
    field: "group_assets",
    sort: 30,
    label: "加工内容",
    note: "在这里上传摘要、音频、PPT、视频等会员可消费内容。",
  },
  {
    field: "group_publish",
    sort: 40,
    label: "发布设置",
    note: "决定会员层级、发布时间和生成后的内容类型。",
  },
  {
    field: "group_generation",
    sort: 50,
    label: "生成状态",
    note: "系统回写生成结果；运营者通常不需要手动修改。",
  },
];

const fieldMetaDefinitions = [
  {
    field: "title",
    sort: 11,
    group: "group_basic_info",
    width: "full",
    note: "资料标题；后续会生成会员前台看到的主标题。",
    translation: "资料标题",
  },
  {
    field: "summary",
    sort: 12,
    group: "group_basic_info",
    width: "full",
    note: "简短摘要；用于列表说明和详情页导语。",
    translation: "简短摘要",
  },
  {
    field: "primary_topic_id",
    sort: 13,
    group: "group_basic_info",
    width: "half",
    note: "主主题；前台主分类会从这里生成。",
    translation: "主主题",
  },
  {
    field: "collection_ids",
    sort: 14,
    group: "group_basic_info",
    width: "full",
    note: "所属合集；可选。",
    translation: "所属合集",
  },
  {
    field: "cover_file_id",
    sort: 15,
    group: "group_basic_info",
    width: "full",
    note: "封面图；用于卡片和详情页头部。",
    translation: "封面图",
  },
  {
    field: "source_type",
    sort: 21,
    group: "group_source",
    width: "half",
    note: "原始来源类型，例如文章、视频、播客。",
    translation: "来源类型",
  },
  {
    field: "source_platform",
    sort: 22,
    group: "group_source",
    width: "half",
    note: "原始来源平台，例如 YouTube、OpenAI Docs。",
    translation: "来源平台",
  },
  {
    field: "source_url",
    sort: 23,
    group: "group_source",
    width: "full",
    note: "原始来源链接。",
    translation: "原始链接",
  },
  {
    field: "source_title",
    sort: 24,
    group: "group_source",
    width: "full",
    note: "原始来源标题；可为空。",
    translation: "原始来源标题",
  },
  {
    field: "source_author",
    sort: 25,
    group: "group_source",
    width: "half",
    note: "作者或机构名称。",
    translation: "作者",
  },
  {
    field: "source_language",
    sort: 26,
    group: "group_source",
    width: "half",
    note: "原始来源语言。",
    translation: "原始语言",
  },
  {
    field: "source_published_at",
    sort: 27,
    group: "group_source",
    width: "half",
    note: "原始发布时间；不清楚可先不填。",
    translation: "原始发布时间",
  },
  {
    field: "source_thumbnail_file_id",
    sort: 28,
    group: "group_source",
    width: "full",
    note: "来源缩略图；可选。",
    translation: "来源缩略图",
  },
  {
    field: "brief_title",
    sort: 31,
    group: "group_assets",
    width: "full",
    note: "摘要标题；可为空。",
    translation: "摘要标题",
  },
  {
    field: "brief_body_markdown",
    sort: 32,
    group: "group_assets",
    width: "full",
    note: "摘要正文。",
    translation: "摘要正文",
  },
  {
    field: "brief_file_id",
    sort: 33,
    group: "group_assets",
    width: "full",
    note: "摘要附件，例如 PDF。",
    translation: "摘要附件",
  },
  {
    field: "audio_file_id",
    sort: 34,
    group: "group_assets",
    width: "full",
    note: "音频文件。",
    translation: "音频文件",
  },
  {
    field: "audio_external_url",
    sort: 35,
    group: "group_assets",
    width: "full",
    note: "音频外链；与音频文件二选一或同时提供。",
    translation: "音频外链",
  },
  {
    field: "slides_file_id",
    sort: 36,
    group: "group_assets",
    width: "full",
    note: "PPT 文件。",
    translation: "PPT 文件",
  },
  {
    field: "slides_external_url",
    sort: 37,
    group: "group_assets",
    width: "full",
    note: "PPT 外链；与 PPT 文件二选一或同时提供。",
    translation: "PPT 外链",
  },
  {
    field: "video_file_id",
    sort: 38,
    group: "group_assets",
    width: "full",
    note: "视频文件。",
    translation: "视频文件",
  },
  {
    field: "video_external_url",
    sort: 39,
    group: "group_assets",
    width: "full",
    note: "视频外链；与视频文件二选一或同时提供。",
    translation: "视频外链",
  },
  {
    field: "member_tier_id",
    sort: 41,
    group: "group_publish",
    width: "half",
    note: "谁可以看到这份资料。",
    translation: "会员层级",
  },
  {
    field: "publish_mode",
    sort: 42,
    group: "group_publish",
    width: "half",
    note: "保存为草稿，或直接发布。",
    translation: "发布方式",
  },
  {
    field: "publish_start_at",
    sort: 43,
    group: "group_publish",
    width: "half",
    note: "计划发布时间；直接发布但留空时，系统会自动补当前时间。",
    translation: "发布时间",
  },
  {
    field: "package_type",
    sort: 44,
    group: "group_publish",
    width: "half",
    note: "生成后的内容类型。",
    translation: "内容类型",
  },
  {
    field: "difficulty",
    sort: 45,
    group: "group_publish",
    width: "half",
    note: "阅读难度。",
    translation: "阅读难度",
  },
  {
    field: "use_case",
    sort: 46,
    group: "group_publish",
    width: "half",
    note: "使用目的。",
    translation: "使用目的",
  },
  {
    field: "signal_level",
    sort: 47,
    group: "group_publish",
    width: "half",
    note: "信号等级。",
    translation: "信号等级",
  },
  {
    field: "raw_source_visible",
    sort: 48,
    group: "group_publish",
    width: "half",
    note: "会员前台是否显示原始来源信息。",
    translation: "会员可见原始来源",
  },
  {
    field: "generation_status",
    sort: 51,
    group: "group_generation",
    width: "half",
    note: "当前上传记录的生成状态。",
    translation: "生成状态",
  },
  {
    field: "generated_package_id",
    sort: 52,
    group: "group_generation",
    width: "half",
    note: "生成成功后回写的资料包。",
    translation: "已生成资料包",
  },
  {
    field: "generated_at",
    sort: 53,
    group: "group_generation",
    width: "half",
    note: "最后一次生成完成时间。",
    translation: "生成时间",
  },
  {
    field: "generation_error",
    sort: 54,
    group: "group_generation",
    width: "full",
    note: "生成失败原因。",
    translation: "失败原因",
  },
  {
    field: "created_at",
    sort: 55,
    group: "group_generation",
    width: "half",
    note: "记录创建时间。",
    translation: "创建时间",
  },
  {
    field: "updated_at",
    sort: 56,
    group: "group_generation",
    width: "half",
    note: "记录最近更新时间。",
    translation: "更新时间",
  },
];

async function fetchField(token, field) {
  const { response, payload } = await request(`/fields/content_intake/${field}`, {
    token,
    allowFailure: true,
  });
  if (!response.ok) return null;
  return payload?.data ?? null;
}

async function fetchCollection(token) {
  const { response, payload } = await request("/collections/content_intake", {
    token,
    allowFailure: true,
  });
  if (!response.ok) return null;
  return payload?.data ?? null;
}

async function upsertGroupField(token, definition) {
  const existing = await fetchField(token, definition.field);
  const body = {
    field: definition.field,
    type: "alias",
    meta: {
      interface: "group-raw",
      hidden: false,
      readonly: false,
      required: false,
      sort: definition.sort,
      width: "full",
      note: definition.note,
      translations: [{ language: "zh-CN", translation: definition.label }],
      options: null,
    },
  };

  if (existing) {
    await request(`/fields/content_intake/${definition.field}`, {
      method: "PATCH",
      token,
      body,
    });
    console.log(`updated group: ${definition.field}`);
    return;
  }

  await request("/fields/content_intake", {
    method: "POST",
    token,
    body,
  });
  console.log(`created group: ${definition.field}`);
}

async function updateCollectionMeta(token) {
  const existing = await fetchCollection(token);
  if (!existing) {
    throw new Error("missing collection: content_intake");
  }

  await request("/collections/content_intake", {
    method: "PATCH",
    token,
    body: {
      meta: {
        ...existing.meta,
        ...collectionMeta,
      },
    },
  });
  console.log("updated collection meta: content_intake");
}

async function updateFieldMeta(token, definition) {
  const existing = await fetchField(token, definition.field);
  if (!existing) {
    throw new Error(`missing field: content_intake.${definition.field}`);
  }

  const meta = {
    ...existing.meta,
    sort: definition.sort,
    group: definition.group,
    width: definition.width,
    note: definition.note,
    translations: [{ language: "zh-CN", translation: definition.translation }],
  };

  await request(`/fields/content_intake/${definition.field}`, {
    method: "PATCH",
    token,
    body: {
      meta,
    },
  });
  console.log(`updated field meta: content_intake.${definition.field}`);
}

async function main() {
  const token = await loginAdmin();

  await updateCollectionMeta(token);

  for (const definition of groupDefinitions) {
    await upsertGroupField(token, definition);
  }

  for (const definition of fieldMetaDefinitions) {
    await updateFieldMeta(token, definition);
  }

  console.log("phase21 content intake form configured");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
