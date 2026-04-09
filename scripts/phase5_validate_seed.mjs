#!/usr/bin/env node

import process from "node:process";
import {
  ensureReportFile,
  loadAndValidateSeed,
  resolveProjectPath,
} from "./lib/phase5_seed.mjs";

const csvPath = resolveProjectPath(
  process.env.PHASE5_SEED_CSV ?? "CONTENT_SEED_20.csv"
);
const reportPath = resolveProjectPath(
  process.env.PHASE5_VALIDATE_REPORT ?? "artifacts/phase5/validate-report.json"
);

async function main() {
  const startedAt = new Date().toISOString();
  const { errors, warnings, normalizedRows } = await loadAndValidateSeed(csvPath);
  const payload = {
    step: "T501",
    status: errors.length === 0 ? "passed" : "failed",
    csvPath,
    checkedAt: new Date().toISOString(),
    totalRows: normalizedRows.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
  };

  await ensureReportFile(reportPath, payload);

  console.log(`phase5 validate started: ${startedAt}`);
  console.log(`csv: ${csvPath}`);
  console.log(`rows: ${normalizedRows.length}`);
  console.log(`errors: ${errors.length}`);
  console.log(`warnings: ${warnings.length}`);
  console.log(`report: ${reportPath}`);

  if (errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("phase5 validate passed");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
