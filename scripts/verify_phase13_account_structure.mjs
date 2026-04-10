#!/usr/bin/env node

import { loginAdmin, request } from "./lib/phase5_directus.mjs";

const requiredFields = [
  ["directus_users", "member_tier_id"],
  ["directus_users", "member_profile_status"],
];

const requiredFieldNotes = [
  ["directus_users", "member_tier_id", "会员层级；正式会员登录必须绑定有效层级。"],
  ["directus_users", "member_profile_status", "会员资格状态；只有 active 才允许进入会员区。"],
];

const requiredPresets = [
  ["directus_users", "有效会员"],
  ["directus_users", "待补层级"],
  ["directus_users", "已停用会员"],
];

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const token = await loginAdmin();

  for (const [collection, field] of requiredFields) {
    const { payload } = await request(`/fields/${collection}/${field}`, { token });
    assertCondition(Boolean(payload.data), `missing field: ${collection}.${field}`);
  }

  const { payload: relationPayload } = await request("/relations/directus_users?limit=-1", {
    token,
  });
  const relation =
    relationPayload.data?.find(
      (entry) =>
        entry.collection === "directus_users" &&
        entry.field === "member_tier_id" &&
        (entry.related_collection === "member_tiers" ||
          entry.meta?.one_collection === "member_tiers" ||
          entry.schema?.foreign_key_table === "member_tiers")
    ) ?? null;
  assertCondition(Boolean(relation), "missing relation: directus_users.member_tier_id");

  for (const [collection, field, expectedNote] of requiredFieldNotes) {
    const { payload } = await request(`/fields/${collection}/${field}`, { token });
    assertCondition(
      payload.data?.meta?.note === expectedNote,
      `unexpected field note: ${collection}.${field}`
    );
  }

  const { payload: presetPayload } = await request(
    "/presets?limit=-1&fields=id,bookmark,collection",
    { token }
  );
  for (const [collection, bookmark] of requiredPresets) {
    const found = presetPayload.data.find(
      (entry) => entry.collection === collection && entry.bookmark === bookmark
    );
    assertCondition(Boolean(found), `missing preset: ${collection} / ${bookmark}`);
  }

  console.log("phase13 account structure verified");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
