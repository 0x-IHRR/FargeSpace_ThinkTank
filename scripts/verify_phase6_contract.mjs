#!/usr/bin/env node

import { loginAdmin, request } from "./lib/phase5_directus.mjs";

function assertFields(record, pathList, scopeName) {
  for (const path of pathList) {
    const keys = path.split(".");
    let current = record;
    for (const key of keys) {
      if (current == null || !(key in current)) {
        throw new Error(`${scopeName} missing field: ${path}`);
      }
      current = current[key];
    }
  }
}

async function verifyListContract(serviceToken) {
  const query = [
    "fields=slug,title,summary,cover_file_id,cover_file_id.id,cover_file_id.filename_download,primary_topic_id.slug,primary_topic_id.name,package_type,sort_date,is_featured,assets.asset_type,publish_start_at,publish_end_at",
    "filter[workflow_state][_eq]=published",
    "filter[publish_start_at][_nnull]=true",
    "filter[publish_start_at][_lte]=2026-12-31T23:59:59Z",
    "filter[_or][0][publish_end_at][_null]=true",
    "filter[_or][1][publish_end_at][_gte]=2026-04-09T00:00:00Z",
    "sort=-sort_date",
    "limit=12",
  ].join("&");

  const { payload } = await request(`/items/packages?${query}`, {
    token: serviceToken,
  });
  const items = payload.data;
  if (items.length === 0) {
    throw new Error("package list returned empty");
  }

  assertFields(
    items[0],
    [
      "slug",
      "title",
      "summary",
      "cover_file_id",
      "primary_topic_id.slug",
      "primary_topic_id.name",
      "package_type",
      "sort_date",
      "is_featured",
      "assets",
    ],
    "T601 package list"
  );

  const availableAssetTypes = [
    ...new Set(items.flatMap((item) => item.assets.map((asset) => asset.asset_type))),
  ].sort();

  return {
    sampleSlug: items[0].slug,
    itemCount: items.length,
    availableAssetTypes,
  };
}

async function verifyDetailContract(serviceToken, slug) {
  const query = [
    "fields=slug,title,summary,cover_file_id,cover_file_id.id,cover_file_id.filename_download,package_type,publication_cycle,difficulty,use_case,signal_level,sort_date,publish_start_at,publish_end_at,is_featured,seo_title,seo_description,raw_source_visible,primary_topic_id.slug,primary_topic_id.name,assets.id,assets.asset_type,assets.title,assets.language,assets.body_markdown,assets.external_url,assets.duration_seconds,assets.sort_order,assets.is_primary,assets.status,source_links.id,source_links.is_primary,source_links.sort_order,source_links.source_id.id,source_links.source_id.title,source_links.source_id.source_type,source_links.source_id.platform,source_links.source_id.source_url,source_links.source_id.language,source_links.source_id.published_at,topic_links.id,topic_links.sort_order,topic_links.topic_id.slug,topic_links.topic_id.name,collection_links.id,collection_links.sort_order,collection_links.collection_id.slug,collection_links.collection_id.name,collection_links.collection_id.collection_type",
    `filter[slug][_eq]=${encodeURIComponent(slug)}`,
    "limit=1",
  ].join("&");

  const { payload } = await request(`/items/packages?${query}`, {
    token: serviceToken,
  });

  if (!payload.data[0]) {
    throw new Error(`package detail not found by slug: ${slug}`);
  }
  const item = payload.data[0];

  assertFields(
    item,
    [
      "slug",
      "title",
      "summary",
      "primary_topic_id.slug",
      "assets",
      "source_links",
      "topic_links",
      "collection_links",
    ],
    "T602 package detail"
  );

  const assetsOrdered = [...item.assets]
    .filter((asset) => asset.status === "active")
    .sort((a, b) => a.sort_order - b.sort_order);
  const sourcesOrdered = [...item.source_links].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return {
    assetCount: assetsOrdered.length,
    sourceCount: sourcesOrdered.length,
    topicCount: item.topic_links.length,
    collectionCount: item.collection_links.length,
  };
}

async function verifySearchContract(serviceToken) {
  const baseFields =
    "fields=slug,title,summary,package_type,sort_date,primary_topic_id.slug,primary_topic_id.name,source_links.source_id.source_type,assets.asset_type";

  const queryA = [
    baseFields,
    "search=Agent",
    "filter[workflow_state][_eq]=published",
    "filter[publish_start_at][_lte]=2026-12-31T23:59:59Z",
    "sort=-sort_date",
    "limit=10",
  ].join("&");
  const queryB = [
    baseFields,
    "filter[topic_links][topic_id][slug][_eq]=agents",
    "filter[package_type][_eq]=deep_dive",
    "filter[source_links][source_id][source_type][_eq]=article",
    "filter[publish_start_at][_gte]=2025-01-01T00:00:00Z",
    "filter[publish_start_at][_lte]=2026-12-31T23:59:59Z",
    "sort=-sort_date",
    "limit=10",
  ].join("&");

  const [resultA, resultB] = await Promise.all([
    request(`/items/packages?${queryA}`, { token: serviceToken }),
    request(`/items/packages?${queryB}`, { token: serviceToken }),
  ]);

  return {
    keywordResultCount: resultA.payload.data.length,
    filteredResultCount: resultB.payload.data.length,
  };
}

async function verifyTopicCollectionSummary(serviceToken) {
  const topicQuery = [
    "fields=slug,name,description,sort_order",
    "filter[status][_eq]=active",
    "sort=sort_order",
    "limit=100",
  ].join("&");
  const collectionQuery = [
    "fields=slug,name,description,collection_type,sort_order",
    "filter[status][_eq]=active",
    "sort=sort_order",
    "limit=100",
  ].join("&");

  const [topics, collections] = await Promise.all([
    request(`/items/topics?${topicQuery}`, { token: serviceToken }),
    request(`/items/curated_collections?${collectionQuery}`, {
      token: serviceToken,
    }),
  ]);

  if (topics.payload.data.length === 0) {
    throw new Error("topic summary returned empty");
  }
  if (collections.payload.data.length === 0) {
    throw new Error("collection summary returned empty");
  }

  assertFields(
    topics.payload.data[0],
    ["slug", "name", "description", "sort_order"],
    "T604 topic summary"
  );
  assertFields(
    collections.payload.data[0],
    ["slug", "name", "description", "collection_type", "sort_order"],
    "T604 collection summary"
  );

  return {
    topicCount: topics.payload.data.length,
    collectionCount: collections.payload.data.length,
  };
}

async function main() {
  const serviceToken = await loginAdmin();
  const list = await verifyListContract(serviceToken);
  const detail = await verifyDetailContract(serviceToken, list.sampleSlug);
  const search = await verifySearchContract(serviceToken);
  const summary = await verifyTopicCollectionSummary(serviceToken);

  console.log("phase6 contract verify passed");
  console.log(`sample_slug: ${list.sampleSlug}`);
  console.log(`list_count: ${list.itemCount}`);
  console.log(`assets_available: ${list.availableAssetTypes.join(", ")}`);
  console.log(
    `detail_counts: assets=${detail.assetCount}, sources=${detail.sourceCount}, topics=${detail.topicCount}, collections=${detail.collectionCount}`
  );
  console.log(
    `search_counts: keyword=${search.keywordResultCount}, filtered=${search.filteredResultCount}`
  );
  console.log(
    `summary_counts: topics=${summary.topicCount}, collections=${summary.collectionCount}`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
