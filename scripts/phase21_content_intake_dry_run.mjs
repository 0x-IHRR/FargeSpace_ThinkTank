#!/usr/bin/env node

import process from "node:process";
import { fileURLToPath } from "node:url";

import { loginAdmin, request } from "./lib/phase5_directus.mjs";
import {
  assertCondition,
  buildGenerationPlan,
  collectValidationIssues,
  ensureReportFile,
  fetchContentIntake,
  findExistingSourceByUrl,
} from "./lib/phase21_content_intake.mjs";

export async function runPhase21DryRun({
  contentIntakeId = process.env.CONTENT_INTAKE_ID ?? "",
  reportRelativePath =
    process.env.PHASE21_DRY_RUN_REPORT ?? "artifacts/phase21/content-intake-dry-run.json",
} = {}) {
  assertCondition(contentIntakeId, "CONTENT_INTAKE_ID is required");

  const token = await loginAdmin();
  const item = await fetchContentIntake(token, request, contentIntakeId);
  assertCondition(Boolean(item), `content_intake not found: ${contentIntakeId}`);

  const validationIssues = collectValidationIssues(item);
  const plan = buildGenerationPlan(item);
  const sourceLookup = await findExistingSourceByUrl(
    token,
    request,
    plan.source_lookup.raw_url,
    plan.source.payload.platform
  );

  const report = {
    step: "T2108",
    status: validationIssues.length > 0 ? "blocked" : "passed",
    checkedAt: new Date().toISOString(),
    intake: {
      id: item.id,
      title: item.title,
      generation_status: item.generation_status,
    },
    validationIssues,
    notes: [
      "dry-run only",
      "no database writes",
      "source duplicate detection preview included",
    ],
    sourceLookup: {
      action: sourceLookup.source?.id ? "reuse" : "create",
      match_type: sourceLookup.match_type,
      raw_url: plan.source_lookup.raw_url,
      normalized_url: sourceLookup.normalized_url,
      candidates: sourceLookup.candidates,
      existing_source: sourceLookup.source
        ? {
            id: sourceLookup.source.id,
            title: sourceLookup.source.title,
            platform: sourceLookup.source.platform,
            source_url: sourceLookup.source.source_url,
          }
        : null,
    },
    publish: plan.publish,
    plan,
  };

  const reportPath = await ensureReportFile(reportRelativePath, report);

  return {
    intakeId: item.id,
    reportPath,
    report,
  };
}

async function main() {
  const result = await runPhase21DryRun();
  console.log(`phase21 dry-run intake: ${result.intakeId}`);
  console.log(`phase21 dry-run report: ${result.reportPath}`);
  console.log(`phase21 dry-run status: ${result.report.status}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const reportRelativePath =
    process.env.PHASE21_DRY_RUN_REPORT ?? "artifacts/phase21/content-intake-dry-run.json";
  main().catch(async (error) => {
    await ensureReportFile(reportRelativePath, {
      step: "T2108",
      status: "failed",
      checkedAt: new Date().toISOString(),
      error: error.message,
    });
    console.error(error.message);
    process.exitCode = 1;
  });
}
