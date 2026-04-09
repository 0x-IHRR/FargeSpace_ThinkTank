#!/usr/bin/env node

import process from "node:process";

const baseUrl = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const adminEmail =
  process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword =
  process.env.DIRECTUS_ADMIN_PASSWORD ?? "phase1-admin-password";

const cleanup = [];

async function request(path, { method = "GET", token, body, allowFailure = false } = {}) {
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

async function fetchSingleId(token, collection, field, value) {
  const { payload } = await request(
    `/items/${collection}?limit=1&filter[${field}][_eq]=${encodeURIComponent(value)}`,
    { token }
  );
  if (!payload.data[0]?.id) throw new Error(`missing ${collection}.${field}=${value}`);
  return payload.data[0].id;
}

async function fetchRoleIdByName(token, roleName) {
  const { payload } = await request("/roles", { token });
  const role = payload.data.find((entry) => entry.name === roleName);
  if (!role?.id) throw new Error(`missing role ${roleName}`);
  return role.id;
}

async function createUser(adminToken, email, roleId) {
  const { payload } = await request("/users", {
    method: "POST",
    token: adminToken,
    body: {
      email,
      password: "phase4-temp-pass-123456",
      first_name: "Temp",
      last_name: "Phase4",
      role: roleId,
      status: "active",
    },
  });

  cleanup.push({ kind: "user", id: payload.data.id });
  return payload.data.id;
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

async function ensureCondition(cond, message) {
  if (!cond) throw new Error(message);
}

async function run() {
  const adminToken = await login(adminEmail, adminPassword);

  const roleEditor = await fetchRoleIdByName(adminToken, "Editor");
  const roleMember = await fetchRoleIdByName(adminToken, "Member");

  const editorEmail = `temp-editor-${Date.now()}@example.com`;
  const memberEmail = `temp-member-${Date.now()}@example.com`;

  await createUser(adminToken, editorEmail, roleEditor);
  await createUser(adminToken, memberEmail, roleMember);

  const editorToken = await login(editorEmail, "phase4-temp-pass-123456");
  const memberToken = await login(memberEmail, "phase4-temp-pass-123456");

  const topicId = await fetchSingleId(adminToken, "topics", "slug", "agents");
  const tierId = await fetchSingleId(adminToken, "member_tiers", "code", "standard_member");

  const sourcePublished = await createItem(adminToken, "sources", {
    title: "Phase4 Published Source",
    source_type: "article",
    platform: "OpenAI",
    source_url: `https://example.com/phase4-published-${Date.now()}`,
    language: "en",
    status: "active",
  });

  const sourceHidden = await createItem(adminToken, "sources", {
    title: "Phase4 Hidden Source",
    source_type: "article",
    platform: "Anthropic",
    source_url: `https://example.com/phase4-hidden-${Date.now()}`,
    language: "en",
    status: "active",
  });

  const publishedPackage = await createItem(adminToken, "packages", {
    slug: `phase4-published-${Date.now()}`,
    title: "Phase4 Published Package",
    summary: "visible to member",
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

  const hiddenPackage = await createItem(adminToken, "packages", {
    slug: `phase4-hidden-${Date.now()}`,
    title: "Phase4 Hidden Package",
    summary: "not visible to member",
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

  const publishedTopicLink = await createItem(adminToken, "package_topics", {
    package_id: publishedPackage,
    topic_id: topicId,
    sort_order: 1,
  });

  const hiddenTopicLink = await createItem(adminToken, "package_topics", {
    package_id: hiddenPackage,
    topic_id: topicId,
    sort_order: 1,
  });

  const publishedSourceLink = await createItem(adminToken, "package_sources", {
    package_id: publishedPackage,
    source_id: sourcePublished,
    is_primary: true,
    sort_order: 1,
  });

  const hiddenSourceLink = await createItem(adminToken, "package_sources", {
    package_id: hiddenPackage,
    source_id: sourceHidden,
    is_primary: true,
    sort_order: 1,
  });

  const publishedAsset = await createItem(adminToken, "processed_assets", {
    package_id: publishedPackage,
    asset_type: "brief",
    title: "visible brief",
    language: "zh",
    body_markdown: "visible",
    sort_order: 1,
    is_primary: true,
    status: "active",
  });

  const hiddenAsset = await createItem(adminToken, "processed_assets", {
    package_id: hiddenPackage,
    asset_type: "brief",
    title: "hidden brief",
    language: "zh",
    body_markdown: "hidden",
    sort_order: 1,
    is_primary: true,
    status: "active",
  });

  await request(`/items/packages/${publishedPackage}`, {
    method: "PATCH",
    token: adminToken,
    body: {
      workflow_state: "published",
      publish_start_at: "2026-01-01T00:00:00Z",
    },
  });

  await request(`/items/packages/${hiddenPackage}`, {
    method: "PATCH",
    token: adminToken,
    body: {
      workflow_state: "scheduled",
      publish_start_at: "2099-01-01T00:00:00Z",
    },
  });

  const memberPackages = await request(
    "/items/packages?fields=id,title,slug&sort=slug",
    { token: memberToken }
  );
  const memberPackageSlugs = memberPackages.payload.data.map((item) => item.slug);
  await ensureCondition(
    memberPackageSlugs.some((slug) => slug.includes("phase4-published")),
    "member cannot see published package"
  );
  await ensureCondition(
    !memberPackageSlugs.some((slug) => slug.includes("phase4-hidden")),
    "member can see non-published package"
  );

  const memberPackageSources = await request(
    "/items/package_sources?fields=id,package_id,source_id,is_primary&sort=id",
    { token: memberToken }
  );
  const memberSourceLinks = memberPackageSources.payload.data.map((item) => item.source_id);
  await ensureCondition(
    memberSourceLinks.includes(sourcePublished),
    "member cannot see source link of visible package"
  );
  await ensureCondition(
    !memberSourceLinks.includes(sourceHidden),
    "member can see source link of hidden package"
  );

  const directSourceRead = await request(
    "/items/sources?fields=id,title&sort=title",
    { token: memberToken, allowFailure: true }
  );
  await ensureCondition(
    directSourceRead.response.status === 403,
    "member should not read raw sources directly"
  );

  const memberAssets = await request(
    "/items/processed_assets?fields=id,title&sort=title",
    { token: memberToken }
  );
  const assetTitles = memberAssets.payload.data.map((item) => item.title);
  await ensureCondition(
    assetTitles.includes("visible brief"),
    "member cannot see asset of visible package"
  );
  await ensureCondition(
    !assetTitles.includes("hidden brief"),
    "member can see asset of hidden package"
  );

  const editorCreate = await request("/items/packages", {
    method: "POST",
    token: editorToken,
    body: {
      slug: `phase4-editor-${Date.now()}`,
      title: "Editor Create Test",
      summary: "editor can create",
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
    },
  });
  cleanup.push({
    kind: "item",
    collection: "packages",
    id: editorCreate.payload.data.id,
  });

  const editorCannotCreateUser = await request("/users", {
    method: "POST",
    token: editorToken,
    allowFailure: true,
    body: {
      email: `phase4-blocked-${Date.now()}@example.com`,
      password: "phase4-temp-pass-123456",
    },
  });
  await ensureCondition(
    editorCannotCreateUser.response.status === 403,
    "editor should not create users"
  );

  const anonymousRead = await request("/items/packages?fields=id,slug", {
    allowFailure: true,
  });
  await ensureCondition(
    anonymousRead.response.status === 401 || anonymousRead.response.status === 403,
    "anonymous should not read member packages"
  );

  console.log("phase 4 access verification passed");
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
run()
  .then(async () => {
    adminTokenForCleanup = await login(adminEmail, adminPassword);
    await cleanupResources(adminTokenForCleanup);
  })
  .catch(async (error) => {
    try {
      adminTokenForCleanup = adminTokenForCleanup ?? (await login(adminEmail, adminPassword));
      await cleanupResources(adminTokenForCleanup);
    } catch (_) {
      // ignore cleanup failure to preserve original error
    }
    console.error(error.message);
    process.exitCode = 1;
  });
