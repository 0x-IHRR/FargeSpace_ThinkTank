#!/usr/bin/env node

import process from "node:process";

const baseUrl = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const adminEmail = process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword =
  process.env.DIRECTUS_ADMIN_PASSWORD ?? "phase1-admin-password";
const tempPassword = "phase10-temp-pass-123456";

const cleanup = [];

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

async function fetchRoleIdByName(token, roleName) {
  const { payload } = await request("/roles", { token });
  const role = payload.data.find((entry) => entry.name === roleName);
  if (!role?.id) throw new Error(`missing role ${roleName}`);
  return role.id;
}

async function fetchSingleId(token, collection, field, value) {
  const { payload } = await request(
    `/items/${collection}?limit=1&filter[${field}][_eq]=${encodeURIComponent(value)}`,
    { token }
  );
  if (!payload.data[0]?.id) throw new Error(`missing ${collection}.${field}=${value}`);
  return payload.data[0].id;
}

function buildSlug(prefix) {
  return `phase10-${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function createUser(adminToken, email, roleId) {
  const { payload } = await request("/users", {
    method: "POST",
    token: adminToken,
    body: {
      email,
      password: tempPassword,
      first_name: "Temp",
      last_name: "Phase10",
      role: roleId,
      status: "active",
    },
  });
  cleanup.push({ kind: "user", id: payload.data.id });
}

async function createItem(token, collection, body) {
  const { payload } = await request(`/items/${collection}`, {
    method: "POST",
    token,
    body,
  });
  cleanup.push({ kind: "item", collection, id: payload.data.id });
  return payload.data.id;
}

async function createPackageWithLinks(
  adminToken,
  { slug, title, workflowState, topicId, tierId, publishStartAt, publishEndAt = null }
) {
  const sourceId = await createItem(adminToken, "sources", {
    title: `${title} Source`,
    source_type: "article",
    platform: "OpenAI",
    source_url: `https://example.com/${slug}`,
    language: "en",
    status: "active",
  });

  const packageId = await createItem(adminToken, "packages", {
    slug,
    title,
    summary: `${title} summary`,
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

  await createItem(adminToken, "package_topics", {
    package_id: packageId,
    topic_id: topicId,
    sort_order: 1,
  });

  await createItem(adminToken, "package_sources", {
    package_id: packageId,
    source_id: sourceId,
    is_primary: true,
    sort_order: 1,
  });

  await createItem(adminToken, "processed_assets", {
    package_id: packageId,
    asset_type: "brief",
    title: `${title} brief`,
    language: "zh",
    body_markdown: "phase10 visibility check",
    sort_order: 1,
    is_primary: true,
    status: "active",
  });

  await request(`/items/packages/${packageId}`, {
    method: "PATCH",
    token: adminToken,
    body: {
      workflow_state: workflowState,
      publish_start_at: publishStartAt,
      publish_end_at: publishEndAt,
    },
  });

  return packageId;
}

async function cleanupResources(adminToken) {
  const byPriority = {
    package_collections: 1,
    package_topics: 1,
    package_sources: 1,
    processed_assets: 1,
    packages: 2,
    sources: 3,
  };

  const items = cleanup
    .filter((entry) => entry.kind === "item")
    .sort(
      (left, right) =>
        (byPriority[left.collection] ?? 99) - (byPriority[right.collection] ?? 99)
    );

  for (const item of items) {
    await request(`/items/${item.collection}/${item.id}`, {
      method: "DELETE",
      token: adminToken,
      allowFailure: true,
    });
  }

  const users = cleanup.filter((entry) => entry.kind === "user");
  for (const user of users) {
    await request(`/users/${user.id}`, {
      method: "DELETE",
      token: adminToken,
      allowFailure: true,
    });
  }
}

let adminTokenForCleanup = null;

async function run() {
  const adminToken = await login(adminEmail, adminPassword);
  adminTokenForCleanup = adminToken;

  const memberRoleId = await fetchRoleIdByName(adminToken, "Member");
  const memberEmail = `phase10-visibility-${Date.now()}@example.com`;
  await createUser(adminToken, memberEmail, memberRoleId);
  const memberToken = await login(memberEmail, tempPassword);

  const topicId = await fetchSingleId(adminToken, "topics", "slug", "agents");
  const tierId = await fetchSingleId(
    adminToken,
    "member_tiers",
    "code",
    "standard_member"
  );

  const publishedSlug = buildSlug("published");
  const draftSlug = buildSlug("draft");
  const scheduledSlug = buildSlug("scheduled");

  await createPackageWithLinks(adminToken, {
    slug: publishedSlug,
    title: "Phase10 Published Visibility Check",
    workflowState: "published",
    topicId,
    tierId,
    publishStartAt: "2026-01-01T00:00:00Z",
  });

  await createPackageWithLinks(adminToken, {
    slug: draftSlug,
    title: "Phase10 Draft Visibility Check",
    workflowState: "draft",
    topicId,
    tierId,
    publishStartAt: null,
  });

  await createPackageWithLinks(adminToken, {
    slug: scheduledSlug,
    title: "Phase10 Scheduled Visibility Check",
    workflowState: "scheduled",
    topicId,
    tierId,
    publishStartAt: "2099-01-01T00:00:00Z",
  });

  const memberPackages = await request("/items/packages?fields=slug&limit=-1", {
    token: memberToken,
  });
  const slugs = memberPackages.payload.data.map((item) => item.slug);
  assertCondition(slugs.includes(publishedSlug), "member cannot see published package");
  assertCondition(!slugs.includes(draftSlug), "member can see draft package");
  assertCondition(!slugs.includes(scheduledSlug), "member can see scheduled package");

  console.log("phase10 T1003 publish-state check passed");
  console.log(
    `checked_visibility: published=${publishedSlug} visible, draft=${draftSlug} hidden, scheduled=${scheduledSlug} hidden`
  );
}

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (!adminTokenForCleanup) return;
    await cleanupResources(adminTokenForCleanup);
  });
