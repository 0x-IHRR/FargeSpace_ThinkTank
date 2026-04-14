#!/usr/bin/env node

import process from "node:process";

import {
  createItem,
  deleteItem,
  fetchSingleByField,
  loginAdmin,
  request,
  updateItem,
} from "./lib/phase5_directus.mjs";
import {
  assertCondition,
  buildGenerationPlan,
  collectValidationIssues,
  ensureReportFile,
  fetchContentIntake,
  summarizeValidationIssues,
  writeGenerationFailure,
  writeGenerationSuccess,
} from "./lib/phase21_content_intake.mjs";

const contentIntakeId = process.env.CONTENT_INTAKE_ID ?? "";
const reportRelativePath =
  process.env.PHASE21_IMPORT_REPORT ?? "artifacts/phase21/content-intake-import.json";

async function cleanupCreated(token, createdItems) {
  const order = [
    "processed_assets",
    "package_sources",
    "package_topics",
    "package_collections",
    "packages",
    "sources",
  ];

  for (const collection of order) {
    const ids = createdItems
      .filter((entry) => entry.collection === collection)
      .map((entry) => entry.id);
    for (const id of ids) {
      await deleteItem(token, collection, id);
    }
  }
}

async function main() {
  assertCondition(contentIntakeId, "CONTENT_INTAKE_ID is required");

  const token = await loginAdmin();
  const item = await fetchContentIntake(token, request, contentIntakeId);
  assertCondition(Boolean(item), `content_intake not found: ${contentIntakeId}`);

  if (item.generated_package_id?.id && item.generation_status === "generated") {
    const reportPath = await ensureReportFile(reportRelativePath, {
      step: "T2109",
      status: "skipped",
      checkedAt: new Date().toISOString(),
      intake: {
        id: item.id,
        title: item.title,
      },
      reason: "already generated",
      generated_package: item.generated_package_id,
    });

    console.log(`phase21 import intake: ${item.id}`);
    console.log(`phase21 import report: ${reportPath}`);
    console.log("phase21 import status: skipped");
    return;
  }

  const validationIssues = collectValidationIssues(item);
  if (validationIssues.length > 0) {
    const message = summarizeValidationIssues(validationIssues);
    await writeGenerationFailure(updateItem, token, item.id, message);
    const reportPath = await ensureReportFile(reportRelativePath, {
      step: "T2109",
      status: "failed",
      checkedAt: new Date().toISOString(),
      intake: {
        id: item.id,
        title: item.title,
      },
      error: message,
      validationIssues,
    });

    console.log(`phase21 import intake: ${item.id}`);
    console.log(`phase21 import report: ${reportPath}`);
    console.log("phase21 import status: failed");
    throw new Error(message);
  }

  const plan = buildGenerationPlan(item);
  const createdItems = [];
  const startedAt = new Date().toISOString();

  try {
    let sourceId = null;
    let sourceMode = "created";

    const existingSource = await fetchSingleByField(
      token,
      "sources",
      "source_url",
      plan.source.payload.source_url
    );

    if (existingSource?.id) {
      await updateItem(token, "sources", existingSource.id, plan.source.payload);
      sourceId = existingSource.id;
      sourceMode = "reused";
    } else {
      const source = await createItem(token, "sources", plan.source.payload);
      sourceId = source.id;
      sourceMode = "created";
      createdItems.push({ collection: "sources", id: source.id });
    }

    const existingPackage = await fetchSingleByField(
      token,
      "packages",
      "slug",
      plan.package.payload.slug
    );
    if (existingPackage?.id) {
      throw new Error(`package slug already exists: ${plan.package.payload.slug}`);
    }

    const packageItem = await createItem(token, "packages", plan.package.payload);
    createdItems.push({ collection: "packages", id: packageItem.id });

    const packageSource = await createItem(token, "package_sources", {
      package_id: packageItem.id,
      source_id: sourceId,
      ...plan.package_source.payload,
    });
    createdItems.push({ collection: "package_sources", id: packageSource.id });

    const packageTopic = await createItem(token, "package_topics", {
      package_id: packageItem.id,
      topic_id: plan.package_topic.payload.topic_id,
      sort_order: plan.package_topic.payload.sort_order,
    });
    createdItems.push({ collection: "package_topics", id: packageTopic.id });

    for (const collectionPlan of plan.package_collections) {
      const collectionLink = await createItem(token, "package_collections", {
        package_id: packageItem.id,
        collection_id: collectionPlan.payload.collection_id,
        sort_order: collectionPlan.payload.sort_order,
      });
      createdItems.push({
        collection: "package_collections",
        id: collectionLink.id,
      });
    }

    for (const assetPlan of plan.processed_assets) {
      const asset = await createItem(token, "processed_assets", {
        package_id: packageItem.id,
        ...assetPlan.payload,
      });
      createdItems.push({ collection: "processed_assets", id: asset.id });
    }

    const generatedAt = new Date().toISOString();
    await writeGenerationSuccess(
      updateItem,
      token,
      item.id,
      packageItem.id,
      generatedAt
    );

    const reportPath = await ensureReportFile(reportRelativePath, {
      step: "T2109",
      status: "passed",
      startedAt,
      finishedAt: generatedAt,
      intake: {
        id: item.id,
        title: item.title,
      },
      source: {
        mode: sourceMode,
        id: sourceId,
      },
      package: {
        id: packageItem.id,
        slug: plan.package.payload.slug,
        workflow_state: plan.package.payload.workflow_state,
      },
      createdCounts: {
        packages: 1,
        package_sources: 1,
        package_topics: 1,
        package_collections: plan.package_collections.length,
        processed_assets: plan.processed_assets.length,
      },
      writeback: {
        generated_package_id: packageItem.id,
        generated_at: generatedAt,
        generation_status: "generated",
      },
      notes: [
        "source reuse by source_url enabled",
        "best-effort cleanup only applies when this script created partial records",
      ],
    });

    console.log(`phase21 import intake: ${item.id}`);
    console.log(`phase21 import report: ${reportPath}`);
    console.log(`phase21 import package: ${packageItem.id}`);
    console.log("phase21 import status: passed");
  } catch (error) {
    await cleanupCreated(token, createdItems);
    await writeGenerationFailure(updateItem, token, item.id, error.message);
    const reportPath = await ensureReportFile(reportRelativePath, {
      step: "T2109",
      status: "failed",
      checkedAt: new Date().toISOString(),
      intake: {
        id: item.id,
        title: item.title,
      },
      error: error.message,
      createdItems,
    });

    console.log(`phase21 import intake: ${item.id}`);
    console.log(`phase21 import report: ${reportPath}`);
    console.log("phase21 import status: failed");
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
