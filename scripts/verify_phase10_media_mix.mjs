#!/usr/bin/env node

import process from "node:process";

const baseUrl = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const adminEmail = process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword =
  process.env.DIRECTUS_ADMIN_PASSWORD ?? "phase1-admin-password";

const REQUIRED_SOURCE_TYPES = ["article", "video", "podcast", "paper", "website"];
const REQUIRED_ASSET_TYPES = ["brief", "audio", "slides", "video"];

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(
  path,
  { method = "GET", token, body, allowFailure = false } = {}
) {
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

  if (!allowFailure && !response.ok) {
    throw new Error(`${method} ${path} failed: ${response.status} ${text}`);
  }

  return { response, payload };
}

async function login(email, password) {
  const { payload } = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return payload.data.access_token;
}

function toMediaSummary(items) {
  const sourceTypeCount = new Map();
  const assetTypeCount = new Map();
  const matrix = new Map();

  for (const item of items) {
    const sources = new Set(
      (item.source_links || []).map((entry) => entry?.source_id?.source_type).filter(Boolean)
    );
    const assets = new Set(
      (item.assets || [])
        .filter((entry) => entry?.status === "active")
        .map((entry) => entry?.asset_type)
        .filter(Boolean)
    );

    for (const sourceType of sources) {
      sourceTypeCount.set(sourceType, (sourceTypeCount.get(sourceType) ?? 0) + 1);
      if (!matrix.has(sourceType)) {
        matrix.set(sourceType, new Map());
      }
      const row = matrix.get(sourceType);
      for (const assetType of assets) {
        row.set(assetType, (row.get(assetType) ?? 0) + 1);
      }
    }

    for (const assetType of assets) {
      assetTypeCount.set(assetType, (assetTypeCount.get(assetType) ?? 0) + 1);
    }
  }

  return { sourceTypeCount, assetTypeCount, matrix };
}

async function run() {
  const adminToken = await login(adminEmail, adminPassword);

  const query =
    "/items/packages?limit=-1&fields=slug,source_links.source_id.source_type,assets.asset_type,assets.status";
  const { payload } = await request(query, { token: adminToken });
  const items = payload.data ?? [];
  assertCondition(items.length > 0, "package list is empty");

  const summary = toMediaSummary(items);

  for (const sourceType of REQUIRED_SOURCE_TYPES) {
    assertCondition(
      summary.sourceTypeCount.has(sourceType),
      `missing source type in visible packages: ${sourceType}`
    );
  }
  for (const assetType of REQUIRED_ASSET_TYPES) {
    assertCondition(
      summary.assetTypeCount.has(assetType),
      `missing asset type in visible packages: ${assetType}`
    );
  }

  const matrixRows = REQUIRED_SOURCE_TYPES.map((sourceType) => {
    const row = summary.matrix.get(sourceType) ?? new Map();
    const parts = REQUIRED_ASSET_TYPES.map(
      (assetType) => `${assetType}:${row.get(assetType) ?? 0}`
    );
    return `${sourceType}=>${parts.join(",")}`;
  });

  console.log("phase10 T1004 media-mix check passed");
  console.log(`source_types: ${REQUIRED_SOURCE_TYPES.join(", ")}`);
  console.log(`asset_types: ${REQUIRED_ASSET_TYPES.join(", ")}`);
  console.log(`media_matrix: ${matrixRows.join(" | ")}`);
}

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
