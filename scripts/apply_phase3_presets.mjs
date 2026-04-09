#!/usr/bin/env node

import process from "node:process";

const baseUrl = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const adminEmail =
  process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword =
  process.env.DIRECTUS_ADMIN_PASSWORD ?? "phase1-admin-password";

const presetDefinitions = [
  {
    bookmark: "待补来源",
    collection: "packages",
    icon: "link_off",
    color: "warning",
    layout: "tabular",
    filter: {
      source_links: {
        _none: {},
      },
    },
    layout_query: {
      tabular: {
        sort: ["-updated_at"],
        fields: [
          "title",
          "workflow_state",
          "primary_topic_id",
          "updated_at",
        ],
      },
    },
  },
  {
    bookmark: "待补摘要",
    collection: "packages",
    icon: "notes",
    color: "warning",
    layout: "tabular",
    filter: {
      assets: {
        _none: {
          asset_type: {
            _eq: "brief",
          },
          status: {
            _eq: "active",
          },
        },
      },
    },
    layout_query: {
      tabular: {
        sort: ["-updated_at"],
        fields: [
          "title",
          "workflow_state",
          "primary_topic_id",
          "updated_at",
        ],
      },
    },
  },
  {
    bookmark: "可排期",
    collection: "packages",
    icon: "event_available",
    color: "primary",
    layout: "tabular",
    filter: {
      workflow_state: {
        _eq: "approved",
      },
    },
    layout_query: {
      tabular: {
        sort: ["-updated_at"],
        fields: [
          "title",
          "workflow_state",
          "publish_start_at",
          "sort_date",
        ],
      },
    },
  },
  {
    bookmark: "已排期",
    collection: "packages",
    icon: "calendar_month",
    color: "primary",
    layout: "tabular",
    filter: {
      workflow_state: {
        _eq: "scheduled",
      },
    },
    layout_query: {
      tabular: {
        sort: ["publish_start_at"],
        fields: [
          "title",
          "publish_start_at",
          "sort_date",
          "primary_topic_id",
        ],
      },
    },
  },
  {
    bookmark: "已发布",
    collection: "packages",
    icon: "published_with_changes",
    color: "success",
    layout: "tabular",
    filter: {
      workflow_state: {
        _eq: "published",
      },
    },
    layout_query: {
      tabular: {
        sort: ["-publish_start_at"],
        fields: [
          "title",
          "publish_start_at",
          "sort_date",
          "primary_topic_id",
        ],
      },
    },
  },
];

async function api(path, { method = "GET", token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

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

async function listPresets(token) {
  return api("/presets", { token });
}

async function deletePreset(token, id) {
  await api(`/presets/${id}`, { method: "DELETE", token });
}

async function upsertPreset(token, definition, existingPreset) {
  const payload = {
    bookmark: definition.bookmark,
    collection: definition.collection,
    layout: definition.layout,
    layout_query: definition.layout_query,
    icon: definition.icon,
    color: definition.color,
    filter: definition.filter,
  };

  if (existingPreset) {
    await api(`/presets/${existingPreset.id}`, {
      method: "PATCH",
      token,
      body: payload,
    });
    console.log(`updated preset: ${definition.bookmark}`);
    return;
  }

  await api("/presets", {
    method: "POST",
    token,
    body: payload,
  });
  console.log(`created preset: ${definition.bookmark}`);
}

async function main() {
  const token = await login();
  const existing = await listPresets(token);

  for (const preset of existing.data) {
    if (preset.bookmark === "temp-phase3") {
      await deletePreset(token, preset.id);
      console.log("deleted preset: temp-phase3");
    }
  }

  const current = (await listPresets(token)).data;

  for (const definition of presetDefinitions) {
    const found = current.find(
      (entry) =>
        entry.bookmark === definition.bookmark &&
        entry.collection === definition.collection
    );
    await upsertPreset(token, definition, found);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
