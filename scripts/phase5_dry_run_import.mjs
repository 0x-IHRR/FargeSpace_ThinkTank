#!/usr/bin/env node

import process from "node:process";
import {
  deriveWorkflowState,
  ensureReportFile,
  loadAndValidateSeed,
  resolveProjectPath,
} from "./lib/phase5_seed.mjs";
import {
  assertSeedLookupCoverage,
  buildOptionalAssetUrl,
  createItem,
  deleteItem,
  fetchLookupMaps,
  loginAdmin,
  updateItem,
} from "./lib/phase5_directus.mjs";

const csvPath = resolveProjectPath(
  process.env.PHASE5_SEED_CSV ?? "CONTENT_SEED_20.csv"
);
const reportPath = resolveProjectPath(
  process.env.PHASE5_DRY_RUN_REPORT ?? "artifacts/phase5/dry-run-report.json"
);

function makeDrySlug(baseSlug, traceTag, index) {
  const suffix = `dryrun-${traceTag}-${index + 1}`;
  const merged = `${baseSlug}-${suffix}`;
  return merged.slice(0, 180);
}

function makeDrySourceUrl(sourceUrl, traceTag, index) {
  const parsed = new URL(sourceUrl);
  parsed.searchParams.set("phase5_dryrun", `${traceTag}-${index + 1}`);
  return parsed.toString();
}

function buildAssetInputs(row) {
  const assets = [
    {
      asset_type: "brief",
      title: `${row.packageTitle} 摘要`,
      body_markdown: row.briefBodyMarkdown,
      external_url: null,
      is_primary: true,
    },
  ];

  if (row.audioOptional) {
    assets.push({
      asset_type: "audio",
      title: `${row.packageTitle} 音频版`,
      body_markdown: null,
      external_url: buildOptionalAssetUrl(row.sourceUrl, "audio"),
      is_primary: false,
    });
  }
  if (row.slidesOptional) {
    assets.push({
      asset_type: "slides",
      title: `${row.packageTitle} 幻灯片`,
      body_markdown: null,
      external_url: buildOptionalAssetUrl(row.sourceUrl, "slides"),
      is_primary: false,
    });
  }
  if (row.videoOptional) {
    assets.push({
      asset_type: "video",
      title: `${row.packageTitle} 视频版`,
      body_markdown: null,
      external_url: buildOptionalAssetUrl(row.sourceUrl, "video"),
      is_primary: false,
    });
  }

  return assets;
}

async function cleanupDryRun(token, created) {
  const order = [
    "processed_assets",
    "package_sources",
    "package_topics",
    "package_collections",
    "packages",
    "sources",
  ];

  for (const collection of order) {
    const ids = created
      .filter((entry) => entry.collection === collection)
      .map((entry) => entry.id);
    for (const id of ids) {
      await deleteItem(token, collection, id);
    }
  }
}

