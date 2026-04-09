#!/usr/bin/env node

import process from "node:process";

const baseUrl = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const adminEmail = process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword =
  process.env.DIRECTUS_ADMIN_PASSWORD ?? "phase1-admin-password";
const staticToken = process.env.DIRECTUS_TOKEN ?? null;

const requiredFolders = [
  ["FargeSpace Uploads", null],
  ["来源封面", "FargeSpace Uploads"],
  ["内容封面", "FargeSpace Uploads"],
  ["摘要附件", "FargeSpace Uploads"],
  ["音频文件", "FargeSpace Uploads"],
  ["幻灯片文件", "FargeSpace Uploads"],
  ["视频文件", "FargeSpace Uploads"],
];

const requiredPresets = [
  ["packages", "待补来源"],
  ["packages", "待补摘要"],
  ["packages", "可排期"],
  ["packages", "已排期"],
  ["packages", "已发布"],
  ["sources", "最新来源"],
  ["processed_assets", "摘要资产"],
  ["processed_assets", "多媒体资产"],
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

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const token = await login();
  const folders = (await api("/folders?limit=-1&fields=id,name,parent", { token })).data;
  const presets = (
    await api("/presets?limit=-1&fields=id,bookmark,collection", { token })
  ).data;

  const folderById = new Map(folders.map((entry) => [entry.id, entry]));

  for (const [name, parentName] of requiredFolders) {
    const found = folders.find((entry) => {
      if (entry.name !== name) return false;
      if (parentName === null) return entry.parent === null;
      return folderById.get(entry.parent)?.name === parentName;
    });
    assertCondition(Boolean(found), `missing folder: ${parentName ?? "root"} / ${name}`);
  }

  for (const [collection, bookmark] of requiredPresets) {
    const found = presets.find(
      (entry) => entry.collection === collection && entry.bookmark === bookmark
    );
    assertCondition(Boolean(found), `missing preset: ${collection} / ${bookmark}`);
  }

  console.log("phase11 upload flow verified");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
