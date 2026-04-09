#!/usr/bin/env node

import { spawn } from "node:child_process";
import process from "node:process";

const directusUrl = process.env.DIRECTUS_URL ?? "http://localhost:8055";

function runCommand(command, args, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", (error) => {
      reject(new Error(`${label} failed to start: ${error.message}`));
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${label} failed with exit code ${code}`));
    });
  });
}

async function checkDirectusHealth() {
  const response = await fetch(`${directusUrl}/server/health`);
  if (!response.ok) {
    throw new Error(`directus health check failed: ${response.status}`);
  }
}

async function main() {
  await checkDirectusHealth();
  await runCommand("npm", ["run", "typecheck"], "typecheck");
  await runCommand("npm", ["run", "build"], "build");
  await runCommand("node", ["scripts/verify_phase10_pages.mjs"], "T1001");
  await runCommand("node", ["scripts/verify_phase10_roles.mjs"], "T1002");
  await runCommand(
    "node",
    ["scripts/verify_phase10_publish_visibility.mjs"],
    "T1003"
  );
  await runCommand("node", ["scripts/verify_phase10_media_mix.mjs"], "T1004");
  await runCommand("node", ["scripts/verify_phase10_mobile.mjs"], "T1005");

  console.log("phase10 T1006 smoke test passed");
  console.log(
    "smoke_scope: directus health, typecheck, build, T1001, T1002, T1003, T1004, T1005"
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
