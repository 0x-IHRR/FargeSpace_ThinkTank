#!/usr/bin/env node

import process from "node:process";

import { loginAdmin, request } from "./lib/phase5_directus.mjs";
import { ensureReportFile } from "./lib/phase21_content_intake.mjs";
import { runPhase21DryRun } from "./phase21_content_intake_dry_run.mjs";
import { runPhase21Import } from "./phase21_content_intake_import.mjs";

const requiredCollections = [
  "content_intake",
  "packages",
  "sources",
  "processed_assets",
  "package_sources",
  "package_topics",
  "package_collections",
];

const requiredContentIntakeFields = [
  "title",
  "summary",
  "primary_topic_id",
  "member_tier_id",
  "collection_ids",
  "cover_file_id",
  "source_type",
  "source_platform",
  "source_url",
  "source_title",
  "source_author",
  "source_language",
  "source_published_at",
  "source_thumbnail_file_id",
  "brief_title",
  "brief_body_markdown",
  "brief_file_id",
  "audio_file_id",
  "audio_external_url",
  "slides_file_id",
  "slides_external_url",
  "video_file_id",
  "video_external_url",
  "publish_mode",
  "publish_start_at",
  "package_type",
  "difficulty",
  "use_case",
  "signal_level",
  "raw_source_visible",
  "generation_status",
  "generated_package_id",
  "generated_at",
  "generation_error",
];

const requiredPermissionMatrix = {
  content_intake: ["create", "read", "update"],
  directus_files: ["create", "read", "update"],
};

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchCollection(token, collection) {
  const { payload } = await request(`/collections/${collection}`, { token });
  return payload.data;
}

async function fetchFields(token, collection) {
  const { payload } = await request(`/fields/${collection}`, { token });
  return payload.data ?? [];
}

async function findRole(token, roleName, roleId) {
  if (roleId) {
    const { payload } = await request(`/roles/${roleId}`, { token });
    return payload.data;
  }

  const { payload } = await request(
    `/roles?limit=1&filter[name][_eq]=${encodeURIComponent(roleName)}`,
    { token }
  );
  return payload.data?.[0] ?? null;
}

async function fetchPermissions(token, roleId) {
  const { payload } = await request(
    `/permissions?limit=-1&filter[role][_eq]=${encodeURIComponent(roleId)}`,
    { token }
  );
  return payload.data ?? [];
}

async function verifyCollections(token) {
  const items = [];
  for (const collection of requiredCollections) {
    const record = await fetchCollection(token, collection);
    assertCondition(record?.collection === collection, `missing collection: ${collection}`);
    items.push(collection);
  }
  return items;
}

async function verifyFields(token) {
  const fields = await fetchFields(token, "content_intake");
  const fieldNames = new Set(fields.map((field) => field.field));
  for (const field of requiredContentIntakeFields) {
    assertCondition(fieldNames.has(field), `content_intake missing field: ${field}`);
  }

  return {
    collection: "content_intake",
    fieldCount: requiredContentIntakeFields.length,
  };
}

async function verifyPermissions(token) {
  const roleName = process.env.CONTENT_OPERATOR_ROLE_NAME ?? "Content Operator";
  const roleId = process.env.CONTENT_OPERATOR_ROLE_ID ?? "";
  const role = await findRole(token, roleName, roleId);
  assertCondition(role?.id, `missing role: ${roleId || roleName}`);

  const permissions = await fetchPermissions(token, role.id);
  const available = new Set(
    permissions.map((permission) => `${permission.collection}:${permission.action}`)
  );

  for (const [collection, actions] of Object.entries(requiredPermissionMatrix)) {
    for (const action of actions) {
      assertCondition(
        available.has(`${collection}:${action}`),
        `missing permission: ${collection}:${action} for role ${role.name}`
      );
    }
  }

  return {
    roleId: role.id,
    roleName: role.name,
    checked: Object.entries(requiredPermissionMatrix).flatMap(([collection, actions]) =>
      actions.map((action) => `${collection}:${action}`)
    ),
  };
}

async function verifyDryRun(contentIntakeId) {
  assertCondition(contentIntakeId, "CONTENT_INTAKE_ID is required for dry-run verification");
  const result = await runPhase21DryRun({
    contentIntakeId,
    reportRelativePath: "artifacts/phase21/content-intake-verify-dry-run.json",
  });
  assertCondition(result.report.status === "passed", "phase21 dry-run did not pass");
  return {
    intakeId: result.intakeId,
    reportPath: result.reportPath,
    status: result.report.status,
  };
}

async function verifyImport(contentIntakeId) {
  const enabled = process.env.PHASE21_VERIFY_IMPORT === "1";
  if (!enabled) {
    return {
      status: "skipped",
      reason: "set PHASE21_VERIFY_IMPORT=1 to run a real write check",
    };
  }

  assertCondition(contentIntakeId, "CONTENT_INTAKE_ID is required for import verification");
  const result = await runPhase21Import({
    contentIntakeId,
    reportRelativePath: "artifacts/phase21/content-intake-verify-import.json",
  });
  assertCondition(
    result.status === "passed" || result.status === "skipped",
    "phase21 import did not complete normally"
  );

  return {
    intakeId: result.intakeId,
    reportPath: result.reportPath,
    status: result.status,
    packageId: result.packageId ?? null,
  };
}

async function main() {
  const token = await loginAdmin();
  const contentIntakeId = process.env.CONTENT_INTAKE_ID ?? "";

  const report = {
    step: "T2114",
    checkedAt: new Date().toISOString(),
    collections: await verifyCollections(token),
    fields: await verifyFields(token),
    permissions: await verifyPermissions(token),
    dryRun: await verifyDryRun(contentIntakeId),
    importCheck: await verifyImport(contentIntakeId),
  };

  const reportPath = await ensureReportFile(
    "artifacts/phase21/content-intake-verify.json",
    report
  );

  console.log("phase21 content intake verify passed");
  console.log(`verify_report: ${reportPath}`);
  console.log(`collections_checked: ${report.collections.length}`);
  console.log(`fields_checked: ${report.fields.fieldCount}`);
  console.log(`permissions_role: ${report.permissions.roleName}`);
  console.log(`dry_run_status: ${report.dryRun.status}`);
  console.log(`import_status: ${report.importCheck.status}`);
}

main().catch(async (error) => {
  await ensureReportFile("artifacts/phase21/content-intake-verify.json", {
    step: "T2114",
    checkedAt: new Date().toISOString(),
    status: "failed",
    error: error.message,
  });
  console.error(error.message);
  process.exitCode = 1;
});
