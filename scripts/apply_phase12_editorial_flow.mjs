#!/usr/bin/env node

import process from "node:process";

import { loginAdmin, request } from "./lib/phase5_directus.mjs";

const collectionNotes = {
  packages: "编辑主工作台：先补齐基础信息，再送审、排期、发布、归档。",
  sources: "先建来源，再挂到内容包；来源对象本身不直接面向会员展示。",
  processed_assets: "至少保留 1 条有效 brief，音频、幻灯片、视频按内容包补充。",
};

const fieldNotes = [
  ["packages", "title", "会员最终看到的主标题，发布后不建议频繁改动。"],
  ["packages", "slug", "前台访问路径，发布后避免修改。"],
  ["packages", "summary", "列表摘要和详情页导语。"],
  [
    "packages",
    "primary_topic_id",
    "主主题必须同时存在于 package_topics 关联中。",
  ],
  ["packages", "member_tier_id", "决定哪些会员层级可见。"],
  [
    "packages",
    "workflow_state",
    "推荐顺序：draft -> review -> approved -> scheduled -> published -> archived。",
  ],
  [
    "packages",
    "publish_start_at",
    "进入 scheduled 或 published 前必须填写。",
  ],
  [
    "packages",
    "publish_end_at",
    "可选下线时间；到期后会员不再可见。",
  ],
  ["packages", "sort_date", "列表排序时间，不一定等于发布时间。"],
  ["sources", "title", "原始来源标题，建议保持原文含义。"],
  [
    "sources",
    "source_url",
    "原始链接；会员不会单独看到来源对象，但会在内容详情中看到来源信息。",
  ],
  ["sources", "source_type", "决定来源标签和筛选分类。"],
  ["sources", "platform", "来源平台名称，例如 OpenAI、Anthropic、YouTube。"],
  ["sources", "published_at", "原始来源发布时间。"],
  ["sources", "source_language", "原始内容语言。"],
  [
    "processed_assets",
    "title",
    "会员看到的加工内容标题；可和内容包标题不同。",
  ],
  [
    "processed_assets",
    "asset_type",
    "每个内容包至少要有 1 条 brief；其余类型按需补充。",
  ],
  [
    "processed_assets",
    "body_markdown",
    "brief 正文，可与附件二选一或同时提供。",
  ],
  [
    "processed_assets",
    "file_id",
    "本地上传文件；audio、slides、video 至少提供文件或外链之一。",
  ],
  [
    "processed_assets",
    "external_url",
    "外部链接；audio、slides、video 至少提供文件或外链之一。",
  ],
  ["processed_assets", "is_primary", "同一个内容包只能有 1 条主资产。"],
  ["processed_assets", "sort_order", "同一内容包内的展示顺序，越小越靠前。"],
  ["processed_assets", "status", "归档后前台不再展示。"],
  ["package_sources", "is_primary", "同一个内容包只能保留 1 个主来源。"],
  [
    "package_topics",
    "topic_id",
    "主主题也必须补到这里，否则内容包不能进入排期或发布状态。",
  ],
];

const presetDefinitions = [
  {
    bookmark: "草稿池",
    collection: "packages",
    icon: "edit_note",
    color: "primary",
    layout: "tabular",
    layout_query: {
      tabular: {
        sort: ["-updated_at"],
        fields: ["title", "primary_topic_id", "workflow_state", "updated_at"],
      },
    },
    filter: {
      workflow_state: {
        _eq: "draft",
      },
    },
  },
  {
    bookmark: "待审核",
    collection: "packages",
    icon: "fact_check",
    color: "primary",
    layout: "tabular",
    layout_query: {
      tabular: {
        sort: ["-updated_at"],
        fields: ["title", "primary_topic_id", "workflow_state", "updated_at"],
      },
    },
    filter: {
      workflow_state: {
        _eq: "review",
      },
    },
  },
  {
    bookmark: "已归档",
    collection: "packages",
    icon: "inventory_2",
    color: "warning",
    layout: "tabular",
    layout_query: {
      tabular: {
        sort: ["-updated_at"],
        fields: ["title", "workflow_state", "publish_start_at", "updated_at"],
      },
    },
    filter: {
      workflow_state: {
        _eq: "archived",
      },
    },
  },
];

async function listPresets(token) {
  const { payload } = await request(
    "/presets?limit=-1&fields=id,bookmark,collection",
    { token }
  );
  return payload.data;
}

async function upsertPreset(token, definition) {
  const presets = await listPresets(token);
  const found = presets.find(
    (entry) =>
      entry.bookmark === definition.bookmark &&
      entry.collection === definition.collection
  );

  const body = {
    bookmark: definition.bookmark,
    collection: definition.collection,
    layout: definition.layout,
    layout_query: definition.layout_query,
    icon: definition.icon,
    color: definition.color,
    filter: definition.filter,
  };

  if (found) {
    await request(`/presets/${found.id}`, {
      method: "PATCH",
      token,
      body,
    });
    console.log(`updated preset: ${definition.bookmark}`);
    return;
  }

  await request("/presets", {
    method: "POST",
    token,
    body,
  });
  console.log(`created preset: ${definition.bookmark}`);
}

async function updateCollectionNote(token, collection, note) {
  await request(`/collections/${collection}`, {
    method: "PATCH",
    token,
    body: {
      meta: {
        note,
      },
    },
  });
  console.log(`updated collection note: ${collection}`);
}

async function updateFieldNote(token, collection, field, note) {
  await request(`/fields/${collection}/${field}`, {
    method: "PATCH",
    token,
    body: {
      meta: {
        note,
      },
    },
  });
  console.log(`updated field note: ${collection}.${field}`);
}

async function main() {
  const token = await loginAdmin();

  for (const [collection, note] of Object.entries(collectionNotes)) {
    await updateCollectionNote(token, collection, note);
  }

  for (const [collection, field, note] of fieldNotes) {
    await updateFieldNote(token, collection, field, note);
  }

  for (const preset of presetDefinitions) {
    await upsertPreset(token, preset);
  }

  console.log("phase12 editorial flow applied");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
