import process from "node:process";

const baseUrl = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const adminEmail =
  process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword =
  process.env.DIRECTUS_ADMIN_PASSWORD ?? "phase1-admin-password";

export async function request(
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

export async function loginAdmin() {
  const { payload } = await request("/auth/login", {
    method: "POST",
    body: { email: adminEmail, password: adminPassword },
  });
  return payload.data.access_token;
}

export async function fetchSingleByField(token, collection, field, value) {
  const { payload } = await request(
    `/items/${collection}?limit=1&filter[${field}][_eq]=${encodeURIComponent(value)}`,
    { token }
  );
  return payload.data[0] ?? null;
}

export async function createItem(token, collection, body) {
  const { payload } = await request(`/items/${collection}`, {
    method: "POST",
    token,
    body,
  });
  return payload.data;
}

export async function updateItem(token, collection, id, body) {
  const { payload } = await request(`/items/${collection}/${id}`, {
    method: "PATCH",
    token,
    body,
  });
  return payload.data;
}

export async function deleteItem(token, collection, id) {
  await request(`/items/${collection}/${id}`, {
    method: "DELETE",
    token,
    allowFailure: true,
  });
}

export async function fetchLookupMaps(token) {
  const topicItems = await request(
    "/items/topics?limit=-1&fields=id,slug,status",
    { token }
  );
  const collectionItems = await request(
    "/items/curated_collections?limit=-1&fields=id,slug,status",
    { token }
  );
  const tier = await fetchSingleByField(
    token,
    "member_tiers",
    "code",
    "standard_member"
  );

  if (!tier?.id) {
    throw new Error("missing member_tiers.code=standard_member");
  }

  const topicBySlug = new Map(
    topicItems.payload.data
      .filter((item) => item.status === "active")
      .map((item) => [item.slug, item.id])
  );

  const collectionBySlug = new Map(
    collectionItems.payload.data
      .filter((item) => item.status === "active")
      .map((item) => [item.slug, item.id])
  );

  return {
    topicBySlug,
    collectionBySlug,
    memberTierId: tier.id,
  };
}

export function assertSeedLookupCoverage(normalizedRows, lookup) {
  const errors = [];
  for (const row of normalizedRows) {
    if (!lookup.topicBySlug.has(row.primaryTopic)) {
      errors.push(
        `seed ${row.seedId}: missing active topic slug "${row.primaryTopic}"`
      );
    }
    for (const topicSlug of row.additionalTopicSlugs) {
      if (!lookup.topicBySlug.has(topicSlug)) {
        errors.push(
          `seed ${row.seedId}: missing active topic slug "${topicSlug}"`
        );
      }
    }
    if (!lookup.collectionBySlug.has(row.collectionSlug)) {
      errors.push(
        `seed ${row.seedId}: missing active curated_collection slug "${row.collectionSlug}"`
      );
    }
  }

  return errors;
}

export function buildOptionalAssetUrl(sourceUrl, suffix) {
  const parsed = new URL(sourceUrl);
  parsed.searchParams.set("phase5_asset", suffix);
  return parsed.toString();
}
