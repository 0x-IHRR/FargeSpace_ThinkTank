#!/usr/bin/env node

import process from "node:process";

import { loginAdmin, request } from "./lib/phase5_directus.mjs";
import {
  assertCondition,
  buildGenerationPlan,
  collectValidationIssues,
  ensureReportFile,
  fetchContentIntake,
} from "./lib/phase21_content_intake.mjs";

const contentIntakeId = process.env.CONTENT_INTAKE_ID ?? "";
const reportRelativePath =
  process.env.PHASE21_DRY_RUN_REPORT ?? "artifacts/phase21/content-intake-dry-run.json";

async function main() {
  assertCondition(contentIntakeId, "CONTENT_INTAKE_ID is required");

  const token = await loginAdmin();
  const item = await fetchContentIntake(token, request, contentIntakeId);
  assertCondition(Boolean(item), `content_intake not found: ${contentIntakeId}`);

  const validationIssues = collectValidationIssues(item);
  const plan = buildGenerationPlan(item);

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
      "duplicate source reuse not applied in T2108",
    ],
    plan,
  };

  const reportPath = await ensureReportFile(reportRelativePath, report);

  console.log(`phase21 dry-run intake: ${item.id}`);
  console.log(`phase21 dry-run report: ${reportPath}`);
  console.log(`phase21 dry-run status: ${report.status}`);
}

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
