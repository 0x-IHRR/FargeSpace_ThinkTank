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
  fetchLookupMaps,
  fetchSingleByField,
  loginAdmin,
  request,
  updateItem,
} from "./lib/phase5_directus.mjs";

const csvPath = resolveProjectPath(
  process.env.PHASE5_SEED_CSV ?? "CONTENT_SEED_20.csv"
);
const reportPath = resolveProjectPath(
  process.env.PHASE5_IMPORT_REPORT ?? "artifacts/phase5/import-report.json"
);

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

async function ensureSource(token, row) {
  const existing = await fetchSingleByField(
    token,
    "sources",
    "source_url",
    row.sourceUrl
  );

  if (existing?.id) {
    await updateItem(token, "sources", existing.id, {
      title: row.sourceTitle,
      source_type: row.sourceType,
      platform: row.platform,
      language: row.sourceLanguage,
      published_at: row.sourcePublishedAt,
      source_summary: row.notes || null,
      status: "active",
    });
    return { id: existing.id, mode: "updated" };
  }

  const created = await createItem(token, "sources", {
    title: row.sourceTitle,
    source_type: row.sourceType,
    platform: row.platform,
    source_url: row.sourceUrl,
    language: row.sourceLanguage,
    published_at: row.sourcePublishedAt,
    source_summary: row.notes || null,
    status: "active",
  });

  return { id: created.id, mode: "created" };
}

async function importPackageBundle(token, row, lookup, sourceId) {
  const packageItem = await createItem(token, "packages", {
    slug: row.packageSlug,
    title: row.packageTitle,
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

  await createItem(token, "package_sources", {
    package_id: packageItem.id,
    source_id: sourceId,
    is_primary: true,
    sort_order: 1,
  });

  const topicSlugs = [row.primaryTopic, ...row.additionalTopicSlugs];
  for (let index = 0; index < topicSlugs.length; index += 1) {
    await createItem(token, "package_topics", {
      package_id: packageItem.id,
      topic_id: lookup.topicBySlug.get(topicSlugs[index]),
      sort_order: index + 1,
    });
  }

  await createItem(token, "package_collections", {
    package_id: packageItem.id,
    collection_id: lookup.collectionBySlug.get(row.collectionSlug),
    sort_order: 1,
  });

  const assets = buildAssetInputs(row);
  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index];
    await createItem(token, "processed_assets", {
      package_id: packageItem.id,
      asset_type: asset.asset_type,
      title: asset.title,
      language: "zh",
      body_markdown: asset.body_markdown,
      external_url: asset.external_url,
      sort_order: index + 1,
      is_primary: asset.is_primary,
      status: "active",
    });
  }

  await updateItem(token, "packages", packageItem.id, {
    workflow_state: deriveWorkflowState(row.publishStartAt),
    publish_start_at: row.publishStartAt,
  });

  return packageItem.id;
}

async function verifyImportedPackages(token, expectedSlugs) {
  const { payload } = await request(
    "/items/packages?limit=-1&fields=slug,workflow_state,publish_start_at",
    { token }
  );
  const bySlug = new Map(payload.data.map((item) => [item.slug, item]));
  const missing = expectedSlugs.filter((slug) => !bySlug.has(slug));
  const invalidState = expectedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((item) => item && !["scheduled", "published"].includes(item.workflow_state))
    .map((item) => `${item.slug}:${item.workflow_state}`);

  return { missing, invalidState };
}

async function main() {
  const startedAt = new Date().toISOString();
  const { errors, warnings, normalizedRows } = await loadAndValidateSeed(csvPath);
  if (errors.length > 0) {
    await ensureReportFile(reportPath, {
      step: "T506",
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
      step: "T506",
      status: "failed",
      reason: "lookup mismatch",
      startedAt,
      checkedAt: new Date().toISOString(),
      errors: lookupErrors,
      warnings,
    });
    throw new Error(`lookup mismatch: ${lookupErrors.join("; ")}`);
  }

  const counters = {
    sourceCreated: 0,
    sourceUpdated: 0,
    packageCreated: 0,
    packageSkipped: 0,
  };
  const skippedPackages = [];

  for (const row of normalizedRows) {
    const sourceResult = await ensureSource(token, row);
    if (sourceResult.mode === "created") counters.sourceCreated += 1;
    if (sourceResult.mode === "updated") counters.sourceUpdated += 1;

    const existingPackage = await fetchSingleByField(
      token,
      "packages",
      "slug",
      row.packageSlug
    );
    if (existingPackage?.id) {
      counters.packageSkipped += 1;
      skippedPackages.push(row.packageSlug);
      continue;
    }

    await importPackageBundle(token, row, lookup, sourceResult.id);
    counters.packageCreated += 1;
  }

  const verification = await verifyImportedPackages(
    token,
    normalizedRows.map((row) => row.packageSlug)
  );

  const status =
    verification.missing.length === 0 && verification.invalidState.length === 0
      ? "passed"
      : "failed";

  await ensureReportFile(reportPath, {
    step: "T506",
    status,
    startedAt,
    finishedAt: new Date().toISOString(),
    csvPath,
    totalRows: normalizedRows.length,
    warnings,
    counters,
    skippedPackages,
    verification,
  });

  if (status !== "passed") {
    throw new Error("import verification failed");
  }

  console.log(`phase5 import rows: ${normalizedRows.length}`);
  console.log(`phase5 import report: ${reportPath}`);
  console.log(
    `created packages: ${counters.packageCreated}, skipped packages: ${counters.packageSkipped}`
  );
  console.log("phase5 import passed");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
