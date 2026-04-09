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
  return payload.data.id;
}

async function createPackageForEditor(editorToken, { topicId, tierId }) {
  const { payload } = await request("/items/packages", {
    method: "POST",
    token: editorToken,
    body: {
      slug: `phase10-editor-${Date.now()}`,
      title: "Phase10 Editor Permission Check",
      summary: "editor can create content package",
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

  cleanup.push({ kind: "item", collection: "packages", id: payload.data.id });
}

async function cleanupResources(adminToken) {
  const items = cleanup.filter((entry) => entry.kind === "item");
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

  const editorRoleId = await fetchRoleIdByName(adminToken, "Editor");
  const memberRoleId = await fetchRoleIdByName(adminToken, "Member");

  const editorEmail = `phase10-editor-${Date.now()}@example.com`;
  const memberEmail = `phase10-member-${Date.now()}@example.com`;

  await createUser(adminToken, editorEmail, editorRoleId);
  await createUser(adminToken, memberEmail, memberRoleId);

  const editorToken = await login(editorEmail, tempPassword);
  const memberToken = await login(memberEmail, tempPassword);

  const topicId = await fetchSingleId(adminToken, "topics", "slug", "agents");
  const tierId = await fetchSingleId(
    adminToken,
    "member_tiers",
    "code",
    "standard_member"
  );

  const adminUsers = await request("/users?limit=1", { token: adminToken });
  assertCondition(adminUsers.response.status === 200, "admin should read users");

  await createPackageForEditor(editorToken, { topicId, tierId });

  const editorCreateUser = await request("/users", {
    method: "POST",
    token: editorToken,
    allowFailure: true,
    body: {
      email: `phase10-blocked-${Date.now()}@example.com`,
      password: tempPassword,
    },
  });
  assertCondition(
    editorCreateUser.response.status === 403,
    "editor should not create users"
  );

  const memberPackages = await request("/items/packages?fields=id,slug&limit=3", {
    token: memberToken,
  });
  assertCondition(
    memberPackages.response.status === 200 && Array.isArray(memberPackages.payload.data),
    "member should read packages in visible scope"
  );

  const memberReadSources = await request("/items/sources?fields=id&limit=1", {
    token: memberToken,
    allowFailure: true,
  });
  assertCondition(
    memberReadSources.response.status === 403,
    "member should not read raw sources directly"
  );

  const anonymousPackages = await request("/items/packages?fields=id&limit=1", {
    allowFailure: true,
  });
  assertCondition(
    anonymousPackages.response.status === 401 || anonymousPackages.response.status === 403,
    "anonymous should not read member packages"
  );

  console.log("phase10 T1002 role check passed");
  console.log(
    "checked_roles: admin(read users), editor(create package + denied create-user), member(read packages + denied raw sources), anonymous(denied packages)"
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
