#!/usr/bin/env node

import process from "node:process";

import { loginAdmin, request } from "./lib/phase5_directus.mjs";

const requiredCollectionNotes = {
  packages: "编辑主工作台：先补齐基础信息，再送审、排期、发布、归档。",
  sources: "先建来源，再挂到内容包；来源对象本身不直接面向会员展示。",
  processed_assets: "至少保留 1 条有效 brief，音频、幻灯片、视频按内容包补充。",
};

const requiredFieldNotes = [
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
  ["packages", "slug", "前台访问路径，发布后避免修改。"],
  [
    "sources",
    "source_url",
    "原始链接；会员不会单独看到来源对象，但会在内容详情中看到来源信息。",
  ],
  [
    "processed_assets",
    "asset_type",
    "每个内容包至少要有 1 条 brief；其余类型按需补充。",
  ],
  ["processed_assets", "is_primary", "同一个内容包只能有 1 条主资产。"],
  [
    "package_topics",
    "topic_id",
    "主主题也必须补到这里，否则内容包不能进入排期或发布状态。",
  ],
];

const requiredPresets = [
  ["packages", "草稿池"],
  ["packages", "待补来源"],
  ["packages", "待补摘要"],
  ["packages", "待审核"],
  ["packages", "可排期"],
  ["packages", "已排期"],
  ["packages", "已发布"],
  ["packages", "已归档"],
];

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const token = await loginAdmin();

  for (const [collection, expectedNote] of Object.entries(requiredCollectionNotes)) {
    const { payload } = await request(`/collections/${collection}`, { token });
    assertCondition(
      payload.data?.meta?.note === expectedNote,
      `unexpected collection note: ${collection}`
    );
  }

  for (const [collection, field, expectedNote] of requiredFieldNotes) {
    const { payload } = await request(`/fields/${collection}/${field}`, { token });
    assertCondition(
      payload.data?.meta?.note === expectedNote,
      `unexpected field note: ${collection}.${field}`
    );
  }

  const { payload } = await request(
    "/presets?limit=-1&fields=id,bookmark,collection",
    { token }
  );

  for (const [collection, bookmark] of requiredPresets) {
    const found = payload.data.find(
      (entry) => entry.collection === collection && entry.bookmark === bookmark
    );
    assertCondition(Boolean(found), `missing preset: ${collection} / ${bookmark}`);
  }

  console.log("phase12 editorial flow verified");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