async function main() {
  const startedAt = new Date().toISOString();
  const { errors, warnings, normalizedRows } = await loadAndValidateSeed(csvPath);
  if (errors.length > 0) {
    await ensureReportFile(reportPath, {
      step: "T504",
      status: "failed",
      reason: "seed validation failed",
      startedAt,
      checkedAt: new Date().toISOString(),
      errors,
      warnings,
    });
    throw new Error(`seed validation failed with ${errors.length} error(s)`);
  }

  const token = await loginAdmin();
  const lookup = await fetchLookupMaps(token);
  const lookupErrors = assertSeedLookupCoverage(normalizedRows, lookup);
  if (lookupErrors.length > 0) {
    await ensureReportFile(reportPath, {
      step: "T504",
      status: "failed",
      reason: "lookup mismatch",
      startedAt,
      checkedAt: new Date().toISOString(),
      errors: lookupErrors,
      warnings,
    });
    throw new Error(`lookup mismatch: ${lookupErrors.join("; ")}`);
  }

  const created = [];
  const traceTag = `${Date.now()}`;
  const itemCounts = {
    sources: 0,
    packages: 0,
    package_sources: 0,
    package_topics: 0,
    package_collections: 0,
    processed_assets: 0,
  };

  try {
    for (let index = 0; index < normalizedRows.length; index += 1) {
      const row = normalizedRows[index];

      const source = await createItem(token, "sources", {
        title: `[dry-run] ${row.sourceTitle}`,
        source_type: row.sourceType,
        platform: row.platform,
        source_url: makeDrySourceUrl(row.sourceUrl, traceTag, index),
        language: row.sourceLanguage,
        published_at: row.sourcePublishedAt,
        source_summary: row.notes || null,
        status: "active",
      });
      created.push({ collection: "sources", id: source.id });
      itemCounts.sources += 1;

      const packageItem = await createItem(token, "packages", {
        slug: makeDrySlug(row.packageSlug, traceTag, index),
        title: `[dry-run] ${row.packageTitle}`,
        summary: row.notes || `来源：${row.sourceTitle}`,
        primary_topic_id: lookup.topicBySlug.get(row.primaryTopic),
        member_tier_id: lookup.memberTierId,
        package_type: row.packageType,
        publication_cycle: row.publicationCycle,
        difficulty: row.difficulty,
        use_case: row.useCase,
        signal_level: row.signalLevel,
        workflow_state: "draft",
        publish_start_at: row.publishStartAt,
        sort_date: row.publishStartAt,
        raw_source_visible: row.rawSourceVisible,
        is_featured: false,
      });
      created.push({ collection: "packages", id: packageItem.id });
      itemCounts.packages += 1;

      const topicSlugs = [row.primaryTopic, ...row.additionalTopicSlugs];
      for (let topicIndex = 0; topicIndex < topicSlugs.length; topicIndex += 1) {
        const topicSlug = topicSlugs[topicIndex];
        const topicLink = await createItem(token, "package_topics", {
          package_id: packageItem.id,
          topic_id: lookup.topicBySlug.get(topicSlug),
          sort_order: topicIndex + 1,
        });
        created.push({ collection: "package_topics", id: topicLink.id });
        itemCounts.package_topics += 1;
      }

      const sourceLink = await createItem(token, "package_sources", {
        package_id: packageItem.id,
        source_id: source.id,
        is_primary: true,
        sort_order: 1,
      });
      created.push({ collection: "package_sources", id: sourceLink.id });
      itemCounts.package_sources += 1;

      const collectionLink = await createItem(token, "package_collections", {
        package_id: packageItem.id,
        collection_id: lookup.collectionBySlug.get(row.collectionSlug),
        sort_order: 1,
      });
      created.push({ collection: "package_collections", id: collectionLink.id });
      itemCounts.package_collections += 1;

      const assets = buildAssetInputs(row);
      for (let assetIndex = 0; assetIndex < assets.length; assetIndex += 1) {
        const asset = assets[assetIndex];
        const assetItem = await createItem(token, "processed_assets", {
          package_id: packageItem.id,
          asset_type: asset.asset_type,
          title: `[dry-run] ${asset.title}`,
          language: "zh",
          body_markdown: asset.body_markdown,
          external_url: asset.external_url,
          sort_order: assetIndex + 1,
          is_primary: asset.is_primary,
          status: "active",
        });
        created.push({ collection: "processed_assets", id: assetItem.id });
        itemCounts.processed_assets += 1;
      }

      await updateItem(token, "packages", packageItem.id, {
        workflow_state: deriveWorkflowState(row.publishStartAt),
        publish_start_at: row.publishStartAt,
      });
    }

    await ensureReportFile(reportPath, {
      step: "T504",
      status: "passed",
      startedAt,
      finishedAt: new Date().toISOString(),
      csvPath,
      totalRows: normalizedRows.length,
      warnings,
      createdCounts: itemCounts,
      note: "dry-run completed and all created records were cleaned up",
    });
  } finally {
    await cleanupDryRun(token, created);
  }

  console.log(`phase5 dry-run rows: ${normalizedRows.length}`);
  console.log(`phase5 dry-run report: ${reportPath}`);
  console.log("phase5 dry-run passed");
}

main().catch(async (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
