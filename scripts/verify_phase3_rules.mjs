#!/usr/bin/env node

import process from "node:process";

const baseUrl = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const adminEmail =
  process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword =
  process.env.DIRECTUS_ADMIN_PASSWORD ?? "phase1-admin-password";

const cleanupStack = [];

async function api(path, { method = "GET", token, body, expectedStatus, allowFailure = false } = {}) {
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

  if (expectedStatus && response.status !== expectedStatus) {
    throw new Error(
      `${method} ${path} returned ${response.status}, expected ${expectedStatus}: ${text}`
    );
  }

  if (!expectedStatus && !allowFailure && !response.ok) {
    throw new Error(`${method} ${path} failed: ${response.status} ${text}`);
  }

  return { response, payload };
}

async function login() {
  const { payload } = await api("/auth/login", {
    method: "POST",
    body: { email: adminEmail, password: adminPassword },
  });
  return payload.data.access_token;
}

async function getSingleId(token, collection, field, value) {
  const { payload } = await api(
    `/items/${collection}?limit=1&filter[${field}][_eq]=${encodeURIComponent(
      value
    )}`,
    { token }
  );

  if (!payload.data[0]?.id) {
    throw new Error(`missing seed in ${collection}: ${field}=${value}`);
  }

  return payload.data[0].id;
}

async function createItem(token, collection, body) {
  const { payload } = await api(`/items/${collection}`, {
    method: "POST",
    token,
    body,
  });
  cleanupStack.push({ collection, id: payload.data.id });
  return payload.data.id;
}

async function expectFailure(request, expectedSubstring) {
  const { response, payload } = await request();
  if (response.ok) {
    throw new Error(`expected failure containing "${expectedSubstring}"`);
  }
  const message = JSON.stringify(payload);
  if (!message.includes(expectedSubstring)) {
    throw new Error(
      `expected failure containing "${expectedSubstring}", got ${message}`
    );
  }
}

async function cleanup(token) {
  const order = [
    "packages",
    "package_sources",
    "package_topics",
    "package_collections",
    "processed_assets",
    "sources",
    "topics",
    "curated_collections",
    "member_tiers",
  ];

  const entries = [...cleanupStack].sort((left, right) => {
    return order.indexOf(left.collection) - order.indexOf(right.collection);
  });

  for (const entry of entries) {
    await api(`/items/${entry.collection}/${entry.id}`, {
      method: "DELETE",
      token,
      expectedStatus: 204,
    }).catch((error) => {
      if (error.message.includes("404")) return null;
      throw error;
    });
  }
}

async function main() {
  const token = await login();
  const topicId = await getSingleId(token, "topics", "slug", "agents");
  const tierId = await getSingleId(
    token,
    "member_tiers",
    "code",
    "standard_member"
  );

  try {
    const sourceA = await createItem(token, "sources", {
      title: "Phase 3 Source A",
      source_type: "article",
      platform: "OpenAI",
      source_url: `https://example.com/phase3-source-a-${Date.now()}`,
      language: "en",
      status: "active",
    });

    const sourceB = await createItem(token, "sources", {
      title: "Phase 3 Source B",
      source_type: "article",
      platform: "Anthropic",
      source_url: `https://example.com/phase3-source-b-${Date.now()}`,
      language: "en",
      status: "active",
    });

    const packageId = await createItem(token, "packages", {
      slug: `phase3-verify-${Date.now()}`,
      title: "Phase 3 Verification Package",
      summary: "用于验证发布规则",
      primary_topic_id: topicId,
      member_tier_id: tierId,
      package_type: "recap",
      difficulty: "beginner",
      use_case: "awareness",
      signal_level: "reference",
      workflow_state: "draft",
      sort_date: "2026-04-09T10:00:00Z",
      raw_source_visible: true,
      is_featured: false,
    });

    await expectFailure(
      () =>
        api(`/items/packages/${packageId}`, {
          method: "PATCH",
          token,
          body: {
            workflow_state: "published",
          },
          allowFailure: true,
        }),
      "publish_start_at"
    );

    await expectFailure(
      () =>
        api("/items/processed_assets", {
          method: "POST",
          token,
          body: {
            package_id: packageId,
            asset_type: "brief",
            title: "空摘要",
            language: "zh",
            sort_order: 1,
            is_primary: true,
            status: "active",
          },
          allowFailure: true,
        }),
      "brief 类型必须至少提供正文或文件"
    );

    const assetPrimary = await createItem(token, "processed_assets", {
      package_id: packageId,
      asset_type: "brief",
      title: "有效摘要",
      language: "zh",
      body_markdown: "这是一个有效摘要。",
      sort_order: 1,
      is_primary: true,
      status: "active",
    });

    await expectFailure(
      () =>
        api("/items/processed_assets", {
          method: "POST",
          token,
          body: {
            package_id: packageId,
            asset_type: "audio",
            title: "第二个主资产",
            language: "zh",
            external_url: "https://example.com/audio.mp3",
            sort_order: 2,
            is_primary: true,
            status: "active",
          },
          allowFailure: true,
        }),
      "has to be unique"
    );

    await createItem(token, "package_topics", {
      package_id: packageId,
      topic_id: topicId,
      sort_order: 1,
    });

    const primarySourceLink = await createItem(token, "package_sources", {
      package_id: packageId,
      source_id: sourceA,
      is_primary: true,
      sort_order: 1,
    });

    await expectFailure(
      () =>
        api("/items/package_sources", {
          method: "POST",
          token,
          body: {
            package_id: packageId,
            source_id: sourceB,
            is_primary: true,
            sort_order: 2,
          },
          allowFailure: true,
        }),
      "has to be unique"
    );

    await api(`/items/packages/${packageId}`, {
      method: "PATCH",
      token,
      body: {
        workflow_state: "scheduled",
        publish_start_at: "2026-04-10T09:00:00Z",
      },
    });

    await expectFailure(
      () =>
        api(`/items/package_topics/${cleanupStack.find((entry) => entry.collection === "package_topics")?.id}`, {
          method: "DELETE",
          token,
          allowFailure: true,
        }),
      "primary_topic_id 必须同时存在于 package_topics"
    );

    await expectFailure(
      () =>
        api(`/items/package_sources/${primarySourceLink}`, {
          method: "DELETE",
          token,
          allowFailure: true,
        }),
      "必须至少关联 1 个来源"
    );

    await expectFailure(
      () =>
        api(`/items/processed_assets/${assetPrimary}`, {
          method: "PATCH",
          token,
          body: {
            status: "archived",
          },
          allowFailure: true,
        }),
      "必须至少保留 1 个有效加工内容"
    );

    console.log("phase 3 verification passed");
  } finally {
    await cleanup(token);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
