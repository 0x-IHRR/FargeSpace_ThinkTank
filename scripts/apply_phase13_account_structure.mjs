#!/usr/bin/env node

import { loginAdmin, request } from "./lib/phase5_directus.mjs";

const memberProfileStatusChoices = ["active", "paused", "expired"];

const fieldDefinitions = [
  {
    collection: "directus_users",
    field: "member_tier_id",
    type: "uuid",
    meta: {
      special: ["m2o"],
      interface: "select-dropdown-m2o",
      display: "related-values",
      display_options: {
        template: "{{name}}",
      },
      note: "会员层级；正式会员登录必须绑定有效层级。",
      width: "half",
      hidden: false,
      readonly: false,
      required: false,
    },
    schema: {
      is_nullable: true,
      is_indexed: true,
    },
  },
  {
    collection: "directus_users",
    field: "member_profile_status",
    type: "string",
    meta: {
      interface: "input-dropdown",
      options: {
        choices: memberProfileStatusChoices.map((value) => ({
          text: value,
          value,
        })),
        allowNone: false,
      },
      note: "会员资格状态；只有 active 才允许进入会员区。",
      width: "half",
      hidden: false,
      readonly: false,
      required: true,
    },
    schema: {
      is_nullable: false,
      max_length: 32,
      default_value: "active",
      is_indexed: true,
    },
  },
];

const presetDefinitions = [
  {
    bookmark: "有效会员",
    collection: "directus_users",
    icon: "verified_user",
    color: "primary",
    layout: "tabular",
    layout_query: {
      tabular: {
        sort: ["first_name", "email"],
        fields: [
          "email",
          "first_name",
          "last_name",
          "role",
          "status",
          "member_tier_id",
          "member_profile_status",
        ],
      },
    },
    filter: {
      _and: [
        { role: { name: { _eq: "Member" } } },
        { status: { _eq: "active" } },
        { member_profile_status: { _eq: "active" } },
      ],
    },
  },
  {
    bookmark: "待补层级",
    collection: "directus_users",
    icon: "priority_high",
    color: "warning",
    layout: "tabular",
    layout_query: {
      tabular: {
        sort: ["email"],
        fields: [
          "email",
          "first_name",
          "last_name",
          "role",
          "status",
          "member_tier_id",
          "member_profile_status",
        ],
      },
    },
    filter: {
      _and: [
        { role: { name: { _eq: "Member" } } },
        { member_tier_id: { _null: true } },
      ],
    },
  },
  {
    bookmark: "已停用会员",
    collection: "directus_users",
    icon: "block",
    color: "danger",
    layout: "tabular",
    layout_query: {
      tabular: {
        sort: ["email"],
        fields: [
          "email",
          "first_name",
          "last_name",
          "role",
          "status",
          "member_tier_id",
          "member_profile_status",
        ],
      },
    },
    filter: {
      _and: [
        { role: { name: { _eq: "Member" } } },
        {
          _or: [
            { status: { _neq: "active" } },
            { member_profile_status: { _neq: "active" } },
          ],
        },
      ],
    },
  },
];

async function fetchField(token, collection, field) {
  const { payload } = await request(`/fields/${collection}/${field}`, {
    token,
    allowFailure: true,
  });
  return payload?.data ?? null;
}

async function upsertField(token, definition) {
  const existing = await fetchField(token, definition.collection, definition.field);
  const body = {
    field: definition.field,
    type: definition.type,
    meta: definition.meta,
    schema: definition.schema,
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

async function fetchRelation(token, collection, field) {
  const { payload } = await request(`/relations/${collection}?limit=-1`, { token });
  return (
    payload.data?.find(
      (entry) =>
        entry.collection === collection &&
        entry.field === field &&
        (entry.related_collection === "member_tiers" ||
          entry.meta?.one_collection === "member_tiers" ||
          entry.schema?.foreign_key_table === "member_tiers")
    ) ?? null
  );
}

async function ensureRelation(token) {
  const existing = await fetchRelation(token, "directus_users", "member_tier_id");
  if (existing) {
    console.log("relation exists: directus_users.member_tier_id -> member_tiers");
    return;
  }

  await request("/relations", {
    method: "POST",
    token,
    body: {
      collection: "directus_users",
      field: "member_tier_id",
      related_collection: "member_tiers",
      schema: {
        table: "directus_users",
        column: "member_tier_id",
        foreign_key_table: "member_tiers",
        foreign_key_column: "id",
        on_delete: "SET NULL",
      },
      meta: {
        many_collection: "directus_users",
        many_field: "member_tier_id",
        one_collection: "member_tiers",
        one_field: null,
        one_deselect_action: "nullify",
      },
    },
  });
  console.log("created relation: directus_users.member_tier_id -> member_tiers");
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

async function listPresets(token) {
  const { payload } = await request(
    "/presets?limit=-1&fields=id,bookmark,collection",
    { token }
  );
  return payload.data;
}

async function upsertPreset(token, definition) {
  const presets = await listPresets(token);
  const existing = presets.find(
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

  if (existing) {
    await request(`/presets/${existing.id}`, {
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

async function main() {
  const token = await loginAdmin();

  for (const definition of fieldDefinitions) {
    await upsertField(token, definition);
  }

  await ensureRelation(token);

  for (const preset of presetDefinitions) {
    await upsertPreset(token, preset);
  }

  console.log("phase13 account structure applied");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
