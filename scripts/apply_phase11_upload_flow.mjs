#!/usr/bin/env node

import process from "node:process";

const baseUrl = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const adminEmail = process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword =
  process.env.DIRECTUS_ADMIN_PASSWORD ?? "phase1-admin-password";
const staticToken = process.env.DIRECTUS_TOKEN ?? null;

const folderTree = {
  name: "FargeSpace Uploads",
  children: [
    { name: "来源封面" },
    { name: "内容封面" },
    { name: "摘要附件" },
    { name: "音频文件" },
    { name: "幻灯片文件" },
    { name: "视频文件" },
  ],
};

const presetDefinitions = [
  {
    bookmark: "最新来源",
    collection: "sources",
    icon: "link",
    color: "primary",
    layout: "tabular",
    layout_query: {
      tabular: {
        sort: ["-published_at", "-date_created"],
        fields: ["title", "source_type", "platform", "published_at", "status"],
      },
    },
    filter: {
      status: {
        _eq: "active",
      },
    },
  },
  {
    bookmark: "摘要资产",
    collection: "processed_assets",
    icon: "notes",
    color: "primary",
    layout: "tabular",
    layout_query: {
      tabular: {
        sort: ["package_id", "sort_order"],
        fields: ["title", "package_id", "asset_type", "status", "sort_order"],
      },
    },
    filter: {
      _and: [
        {
          asset_type: {
            _eq: "brief",
          },
        },
        {
          status: {
            _eq: "active",
          },
        },
      ],
    },
  },
  {
    bookmark: "多媒体资产",
    collection: "processed_assets",
    icon: "perm_media",
    color: "primary",
    layout: "tabular",
    layout_query: {
      tabular: {
        sort: ["asset_type", "package_id", "sort_order"],
        fields: ["title", "package_id", "asset_type", "status", "sort_order"],
      },
    },
    filter: {
      _and: [
        {
          asset_type: {
            _in: ["audio", "slides", "video"],
          },
        },
        {
          status: {
            _eq: "active",
          },
        },
      ],
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
  if (staticToken) return staticToken;

  const payload = await api("/auth/login", {
    method: "POST",
    body: { email: adminEmail, password: adminPassword },
  });

  return payload.data.access_token;
}

async function listFolders(token) {
  const payload = await api("/folders?limit=-1&fields=id,name,parent", { token });
  return payload.data;
}

async function ensureFolder(token, name, parent = null) {
  const folders = await listFolders(token);
  const found = folders.find(
    (entry) => entry.name === name && (entry.parent ?? null) === parent
  );

  if (found) {
    return found.id;
  }

  const created = await api("/folders", {
    method: "POST",
    token,
    body: {
      name,
      parent,
    },
  });

  console.log(`created folder: ${name}`);
  return created.data.id;
}

async function ensureFolderTree(token, node, parent = null) {
  const folderId = await ensureFolder(token, node.name, parent);
  for (const child of node.children ?? []) {
    await ensureFolderTree(token, child, folderId);
  }
}

async function listPresets(token) {
  const payload = await api("/presets?limit=-1&fields=id,bookmark,collection", { token });
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
    await api(`/presets/${found.id}`, {
      method: "PATCH",
      token,
      body,
    });
    console.log(`updated preset: ${definition.bookmark}`);
    return;
  }

  await api("/presets", {
    method: "POST",
    token,
    body,
  });
  console.log(`created preset: ${definition.bookmark}`);
}

async function main() {
  const token = await login();

  await ensureFolderTree(token, folderTree, null);

  for (const preset of presetDefinitions) {
    await upsertPreset(token, preset);
  }

  console.log("phase11 upload flow applied");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
